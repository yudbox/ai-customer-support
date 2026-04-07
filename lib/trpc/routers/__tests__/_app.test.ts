// Mock database connection BEFORE any imports
jest.mock("@/lib/database/connection");

// Mock ticket service
jest.mock("@/lib/features/tickets/ticket.service", () => ({
  ticketService: {
    createTicket: jest.fn(),
    getPendingApprovalTickets: jest.fn(),
    getTicketDetails: jest.fn(),
    approveTicket: jest.fn(),
    rejectTicket: jest.fn(),
    getAIRecommendations: jest.fn(),
  },
}));

import { TicketPriority } from "@/lib/database/entities/Ticket";
import { TicketStatus, SentimentLabel } from "@/lib/types/common";

import { appRouter } from "../_app";

describe("AppRouter", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    // Create tRPC caller (context can be empty for publicProcedure)
    caller = appRouter.createCaller({});
    jest.clearAllMocks();
  });

  describe("router structure", () => {
    it("should have tickets router procedures", () => {
      // Assert - check that tickets router procedures exist in flat structure
      const procedures = appRouter._def.procedures;
      const procedureKeys = Object.keys(procedures);

      expect(procedureKeys).toContain("tickets.create");
      expect(procedureKeys).toContain("tickets.getPendingApproval");
      expect(procedureKeys).toContain("tickets.getById");
      expect(procedureKeys).toContain("tickets.approve");
      expect(procedureKeys).toContain("tickets.reject");
      expect(procedureKeys).toContain("tickets.getAIRecommendations");
    });

    it("should expose tickets procedures through appRouter", () => {
      // Assert - check that tickets router procedures are accessible
      expect(caller.tickets).toBeDefined();
      expect(typeof caller.tickets.create).toBe("function");
      expect(typeof caller.tickets.getPendingApproval).toBe("function");
      expect(typeof caller.tickets.getById).toBe("function");
      expect(typeof caller.tickets.approve).toBe("function");
      expect(typeof caller.tickets.reject).toBe("function");
      expect(typeof caller.tickets.getAIRecommendations).toBe("function");
    });
  });

  describe("integration with tickets router", () => {
    it("should call tickets.create through appRouter", async () => {
      // Arrange
      const { ticketService } =
        await import("@/lib/features/tickets/ticket.service");
      const mockTicketService = ticketService as jest.Mocked<
        typeof ticketService
      >;

      const input = {
        email: "test@example.com",
        subject: "Test ticket",
        body: "This is a test body with more than 10 characters",
      };

      const mockResponse = {
        ticket_number: "TKT-2026-0001",
        id: "ticket-123",
        status: TicketStatus.OPEN,
        created_at: new Date("2026-04-05"),
      };

      mockTicketService.createTicket.mockResolvedValue(mockResponse);

      // Act
      const result = await caller.tickets.create(input);

      // Assert
      expect(mockTicketService.createTicket).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResponse);
    });

    it("should call tickets.getPendingApproval through appRouter", async () => {
      // Arrange
      const { ticketService } =
        await import("@/lib/features/tickets/ticket.service");
      const mockTicketService = ticketService as jest.Mocked<
        typeof ticketService
      >;

      const mockTickets = [
        {
          id: "ticket-1",
          ticket_number: "TKT-001",
          subject: "Test",
          status: TicketStatus.OPEN,
          priority: TicketPriority.HIGH,
          priority_score: 85,
          customer_tier: "VIP",
          sentiment_label: SentimentLabel.ANGRY,
          created_at: new Date("2026-04-05"),
        },
      ];

      mockTicketService.getPendingApprovalTickets.mockResolvedValue(
        mockTickets,
      );

      // Act
      const result = await caller.tickets.getPendingApproval();

      // Assert
      expect(mockTicketService.getPendingApprovalTickets).toHaveBeenCalled();
      expect(result).toEqual(mockTickets);
    });

    it("should call tickets.getById through appRouter", async () => {
      // Arrange
      const { ticketService } =
        await import("@/lib/features/tickets/ticket.service");
      const mockTicketService = ticketService as jest.Mocked<
        typeof ticketService
      >;

      const mockTicket = {
        id: "ticket-123",
        ticket_number: "TKT-001",
        subject: "Test",
        body: "Test body",
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        priority_score: 50,
        category: "technical",
        sentiment_label: SentimentLabel.NEUTRAL,
        sentiment_score: 0.5,
        assigned_team: null,
        assigned_to: null,
        customer: null,
        order: null,
        created_at: new Date("2026-04-05"),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockTicketService.getTicketDetails.mockResolvedValue(mockTicket as any);

      // Act
      const result = await caller.tickets.getById({ id: "ticket-123" });

      // Assert
      expect(mockTicketService.getTicketDetails).toHaveBeenCalledWith(
        "ticket-123",
      );
      expect(result).toEqual(mockTicket);
    });
  });

  describe("type safety", () => {
    it("should have correct AppRouter type", () => {
      // This test verifies that the AppRouter type export exists
      // The type checking happens at compile time
      type AppRouterType = typeof appRouter;

      // Runtime check that the type is correct
      const routerDef: AppRouterType = appRouter;
      expect(routerDef).toBeDefined();
    });
  });
});
