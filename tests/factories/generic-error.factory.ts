/**
 * Generic API Error Factory
 *
 * Фабрика для генерации реалистичных общих ошибок API
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

/**
 * Types
 */
export interface GenericAPIError {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * Constants
 */
const HTTP_STATUS_BAD_GATEWAY = 502;
const HTTP_STATUS_SERVICE_UNAVAILABLE = 503;
const HTTP_STATUS_GATEWAY_TIMEOUT = 504;
const HTTP_STATUS_INTERNAL_ERROR = 500;

/**
 * Factory
 */
export const genericApiErrorFactory = Factory.define<GenericAPIError>(() => ({
  error: faker.helpers.arrayElement([
    "Internal server error",
    "Service temporarily unavailable",
    "Bad gateway",
    "Gateway timeout",
  ]),
  message: faker.lorem.sentence(),
  statusCode: faker.helpers.arrayElement([
    HTTP_STATUS_INTERNAL_ERROR,
    HTTP_STATUS_BAD_GATEWAY,
    HTTP_STATUS_SERVICE_UNAVAILABLE,
    HTTP_STATUS_GATEWAY_TIMEOUT,
  ]),
}));
