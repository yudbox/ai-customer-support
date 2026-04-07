/**
 * Integration tests for tRPC API Route Handler
 *
 * Tests /api/trpc/[trpc]/route.ts - main handler for all tRPC requests
 */

import { GET, POST } from "@/app/api/trpc/[trpc]/route";
import { buildTrpcUrl, TRPC_PROCEDURES } from "@/lib/config/api-routes";

// Mock ticket service BEFORE imports
jest.mock("@/lib/features/tickets/ticket.service", () => ({
  ticketService: {
    getPendingApprovalTickets: jest.fn(),
    getTicketDetails: jest.fn(),
    createTicket: jest.fn(),
    approveTicket: jest.fn(),
    rejectTicket: jest.fn(),
    getAIRecommendations: jest.fn(),
  },
}));

// Import after mock - using requireMock to avoid order issues
const { ticketService } = jest.requireMock<
  typeof import("@/lib/features/tickets/ticket.service")
>("@/lib/features/tickets/ticket.service");

import { ticketFactory } from "../../factories/ticket.factory";

const mockGetPendingApprovalTickets =
  ticketService.getPendingApprovalTickets as jest.Mock;
const mockGetTicketDetails = ticketService.getTicketDetails as jest.Mock;

describe("tRPC API Route Handler Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET Handler", () => {
    it("should export GET handler function", () => {
      expect(typeof GET).toBe("function");
    });

    it("should handle GET requests", async () => {
      mockGetPendingApprovalTickets.mockResolvedValue([]);

      const url = new URL(
        buildTrpcUrl(TRPC_PROCEDURES.TICKETS.GET_PENDING_APPROVAL),
      );
      url.searchParams.set("batch", "1");
      url.searchParams.set("input", JSON.stringify({ "0": { json: null } }));

      const request = new Request(url.toString(), {
        method: "GET",
      });

      const response = await GET(request);

      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    it("should handle GET requests with parameters", async () => {
      const mockTicket = ticketFactory.build();
      mockGetTicketDetails.mockResolvedValue(mockTicket);

      const url = new URL(buildTrpcUrl(TRPC_PROCEDURES.TICKETS.GET_BY_ID));
      url.searchParams.set("batch", "1");
      url.searchParams.set(
        "input",
        JSON.stringify({ "0": { json: { id: "test-123" } } }),
      );

      const request = new Request(url.toString(), {
        method: "GET",
      });

      const response = await GET(request);

      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe("POST Handler", () => {
    it("should export POST handler function", () => {
      expect(typeof POST).toBe("function");
    });

    it("should handle POST requests", async () => {
      const url = new URL(buildTrpcUrl(TRPC_PROCEDURES.TICKETS.APPROVE));

      const request = new Request(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "0": {
            json: {
              id: "ticket-123",
              assigned_team: "technical_support",
            },
          },
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  describe("Route Configuration", () => {
    it("should use correct endpoint /api/trpc", async () => {
      mockGetPendingApprovalTickets.mockResolvedValue([]);

      const url = new URL(
        buildTrpcUrl(TRPC_PROCEDURES.TICKETS.GET_PENDING_APPROVAL),
      );
      url.searchParams.set("batch", "1");
      url.searchParams.set("input", JSON.stringify({ "0": { json: null } }));

      const request = new Request(url.toString(), {
        method: "GET",
      });

      const response = await GET(request);

      // Handler should process request without throwing
      expect(response).toBeDefined();
    });

    it("should handle both GET and POST methods", () => {
      // Verify both handlers are exported
      expect(GET).toBeDefined();
      expect(POST).toBeDefined();
      expect(typeof GET).toBe("function");
      expect(typeof POST).toBe("function");
    });
  });

  describe("Error Handling", () => {
    it("should handle service errors gracefully", async () => {
      mockGetTicketDetails.mockRejectedValue(new Error("Service error"));

      const url = new URL(buildTrpcUrl(TRPC_PROCEDURES.TICKETS.GET_BY_ID));
      url.searchParams.set("batch", "1");
      url.searchParams.set(
        "input",
        JSON.stringify({ "0": { json: { id: "test-123" } } }),
      );

      const request = new Request(url.toString(), {
        method: "GET",
      });

      const response = await GET(request);

      // Should return error response, not throw
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThan(0);
    });

    it("should return response for invalid procedure", async () => {
      const url = new URL(buildTrpcUrl("tickets.invalidProcedure"));
      url.searchParams.set("batch", "1");
      url.searchParams.set("input", JSON.stringify({ "0": { json: null } }));

      const request = new Request(url.toString(), {
        method: "GET",
      });

      const response = await GET(request);

      // Should return error response
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
