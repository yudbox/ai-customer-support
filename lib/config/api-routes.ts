/**
 * API Routes Configuration
 *
 * Centralized API endpoint paths for:
 * - tRPC procedures
 * - REST API routes
 * - Testing
 */

/**
 * Base API paths
 */
export const API_BASE_PATHS = {
  TRPC: "/api/trpc",
  TICKETS: "/api/tickets",
  WEBHOOKS: "/api/webhooks",
} as const;

/**
 * tRPC procedure paths (for testing and documentation)
 * Format: `${API_BASE_PATHS.TRPC}/router.procedure`
 */
export const TRPC_PROCEDURES = {
  TICKETS: {
    GET_PENDING_APPROVAL: "tickets.getPendingApproval",
    GET_BY_ID: "tickets.getById",
    CREATE: "tickets.create",
    APPROVE: "tickets.approve",
    REJECT: "tickets.reject",
    GET_AI_RECOMMENDATIONS: "tickets.getAIRecommendations",
  },
} as const;

/**
 * REST API endpoints (non-tRPC)
 */
export const REST_ENDPOINTS = {
  TICKETS_STREAM: `${API_BASE_PATHS.TICKETS}/stream`, // SSE streaming
} as const;

/**
 * Helper: Build full tRPC URL
 * @param procedure - tRPC procedure name (e.g., "tickets.getPendingApproval")
 * @param baseUrl - Base URL (default: "http://test" for tests)
 * @returns Full URL string
 */
export function buildTrpcUrl(
  procedure: string,
  baseUrl: string = "http://test",
): string {
  return `${baseUrl}${API_BASE_PATHS.TRPC}/${procedure}`;
}

/**
 * Helper: Build full REST URL
 * @param endpoint - REST endpoint path (use REST_ENDPOINTS constants)
 * @param baseUrl - Base URL. Options:
 *   - Tests: "http://test" (auto-detected via NODE_ENV)
 *   - Client: undefined (uses relative path)
 *   - Server: MUST provide explicit baseUrl or set NEXT_PUBLIC_APP_URL
 * @returns Full URL for server/tests, or relative path for client
 * @throws Error if baseUrl is required but not provided
 */
export function buildRestUrl(endpoint: string, baseUrl?: string): string {
  // Client-side: use relative paths (no baseUrl needed)
  if (typeof window !== "undefined" && !baseUrl) {
    return endpoint;
  }

  // Determine base URL
  let base: string;

  if (baseUrl) {
    // Explicitly provided - use it
    base = baseUrl;
  } else if (process.env.NODE_ENV === "test") {
    // Test environment - use test URL
    base = "http://test";
  } else {
    // Production/Server - require explicit configuration
    throw new Error(
      `buildRestUrl: baseUrl is required for server-side usage. ` +
        `Either pass baseUrl parameter or set NEXT_PUBLIC_APP_URL environment variable.`,
    );
  }

  return `${base}${endpoint}`;
}

/**
 * Get base URL for current environment
 * - Browser: returns empty string (use relative paths)
 * - Server: returns full URL from env
 * @throws Error if NEXT_PUBLIC_APP_URL is not set in server environment
 */
export function getBaseUrl(): string {
  // Browser
  if (typeof window !== "undefined") {
    return "";
  }

  // Server - require explicit configuration
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error(
      `NEXT_PUBLIC_APP_URL environment variable is required for server-side requests. ` +
        `Set it in .env.local or deployment environment.`,
    );
  }

  return process.env.NEXT_PUBLIC_APP_URL;
}
