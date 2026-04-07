/**
 * OpenAI Error Factory
 *
 * Фабрика для генерации реалистичных ошибок от OpenAI API
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

/**
 * Types
 */
export interface OpenAIError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * Factory
 */
export const openaiErrorFactory = Factory.define<OpenAIError>(() => ({
  error: {
    message: faker.helpers.arrayElement([
      "Rate limit exceeded",
      "Invalid API key",
      "Model not found",
      "Request timeout",
      "Service unavailable",
    ]),
    type: faker.helpers.arrayElement([
      "rate_limit_error",
      "invalid_request_error",
      "authentication_error",
      "timeout_error",
      "server_error",
    ]),
    code: faker.helpers.arrayElement([
      "rate_limit_exceeded",
      "invalid_api_key",
      "model_not_found",
      "timeout",
      "server_error",
    ]),
  },
}));
