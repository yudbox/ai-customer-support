import { z } from "zod";

import { pineconeIndex, PINECONE_NAMESPACE } from "@/lib/clients/pinecone";
import { getDataSource } from "@/lib/database/connection";
import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import { Order } from "@/lib/database/entities/Order";
import { Team } from "@/lib/database/entities/Team";
import { Ticket, TicketPriority } from "@/lib/database/entities/Ticket";
import { resumeWorkflow } from "@/lib/langgraph/workflow";
import {
  createEmbedding,
  formatTicketForEmbedding,
} from "@/lib/services/embeddings";
import { TicketStatus, TeamName, TeamCode } from "@/lib/types/common";
import { ticketFormSchema } from "@/lib/validations/ticket-form-schema";

import { router, publicProcedure } from "../server";

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
 * Tickets router
 * Содержит все процедуры для работы с тикетами
 */
export const ticketsRouter = router({
  /**
   * Создание нового тикета
   * Автоматически создает кастомера если его нет
   */
  create: publicProcedure
    .input(ticketFormSchema)
    .mutation(async ({ input }) => {
      console.log("[tickets.create] Handler START");
      const connection = await getDataSource();
      console.log("[tickets.create] Got DB connection");
      const customerRepo = connection.getRepository(Customer);
      const ticketRepo = connection.getRepository(Ticket);
      const orderRepo = connection.getRepository(Order);

      // Find or create customer by email

      console.log("[tickets.create] Looking for customer", input.email);
      let customer = await customerRepo.findOne({
        where: { email: input.email },
      });

      if (!customer) {
        console.log("[tickets.create] Customer not found, creating new");
        // Extract name from email (before @)
        const name = input.email.split("@")[0];
        customer = customerRepo.create({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: input.email,
          tier: CustomerTier.NEW,
          total_orders: 0,
          total_spent: 0,
          lifetime_value: 0,
        });
        customer = await customerRepo.save(customer);
        console.log("[tickets.create] New customer saved", customer.id);
      }

      // Find order if order_number provided

      let order: Order | null = null;
      if (input.order_number) {
        console.log("[tickets.create] Looking for order", input.order_number);
        order = await orderRepo.findOne({
          where: { order_number: input.order_number },
        });
        if (order) {
          console.log("[tickets.create] Order found", order.id);
        } else {
          console.log("[tickets.create] Order not found");
        }
      }

      // Generate ticket number

      const ticketNumber = generateTicketNumber();
      console.log("[tickets.create] Generated ticket number", ticketNumber);

      // Create ticket

      const ticket = ticketRepo.create({
        ticket_number: ticketNumber,
        subject: input.subject,
        body: input.body,
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        customer_id: customer.id,
        order_id: order?.id,
      });
      console.log("[tickets.create] Ticket entity created");

      const savedTicket = await ticketRepo.save(ticket);
      console.log("[tickets.create] Ticket saved", savedTicket.id);

      // Generate thread_id for LangGraph checkpoint (Phase 1: MVP approach)
      const threadId = `ticket-${savedTicket.id}`;
      savedTicket.thread_id = threadId;
      await ticketRepo.save(savedTicket);
      console.log("[tickets.create] thread_id generated and saved", threadId);

      // 🚀 Run workflow in background (fire-and-forget)
      // runWorkflowForTicketId(savedTicket.id).catch((err) => {
      //   console.error("[tickets.create] Workflow error:", err);
      // });

      // Return typed response immediately
      console.log("[tickets.create] Returning response");
      return {
        ticket_number: savedTicket.ticket_number,
        id: savedTicket.id,
        status: savedTicket.status,
        created_at: savedTicket.created_at,
      };
    }),

  /**
   * Получить список pending approval тикетов для Manager Dashboard
   * Ищет тикеты с активными checkpoints (workflow остановлен на WAIT_APPROVAL)
   */
  getPendingApproval: publicProcedure.query(async () => {
    const connection = await getDataSource();

    interface PendingTicketRow {
      id: string;
      ticket_number: string;
      subject: string;
      status: string;
      priority: string | null;
      priority_score: number | null;
      sentiment_label: string | null;
      created_at: Date;
      customer_email: string | null;
      customer_tier: string | null;
    }

    // ✅ Ищем тикеты с активными checkpoints в ticket_workflow_states
    // Это точнее чем status, т.к. checkpoint создается при interruptAfter: [WAIT_APPROVAL]
    const tickets: PendingTicketRow[] = await connection.query(`
      SELECT 
        t.id,
        t.ticket_number,
        t.subject,
        t.status,
        t.priority,
        t.priority_score,
        t.sentiment_label,
        t.created_at,
        c.email as customer_email,
        c.tier as customer_tier
      FROM tickets t
      INNER JOIN ticket_workflow_states tws ON tws.thread_id = t.thread_id
      LEFT JOIN customers c ON c.id = t.customer_id
      WHERE t.thread_id IS NOT NULL
      ORDER BY tws.created_at DESC
    `);

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
  }),

  /**
   * Получить полные детали тикета по ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const connection = await getDataSource();
      const ticketRepo = connection.getRepository(Ticket);

      const ticket = await ticketRepo.findOne({
        where: { id: input.id },
        relations: ["customer", "order"],
      });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

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
    }),

  /**
   * Approve тикет (Manager action)
   * Phase 1: Uses thread_id to resume workflow from checkpoint
   */
  approve: publicProcedure
    .input(
      z.object({
        id: z.string(),
        assigned_team: z.string(),
        assigned_to: z.string().optional(),
        resolution: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const connection = await getDataSource();
      const ticketRepo = connection.getRepository(Ticket);
      const teamRepo = connection.getRepository(Team);

      const ticket = await ticketRepo.findOne({ where: { id: input.id } });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      // Phase 1: Get thread_id for LangGraph workflow resume
      const threadId = ticket.thread_id;
      console.log(
        `[tickets.approve] thread_id for workflow resume: ${threadId}`,
      );

      // 🔄 Resume workflow from checkpoint
      if (threadId) {
        await resumeWorkflow(threadId, {
          resolution: input.resolution,
          assigned_team: input.assigned_team,
          needs_approval: false, // 🔓 unlock workflow
        });

        // 🔄 Reload ticket to get workflow updates
        const updatedTicket = await ticketRepo.findOne({
          where: { id: input.id },
          relations: ["customer"],
        });

        if (!updatedTicket) {
          throw new Error("Ticket not found after workflow resume");
        }

        // Only add assigned_to if not already set by workflow
        if (!updatedTicket.assigned_to) {
          // Map selected team code to Team entity name
          const teamNameMap: Record<string, TeamName> = {
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

          const teamName =
            teamNameMap[input.assigned_team] || TeamName.TECHNICAL_SUPPORT;
          const team = await teamRepo.findOne({ where: { name: teamName } });

          if (team && team.members.length > 0) {
            const randomIndex = Math.floor(Math.random() * team.members.length);
            updatedTicket.assigned_to = team.members[randomIndex];
            console.log(
              `✅ Assigned to ${team.name} → ${updatedTicket.assigned_to}`,
            );
          }
        }

        // Clear thread_id and update ticket
        console.log(
          `[tickets.approve] Clearing thread_id - workflow completed for ${updatedTicket.ticket_number}`,
        );

        // Update assigned_to if set
        if (updatedTicket.assigned_to) {
          await ticketRepo.update(updatedTicket.id, {
            assigned_to: updatedTicket.assigned_to,
          });
        }

        // Clear thread_id using raw SQL to ensure NULL is set
        await ticketRepo
          .createQueryBuilder()
          .update()
          .set({ thread_id: () => "NULL" })
          .where("id = :id", { id: updatedTicket.id })
          .execute();

        return {
          success: true,
          ticket_number: updatedTicket.ticket_number,
        };
      } else {
        console.warn(
          `[tickets.approve] No thread_id found - manual approval only`,
        );

        // Fallback: manual approval without workflow
        ticket.status = TicketStatus.IN_PROGRESS;
        ticket.assigned_team = input.assigned_team;
        if (input.resolution) {
          ticket.resolution = input.resolution;
        }

        await ticketRepo.save(ticket);

        return {
          success: true,
          ticket_number: ticket.ticket_number,
        };
      }
    }),

  /**
   * Reject тикет (Manager action)
   */
  reject: publicProcedure
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(async ({ input }) => {
      const connection = await getDataSource();
      const ticketRepo = connection.getRepository(Ticket);

      const ticket = await ticketRepo.findOne({ where: { id: input.id } });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      // Update ticket status and resolution
      ticket.status = TicketStatus.REJECTED;
      ticket.resolution = `Rejected by manager: ${input.reason}`;

      await ticketRepo.save(ticket);

      // Clear thread_id (workflow is terminated, no resume possible)
      if (ticket.thread_id) {
        console.log(
          `[tickets.reject] Clearing thread_id - workflow terminated for ${ticket.ticket_number}`,
        );

        await ticketRepo
          .createQueryBuilder()
          .update()
          .set({ thread_id: () => "NULL" })
          .where("id = :id", { id: ticket.id })
          .execute();
      }

      return {
        success: true,
        ticket_number: ticket.ticket_number,
      };
    }),

  /**
   * Get AI recommendations for a ticket (queries Pinecone in real-time)
   */
  getAIRecommendations: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ input }) => {
      const connection = await getDataSource();
      const ticketRepo = connection.getRepository(Ticket);

      // Get ticket details
      const ticket = await ticketRepo.findOne({
        where: { id: input.ticketId },
      });

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
      } catch (error) {
        console.error("Error fetching AI recommendations:", error);
        return {
          similar_tickets: [],
          suggested_solution: undefined,
        };
      }
    }),
});
