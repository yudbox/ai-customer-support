/**
 * Pinecone Match Factory
 *
 * Фабрика для генерации реалистичных совпадений от Pinecone Query API
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

/**
 * Types
 */
export interface PineconeMatch {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * Factory
 */
export const pineconeMatchFactory = Factory.define<PineconeMatch>(
  ({ sequence }) => ({
    id: `ticket-${faker.string.uuid()}`,
    score: faker.number.float({ min: 0.5, max: 1.0, fractionDigits: 2 }),
    metadata: {
      ticket_id: sequence.toString(),
      subject: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      priority: faker.helpers.arrayElement(["low", "medium", "high", "urgent"]),
      status: faker.helpers.arrayElement([
        "open",
        "pending",
        "resolved",
        "closed",
      ]),
      created_at: faker.date.recent().toISOString(),
    },
  }),
);
