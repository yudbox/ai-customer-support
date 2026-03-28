import { z } from "zod";
import { router, publicProcedure } from "../server";
import { getDataSource } from "@/lib/database/connection";
import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import { Ticket, TicketPriority } from "@/lib/database/entities/Ticket";
import { TicketStatus } from "@/lib/types/common";
import { Order } from "@/lib/database/entities/Order";
import { ticketFormSchema } from "@/lib/validations/ticket-form-schema";
// import { runWorkflowForTicketId } from "@/lib/langgraph/workflow";

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

      // Запустить Intake Agent workflow (fire-and-forget)
      // runWorkflowForTicketId(savedTicket.id).catch((err) => {
      //   console.error("Workflow error:", err);
      // });

      // Return typed response сразу
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
      ticket.status = TicketStatus.REJECTED;
      ticket.resolution = `Rejected by manager: ${input.reason}`;

      await ticketRepo.save(ticket);

      return {
        success: true,
        ticket_number: ticket.ticket_number,
      };
    }),
});
