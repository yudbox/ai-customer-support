/**
 * Pinecone Upsert Factory
 *
 * Фабрика для генерации реалистичных ответов от Pinecone Upsert API
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

/**
 * Types
 */
export interface PineconeUpsertResponse {
  upsertedCount: number;
}

/**
 * Factory
 */
export const pineconeUpsertFactory = Factory.define<PineconeUpsertResponse>(
  () => ({
    upsertedCount: faker.number.int({ min: 1, max: 100 }),
  }),
);
