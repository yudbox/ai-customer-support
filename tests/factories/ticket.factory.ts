/**
 * Ticket Factory for testing
 *
 * Фабрика для создания mock объектов Ticket entity
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import { Ticket } from "@/lib/database/entities/Ticket";
import { TicketStatus } from "@/lib/types/common";

export const ticketFactory = Factory.define<Ticket>(() => {
  const id = faker.string.uuid();
  const customerId = faker.string.uuid();

  const customer: Customer = {
    id: customerId,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    tier: faker.helpers.arrayElement([
      CustomerTier.VIP,
      CustomerTier.REGULAR,
      CustomerTier.NEW,
    ]),
    total_orders: faker.number.int({ min: 0, max: 100 }),
    lifetime_value: faker.number.float({
      min: 0,
      max: 10000,
      fractionDigits: 2,
    }),
    total_spent: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
    avg_order_value: faker.number.float({
      min: 0,
      max: 1000,
      fractionDigits: 2,
    }),
    created_at: faker.date.past(),
    orders: [],
    tickets: [],
  };

  return {
    id,
    ticket_number: `TCK-${faker.string.numeric(5)}`,
    customer_id: customerId,
    subject: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement([
      TicketStatus.OPEN,
      TicketStatus.PENDING_APPROVAL,
      TicketStatus.RESOLVED,
      TicketStatus.REJECTED,
    ]),
    priority_score: faker.number.int({ min: 0, max: 100 }),
    assigned_team: faker.helpers.arrayElement([
      "technical_support",
      "customer_service",
      "billing_team",
    ]),
    assigned_to: faker.internet.email(),
    resolution: faker.lorem.sentence(),
    thread_id: `thread-${faker.string.uuid()}`,
    customer,
    refunds: [],
    created_at: faker.date.past(),
  };
});
