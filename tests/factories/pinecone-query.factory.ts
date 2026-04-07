/**
 * Pinecone Query Factory
 *
 * Фабрика для генерации реалистичных ответов от Pinecone Query API
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

import {
  pineconeMatchFactory,
  type PineconeMatch,
} from "./pinecone-match.factory";

/**
 * Types
 */
export interface PineconeQueryResponse {
  matches: PineconeMatch[];
  namespace: string;
}

/**
 * Factory
 */
export const pineconeQueryFactory = Factory.define<PineconeQueryResponse>(
  () => ({
    matches: pineconeMatchFactory.buildList(
      faker.number.int({ min: 1, max: 5 }),
    ),
    namespace: "",
  }),
);

/**
 * Helper функция для создания query response с конкретным количеством совпадений
 */
export function createPineconeMatches(
  count: number,
  minScore = 0.7,
): PineconeQueryResponse {
  return {
    matches: pineconeMatchFactory.buildList(count, {
      score: faker.number.float({ min: minScore, max: 1.0, fractionDigits: 2 }),
    }),
    namespace: "",
  };
}
