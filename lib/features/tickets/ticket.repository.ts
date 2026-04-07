import { getDataSource } from "@/lib/database/connection";
import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import { Order } from "@/lib/database/entities/Order";
import { Team } from "@/lib/database/entities/Team";
import { Ticket, TicketPriority } from "@/lib/database/entities/Ticket";
import { TicketStatus } from "@/lib/types/common";

/**
 * Type для pending ticket row из SQL запроса
 */
export interface PendingTicketRow {
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

/**
 * Interface для создания тикета
 */
export interface CreateTicketData {
  ticket_number: string;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer_id: string;
  order_id?: string;
}

/**
 * TicketRepository - слой доступа к данным для тикетов
 * Отвечает за все операции с БД (SQL, TypeORM)
 */
export class TicketRepository {
  /**
   * Найти тикеты, ожидающие одобрения (pending approval)
   * Использует raw SQL для JOIN с workflow states
   * @returns Массив тикетов с активными checkpoints
   */
  async findPendingApproval(): Promise<PendingTicketRow[]> {
    const connection = await getDataSource();

    // ✅ Find tickets with active checkpoints in ticket_workflow_states
    // This is more accurate than status, since checkpoint is created with interruptAfter: [WAIT_APPROVAL]
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

    return tickets;
  }

  /**
   * Найти тикет по ID с relations (customer, order)
   * @param ticketId - ID тикета
   * @returns Ticket entity с загруженными relations или null
   */
  async findByIdWithRelations(ticketId: string): Promise<Ticket | null> {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    const ticket = await ticketRepo.findOne({
      where: { id: ticketId },
      relations: ["customer", "order"],
    });

    return ticket;
  }

  /**
   * Найти customer по email
   * @param email - Email customer'а
   * @returns Customer entity или null
   */
  async findCustomerByEmail(email: string): Promise<Customer | null> {
    const connection = await getDataSource();
    const customerRepo = connection.getRepository(Customer);

    return customerRepo.findOne({ where: { email } });
  }

  /**
   * Создать нового customer
   * @param data - Данные для создания
   * @returns Созданный Customer entity
   */
  async createCustomer(data: {
    name: string;
    email: string;
    tier: CustomerTier;
  }): Promise<Customer> {
    const connection = await getDataSource();
    const customerRepo = connection.getRepository(Customer);

    const customer = customerRepo.create({
      name: data.name,
      email: data.email,
      tier: data.tier,
      total_orders: 0,
      total_spent: 0,
      lifetime_value: 0,
    });

    return customerRepo.save(customer);
  }

  /**
   * Найти order по номеру
   * @param orderNumber - Номер заказа
   * @returns Order entity или null
   */
  async findOrderByNumber(orderNumber: string): Promise<Order | null> {
    const connection = await getDataSource();
    const orderRepo = connection.getRepository(Order);

    return orderRepo.findOne({ where: { order_number: orderNumber } });
  }

  /**
   * Создать новый тикет
   * @param data - Данные для создания
   * @returns Созданный Ticket entity
   */
  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    const ticket = ticketRepo.create(data);
    return ticketRepo.save(ticket);
  }

  /**
   * Обновить thread_id для тикета
   * @param ticketId - ID тикета
   * @param threadId - Thread ID для workflow
   */
  async updateTicketThreadId(
    ticketId: string,
    threadId: string,
  ): Promise<void> {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    await ticketRepo.update({ id: ticketId }, { thread_id: threadId });
  }

  /**
   * Найти тикет по ID (без relations)
   * @param ticketId - ID тикета
   * @returns Ticket entity или null
   */
  async findById(ticketId: string): Promise<Ticket | null> {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    return ticketRepo.findOne({ where: { id: ticketId } });
  }

  /**
   * Обновить тикет
   * @param ticketId - ID тикета
   * @param data - Данные для обновления
   */
  async updateTicket(ticketId: string, data: Partial<Ticket>): Promise<void> {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    await ticketRepo.update({ id: ticketId }, data);
  }

  /**
   * Сохранить тикет (для сложных обновлений)
   * @param ticket - Ticket entity для сохранения
   */
  async saveTicket(ticket: Ticket): Promise<Ticket> {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    return ticketRepo.save(ticket);
  }

  /**
   * Найти team по имени
   * @param teamName - Название команды
   * @returns Team entity или null
   */
  async findTeamByName(teamName: string): Promise<Team | null> {
    const connection = await getDataSource();
    const teamRepo = connection.getRepository(Team);

    return teamRepo.findOne({ where: { name: teamName } });
  }

  /**
   * Очистить thread_id для тикета (set to NULL)
   * @param ticketId - ID тикета
   */
  async clearTicketThreadId(ticketId: string): Promise<void> {
    const connection = await getDataSource();
    const ticketRepo = connection.getRepository(Ticket);

    // Use raw SQL to ensure NULL is set
    await ticketRepo
      .createQueryBuilder()
      .update()
      .set({ thread_id: () => "NULL" })
      .where("id = :id", { id: ticketId })
      .execute();
  }
}

export const ticketRepository = new TicketRepository();
