/**
 * OpenAI Embeddings Factory
 *
 * Фабрика для генерации реалистичных ответов от OpenAI Embeddings API
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

/**
 * Types
 */
export interface OpenAIEmbeddingObject {
  object: string;
  embedding: number[];
  index: number;
}

export interface OpenAIEmbeddingResponse {
  object: string;
  data: OpenAIEmbeddingObject[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Constants
 */
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Factory
 */
export const openaiEmbeddingFactory = Factory.define<OpenAIEmbeddingResponse>(
  ({ sequence }) => {
    return {
      object: "list",
      data: [
        {
          object: "embedding",
          embedding: Array.from({ length: EMBEDDING_DIMENSIONS }, () =>
            faker.number.float({ min: -1, max: 1, fractionDigits: 6 }),
          ),
          index: sequence,
        },
      ],
      model: "text-embedding-ada-002",
      usage: {
        prompt_tokens: faker.number.int({ min: 5, max: 50 }),
        total_tokens: faker.number.int({ min: 5, max: 50 }),
      },
    };
  },
);

/**
 * Helper функция для создания embeddings с конкретным количеством входов
 */
export function createEmbeddingsResponse(
  count: number,
): OpenAIEmbeddingResponse {
  return {
    object: "list",
    data: Array.from({ length: count }, (_, index) => ({
      object: "embedding",
      embedding: Array.from({ length: EMBEDDING_DIMENSIONS }, () =>
        faker.number.float({ min: -1, max: 1, fractionDigits: 6 }),
      ),
      index,
    })),
    model: "text-embedding-ada-002",
    usage: {
      prompt_tokens: faker.number.int({ min: count * 5, max: count * 50 }),
      total_tokens: faker.number.int({ min: count * 5, max: count * 50 }),
    },
  };
}
