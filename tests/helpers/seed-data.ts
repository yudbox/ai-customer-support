/**
 * Seed Helpers for Test Data
 *
 * Удобные функции для создания тестовых данных в БД
 * Используют faker для реалистичных данных
 */

import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";

import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import { Order, OrderStatus } from "@/lib/database/entities/Order";
import { Team } from "@/lib/database/entities/Team";
import { Ticket, TicketPriority } from "@/lib/database/entities/Ticket";
import { TicketStatus, TeamName } from "@/lib/types/common";

/**
 * Создать customer в test БД
 * @param dataSource - Test DataSource
 * @param overrides - Переопределить дефолтные значения
 * @returns Сохранённый Customer entity
 */
export async function seedCustomer(
  dataSource: DataSource,
  overrides?: Partial<Customer>,
): Promise<Customer> {
  const repo = dataSource.getRepository(Customer);

  const customer = repo.create({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    tier: faker.helpers.arrayElement([
      CustomerTier.VIP,
      CustomerTier.REGULAR,
      CustomerTier.NEW,
    ]),
    total_orders: faker.number.int({ min: 0, max: 50 }),
    lifetime_value: faker.number.float({
      min: 0,
      max: 10000,
      fractionDigits: 2,
    }),
    total_spent: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
    avg_order_value: faker.number.float({
      min: 0,
      max: 500,
      fractionDigits: 2,
    }),
    ...overrides,
  });

  return await repo.save(customer);
}

/**
 * Создать order в test БД
 * @param dataSource - Test DataSource
 * @param customerId - ID customer'а
 * @param overrides - Переопределить дефолтные значения
 * @returns Сохранённый Order entity
 */
export async function seedOrder(
  dataSource: DataSource,
  customerId: string,
  overrides?: Partial<Order>,
): Promise<Order> {
  const repo = dataSource.getRepository(Order);

  const order = repo.create({
    order_number: `ORD-${faker.string.numeric(8)}`,
    customer_id: customerId,
    total_price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
    status: faker.helpers.arrayElement([
      OrderStatus.PENDING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ]),
    ...overrides,
  });

  return await repo.save(order);
}

/**
 * Создать ticket в test БД
 * @param dataSource - Test DataSource
 * @param customerId - ID customer'а
 * @param overrides - Переопределить дефолтные значения
 * @returns Сохранённый Ticket entity
 */
export async function seedTicket(
  dataSource: DataSource,
  customerId: string,
  overrides?: Partial<Ticket>,
): Promise<Ticket> {
  const repo = dataSource.getRepository(Ticket);

  const ticket = repo.create({
    ticket_number: `TKT-${faker.string.numeric(8)}`,
    customer_id: customerId,
    subject: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    status: TicketStatus.OPEN,
    priority: faker.helpers.arrayElement([
      TicketPriority.LOW,
      TicketPriority.MEDIUM,
      TicketPriority.HIGH,
      TicketPriority.CRITICAL,
    ]),
    ...overrides,
  });

  return await repo.save(ticket);
}

/**
 * Создать team в test БД
 * @param dataSource - Test DataSource
 * @param overrides - Переопределить дефолтные значения
 * @returns Сохранённый Team entity
 */
export async function seedTeam(
  dataSource: DataSource,
  overrides?: Partial<Team>,
): Promise<Team> {
  const repo = dataSource.getRepository(Team);

  const team = repo.create({
    name: faker.helpers.arrayElement([
      TeamName.TECHNICAL_SUPPORT,
      TeamName.BILLING_PAYMENTS,
      TeamName.RETURNS_REFUNDS,
    ]),
    members: [faker.person.fullName(), faker.person.fullName()],
    ...overrides,
  });

  return await repo.save(team);
}

/**
 * Создать pending approval ticket (с thread_id)
 * Специализированный helper для тестирования approve flow
 */
export async function seedPendingApprovalTicket(
  dataSource: DataSource,
  customerId: string,
  overrides?: Partial<Ticket>,
): Promise<Ticket> {
  const ticket = await seedTicket(dataSource, customerId, {
    status: TicketStatus.PENDING_APPROVAL,
    thread_id: `thread-${faker.string.uuid()}`,
    ...overrides,
  });

  // ✅ Create entry in ticket_workflow_states
  // This is required because findPendingApproval does JOIN with this table
  const workflowStateRepo = dataSource.getRepository("TicketWorkflowState");
  await workflowStateRepo.save({
    thread_id: ticket.thread_id,
    checkpoint_id: faker.string.uuid(),
    checkpoint_data: { v: 1, ts: Date.now(), channel_values: {} }, // Minimal checkpoint data
    created_at: new Date(),
  });

  return ticket;
}

/**
 * Создать complete ticket setup (customer + order + ticket)
 * Удобный helper для быстрой настройки связанных данных
 */
export async function seedCompleteTicketSetup(
  dataSource: DataSource,
  overrides?: {
    customer?: Partial<Customer>;
    order?: Partial<Order>;
    ticket?: Partial<Ticket>;
  },
): Promise<{ customer: Customer; order: Order; ticket: Ticket }> {
  const customer = await seedCustomer(dataSource, overrides?.customer);
  const order = await seedOrder(dataSource, customer.id, overrides?.order);
  const ticket = await seedTicket(dataSource, customer.id, {
    order_id: order.id,
    ...overrides?.ticket,
  });

  return { customer, order, ticket };
}

/**
 * Bulk seed - создать несколько tickets сразу
 * Оптимизировано для performance (bulk insert)
 */
export async function seedMultipleTickets(
  dataSource: DataSource,
  count: number,
  overrides?: Partial<Ticket>,
): Promise<Ticket[]> {
  const ticketRepo = dataSource.getRepository(Ticket);
  const customerRepo = dataSource.getRepository(Customer);

  // Create customers (one customer per 3 tickets)
  const customersCount = Math.ceil(count / 3);
  const customers = await customerRepo.save(
    Array.from({ length: customersCount }, () => ({
      email: faker.internet.email(),
      name: faker.person.fullName(),
      tier: faker.helpers.arrayElement([
        CustomerTier.VIP,
        CustomerTier.REGULAR,
        CustomerTier.NEW,
      ]),
    })),
  );

  // Create tickets bulk insert
  const tickets = await ticketRepo.save(
    Array.from({ length: count }, (_, i) => ({
      ticket_number: `TKT-${String(i).padStart(8, "0")}`,
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(Object.values(TicketStatus)),
      customer_id: faker.helpers.arrayElement(customers).id,
      ...overrides,
    })),
  );

  return tickets;
}
