import { pineconeIndex, PINECONE_NAMESPACE } from "@/lib/clients/pinecone";
import { CustomerTier } from "@/lib/database/entities/Customer";
import { Ticket, TicketPriority } from "@/lib/database/entities/Ticket";
import { resumeWorkflow } from "@/lib/langgraph/workflow";
import {
  createEmbedding,
  formatTicketForEmbedding,
} from "@/lib/services/embeddings";
import { TicketStatus, TeamName, TeamCode } from "@/lib/types/common";

import { TicketRepository, ticketRepository } from "./ticket.repository";

/**
 * Interface для input создания тикета (из формы)
 */
export interface CreateTicketInput {
  email: string;
  subject: string;
  body: string;
  order_number?: string;
}

/**
 * Interface для input approve тикета
 */
export interface ApproveTicketInput {
  id: string;
  assigned_team: string;
  assigned_to?: string;
  resolution?: string;
}

/**
 * Interface для input reject тикета
 */
export interface RejectTicketInput {
  id: string;
  reason: string;
}

/**
 * Team code to Team name mapping
 */
const TEAM_NAME_MAP: Record<string, TeamName> = {
  [TeamCode.TECHNICAL_SUPPORT]: TeamName.TECHNICAL_SUPPORT,
  [TeamCode.CUSTOMER_SERVICE]: TeamName.TECHNICAL_SUPPORT,
  [TeamCode.BILLING]: TeamName.BILLING_PAYMENTS,
  [TeamCode.BILLING_TEAM]: TeamName.BILLING_PAYMENTS,
  [TeamCode.ESCALATION]: TeamName.TECHNICAL_SUPPORT,
  [TeamCode.LOGISTICS_TEAM]: TeamName.SHIPPING_DELIVERY,
  [TeamCode.SHIPPING_TEAM]: TeamName.SHIPPING_DELIVERY,
  [TeamCode.RETURNS_TEAM]: TeamName.RETURNS_REFUNDS,
  [TeamCode.PRODUCT_ISSUES]: TeamName.PRODUCT_ISSUES,
  [TeamCode.ACCOUNT_MANAGEMENT]: TeamName.ACCOUNT_MANAGEMENT,
};

/**
 * Generate ticket number: TKT-YYYY-MMDD-XXXX
 */
function generateTicketNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `TKT-${year}-${month}${day}-${random}`;
}

/**
 * TicketService - бизнес-логика для работы с тикетами
 * Использует Repository для доступа к данным
 */
export class TicketService {
  constructor(private repository: TicketRepository = ticketRepository) {}

  /**
   * Создать новый тикет
   * Автоматически создает customer если его нет в системе
   * @param input - Данные из формы создания тикета
   * @returns DTO объект с созданным тикетом
   */
  async createTicket(input: CreateTicketInput) {
    // Find or create customer by email
    let customer = await this.repository.findCustomerByEmail(input.email);

    if (!customer) {
      // Extract name from email (before @)
      const name = input.email.split("@")[0];
      customer = await this.repository.createCustomer({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: input.email,
        tier: CustomerTier.NEW,
      });
    }

    // Find order if order_number provided
    let orderId: string | undefined;
    if (input.order_number) {
      const order = await this.repository.findOrderByNumber(input.order_number);
      orderId = order?.id;
    }

    // Generate ticket number
    const ticketNumber = generateTicketNumber();

    // Create ticket
    const ticket = await this.repository.createTicket({
      ticket_number: ticketNumber,
      subject: input.subject,
      body: input.body,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      customer_id: customer.id,
      order_id: orderId,
    });

    // Generate thread_id for LangGraph checkpoint (Phase 1: MVP approach)
    const threadId = `ticket-${ticket.id}`;
    await this.repository.updateTicketThreadId(ticket.id, threadId);

    // Return typed response
    return {
      ticket_number: ticket.ticket_number,
      id: ticket.id,
      status: ticket.status,
      created_at: ticket.created_at,
    };
  }

  /**
   * Получить список pending approval тикетов для Manager Dashboard
   * Ищет тикеты с активными checkpoints (workflow остановлен на WAIT_APPROVAL)
   * @returns Массив тикетов, ожидающих одобрения менеджера
   */
  async getPendingApprovalTickets() {
    const tickets = await this.repository.findPendingApproval();

    return tickets.map((ticket) => ({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      priority_score: ticket.priority_score,
      customer_tier: ticket.customer_tier,
      sentiment_label: ticket.sentiment_label,
      created_at: ticket.created_at,
    }));
  }

