import { z } from "zod";
import { router, publicProcedure } from "../server";
import { getDataSource } from "@/lib/database/connection";
import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from "@/lib/database/entities/Ticket";
import { Order } from "@/lib/database/entities/Order";
import { ticketFormSchema } from "@/lib/validations/ticket-form-schema";

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
      const connection = await getDataSource();
      const customerRepo = connection.getRepository(Customer);
      const ticketRepo = connection.getRepository(Ticket);
      const orderRepo = connection.getRepository(Order);

      // Find or create customer by email
      let customer = await customerRepo.findOne({
        where: { email: input.email },
      });

      if (!customer) {
        // Extract name from email (before @)
        const name = input.email.split("@")[0];

        // Create new customer
        customer = customerRepo.create({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: input.email,
          tier: CustomerTier.NEW,
          total_orders: 0,
          total_spent: 0,
          lifetime_value: 0,
        });

        customer = await customerRepo.save(customer);
      }

      // Find order if order_number provided
      let order: Order | null = null;
      if (input.order_number) {
        order = await orderRepo.findOne({
          where: { order_number: input.order_number },
        });
      }

      // Generate ticket number
      const ticketNumber = generateTicketNumber();

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

      const savedTicket = await ticketRepo.save(ticket);

      // Return typed response
      return {
        ticket_number: savedTicket.ticket_number,
        id: savedTicket.id,
        status: savedTicket.status,
        created_at: savedTicket.created_at,
      };
    }),

  /**
   * Получить список pending approval тикетов для Manager Dashboard
   */
  getPendingApproval: publicProcedure.query(async () => {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    const tickets = await ticketRepo.find({
      where: { status: TicketStatus.PENDING_APPROVAL },
      relations: ["customer"],
      order: { priority_score: "DESC", created_at: "DESC" },
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      priority_score: ticket.priority_score,
      customer_tier: ticket.customer?.tier,
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
   */
  approve: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const connection = await getDataSource();
      const ticketRepo = connection.getRepository(Ticket);

      const ticket = await ticketRepo.findOne({ where: { id: input.id } });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      // Update ticket
      ticket.status = TicketStatus.IN_PROGRESS;

      await ticketRepo.save(ticket);

      return {
        success: true,
        ticket_number: ticket.ticket_number,
      };
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

      // Update ticket
      ticket.status = TicketStatus.CLOSED;
      ticket.resolution = `Rejected by manager: ${input.reason}`;

      await ticketRepo.save(ticket);

      return {
        success: true,
        ticket_number: ticket.ticket_number,
      };
    }),
});
