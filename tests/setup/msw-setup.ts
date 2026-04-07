/**
 * MSW (Mock Service Worker) setup for Node.js integration tests
 *
 * This file configures MSW to intercept HTTP requests during tests.
 * It's automatically loaded by Jest via setupFilesAfterEnv.
 */

import { setupServer } from "msw/node";

import { handlers } from "./msw-handlers";

// Setup MSW server with default handlers
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: "warn", // Warn about unhandled requests instead of erroring
  });
});

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Export for use in tests
export { handlers } from "./msw-handlers";