  /**
   * Получить полные детали тикета по ID
   * @param ticketId - ID тикета
   * @returns Объект с деталями тикета, включая customer и order
   * @throws Error если тикет не найден
   */
  async getTicketDetails(ticketId: string) {
    const ticket = await this.repository.findByIdWithRelations(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return this.mapTicketToDTO(ticket);
  }

  /**
   * Approve тикет (Manager action)
   * Phase 1: Uses thread_id to resume workflow from checkpoint
   * @param input - Данные для approve
   * @returns Success response с ticket_number
   * @throws Error если тикет не найден
   */
  async approveTicket(input: ApproveTicketInput) {
    const ticket = await this.repository.findById(input.id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const threadId = ticket.thread_id;

    // 🔄 Resume workflow from checkpoint
    if (threadId) {
      // Resume workflow with new data
      await resumeWorkflow(threadId, {
        resolution: input.resolution,
        assigned_team: input.assigned_team,
        needs_approval: false, // 🔓 unlock workflow
      });

      // 🔄 Reload ticket to get workflow updates
      const updatedTicket = await this.repository.findByIdWithRelations(
        input.id,
      );

      if (!updatedTicket) {
        throw new Error("Ticket not found after workflow resume");
      }

      // Manually update ticket fields (workflow already completed, won't re-run)
      updatedTicket.status = TicketStatus.RESOLVED;
      updatedTicket.assigned_team = input.assigned_team;
      if (input.resolution) {
        updatedTicket.resolution = input.resolution;
      }

      // Only add assigned_to if not already set by workflow
      if (!updatedTicket.assigned_to) {
        const assignedTo = await this.assignTeamMember(input.assigned_team);
        if (assignedTo) {
          updatedTicket.assigned_to = assignedTo;
        }
      }

      // Save all updates
      await this.repository.saveTicket(updatedTicket);

      // Clear thread_id (workflow completed)
      await this.repository.clearTicketThreadId(updatedTicket.id);

      return {
        success: true,
        ticket_number: updatedTicket.ticket_number,
      };
    } else {
      // Fallback: manual approval without workflow
      ticket.status = TicketStatus.IN_PROGRESS;
      ticket.assigned_team = input.assigned_team;
      if (input.resolution) {
        ticket.resolution = input.resolution;
      }

      await this.repository.saveTicket(ticket);

      return {
        success: true,
        ticket_number: ticket.ticket_number,
      };
    }
  }

  /**
   * Assign random team member based on team code
   * @param teamCode - Team code from input
   * @returns Assigned team member name or null
   */
  private async assignTeamMember(teamCode: string): Promise<string | null> {
    // Map team code to Team entity name
    const teamName = TEAM_NAME_MAP[teamCode] || TeamName.TECHNICAL_SUPPORT;
    const team = await this.repository.findTeamByName(teamName);

    if (team && team.members && team.members.length > 0) {
      const randomIndex = Math.floor(Math.random() * team.members.length);
      return team.members[randomIndex];
    }

    return null;
  }

  /**
   * Reject тикет (Manager action)
   * @param input - Данные для reject
   * @returns Success response с ticket_number
   * @throws Error если тикет не найден
   */
  async rejectTicket(input: RejectTicketInput) {
    const ticket = await this.repository.findById(input.id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Update ticket status and resolution
    ticket.status = TicketStatus.REJECTED;
    ticket.resolution = `Rejected by manager: ${input.reason}`;

    await this.repository.saveTicket(ticket);

    // Clear thread_id (workflow is terminated, no resume possible)
    if (ticket.thread_id) {
      await this.repository.clearTicketThreadId(ticket.id);
    }

    return {
      success: true,
      ticket_number: ticket.ticket_number,
    };
  }

  /**
   * Get AI recommendations for a ticket (queries Pinecone in real-time)
   * @param ticketId - ID тикета
   * @returns Similar tickets and suggested solution
   * @throws Error если тикет не найден
   */
  async getAIRecommendations(ticketId: string) {
    // Get ticket details
    const ticket = await this.repository.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    try {
      // Create embedding from ticket
      const embeddingText = formatTicketForEmbedding(
        ticket.subject,
        ticket.body,
        ticket.category,
      );

      const embedding = await createEmbedding(embeddingText);

      // Query Pinecone for similar tickets
      const queryResponse = await pineconeIndex
        .namespace(PINECONE_NAMESPACE)
        .query({
          vector: embedding,
          topK: 3,
          includeMetadata: true,
        });

      // Extract similar tickets
      const similar_tickets = queryResponse.matches
        .filter((match) => {
          return (
            match.id &&
            typeof match.id === "string" &&
            match.metadata?.subject &&
            match.metadata?.resolution
          );
        })
        .map((match) => ({
          id: match.id,
          subject: match.metadata!.subject as string,
          category: match.metadata!.category as string | undefined,
          resolution: match.metadata!.resolution as string,
          similarity: match.score ?? 0,
        }));

      // Get suggested solution (top match if similarity > 80%)
      let suggested_solution: string | undefined;
      if (similar_tickets.length > 0 && similar_tickets[0].similarity > 0.8) {
        suggested_solution = similar_tickets[0].resolution;
      }

      return {
        similar_tickets,
        suggested_solution,
      };
    } catch (_error) {
      return {
        similar_tickets: [],
        suggested_solution: undefined,
      };
    }
  }

  /**
   * Маппинг entity тикета в DTO для API response
   * @param ticket - Entity тикета из БД
   * @returns DTO объект для клиента
   */
  private mapTicketToDTO(ticket: Ticket) {
    return {
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      subject: ticket.subject,
      body: ticket.body,
      status: ticket.status,
      priority: ticket.priority,
      priority_score: ticket.priority_score,
      category: ticket.category,
      sentiment_label: ticket.sentiment_label,
      sentiment_score: ticket.sentiment_score
        ? Number(ticket.sentiment_score)
        : null,
      assigned_team: ticket.assigned_team,
      assigned_to: ticket.assigned_to,
      customer: ticket.customer
        ? {
            email: ticket.customer.email,
            name: ticket.customer.name,
            tier: ticket.customer.tier,
            total_orders: ticket.customer.total_orders,
            lifetime_value: Number(ticket.customer.lifetime_value),
          }
        : null,
      order: ticket.order
        ? {
            order_number: ticket.order.order_number,
            total_price: Number(ticket.order.total_price),
            status: ticket.order.status,
          }
        : null,
      created_at: ticket.created_at,
    };
  }
}

export const ticketService = new TicketService();
