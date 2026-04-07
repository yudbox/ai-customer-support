/**
 * OpenAI Chat Completion Factory
 *
 * Фабрика для генерации реалистичных ответов от OpenAI Chat API
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

/**
 * Types
 */
export interface OpenAIChatMessage {
  role: string;
  content: string;
}

export interface OpenAIChatChoice {
  index: number;
  message: OpenAIChatMessage;
  finish_reason: string;
}

export interface OpenAIChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChatChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Constants
 */
const CHAT_ID_LENGTH = 29;

/**
 * Factory
 */
export const openaiChatCompletionFactory = Factory.define<OpenAIChatCompletion>(
  () => ({
    id: `chatcmpl-${faker.string.alphanumeric(CHAT_ID_LENGTH)}`,
    object: "chat.completion",
    created: faker.date.recent().getTime(),
    model: faker.helpers.arrayElement([
      "gpt-4",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
    ]),
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: faker.lorem.paragraph(),
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: faker.number.int({ min: 10, max: 100 }),
      completion_tokens: faker.number.int({ min: 20, max: 200 }),
      total_tokens: faker.number.int({ min: 30, max: 300 }),
    },
  }),
);

/**
 * Helper функция для создания chat completion с конкретным содержимым
 */
export function createChatCompletion(content: string): OpenAIChatCompletion {
  return openaiChatCompletionFactory.build({
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content,
        },
        finish_reason: "stop",
      },
    ],
  });
}
