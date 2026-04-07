import { CustomerTier } from "@/lib/database/entities/Customer";
import { TicketPriority } from "@/lib/database/entities/Ticket";
import { TicketStatus, SentimentLabel } from "@/lib/types/common";

import { ticketsRouter } from "../ticket.router";
import * as ticketServiceModule from "../ticket.service";

// Mock ticket service
jest.mock("../ticket.service", () => ({
  ticketService: {
    createTicket: jest.fn(),
    getPendingApprovalTickets: jest.fn(),
    getTicketDetails: jest.fn(),
    approveTicket: jest.fn(),
    rejectTicket: jest.fn(),
    getAIRecommendations: jest.fn(),
  },
}));

describe("TicketsRouter", () => {
  let caller: ReturnType<typeof ticketsRouter.createCaller>;
  const mockTicketService = ticketServiceModule.ticketService as jest.Mocked<
    typeof ticketServiceModule.ticketService
  >;

  beforeEach(() => {
    // Create tRPC caller (context can be empty for publicProcedure)
    caller = ticketsRouter.createCaller({});
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create ticket via service", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        subject: "Test ticket",
        body: "This is a test body with more than 10 characters",
      };

      const mockResponse = {
        ticket_number: "TKT-2026-0405-0001",
        id: "ticket-123",
        status: TicketStatus.OPEN,
        created_at: new Date("2026-04-05T10:00:00Z"),
      };

      mockTicketService.createTicket.mockResolvedValue(mockResponse);

      // Act
      const result = await caller.create(input);

      // Assert
      expect(mockTicketService.createTicket).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResponse);
    });

    it("should create ticket with order_number", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        subject: "Order issue",
        body: "Problem with order - detailed description here",
        order_number: "ORD-001",
      };

      const mockResponse = {
        ticket_number: "TKT-2026-0405-0002",
        id: "ticket-456",
        status: TicketStatus.OPEN,
        created_at: new Date(),
      };

      mockTicketService.createTicket.mockResolvedValue(mockResponse);

      // Act
      const result = await caller.create(input);

      // Assert
      expect(mockTicketService.createTicket).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResponse);
    });

    it("should throw validation error for invalid input", async () => {
      // Arrange
      const input = {
        email: "invalid-email",
        subject: "Test",
        body: "Short", // Too short
      };

      // Act & Assert
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(caller.create(input as any)).rejects.toThrow();
    });
  });

  describe("getPendingApproval", () => {
    it("should get pending approval tickets via service", async () => {
      // Arrange
      const mockTickets = [
        {
          id: "ticket-1",
          ticket_number: "TKT-001",
          subject: "Pending ticket",
          status: "OPEN",
          priority: "HIGH",
          priority_score: 85,
          customer_tier: "VIP",
          sentiment_label: "ANGRY",
          created_at: new Date("2026-04-05"),
        },
        {
          id: "ticket-2",
          ticket_number: "TKT-002",
          subject: "Another pending",
          status: "OPEN",
          priority: "MEDIUM",
          priority_score: 60,
          customer_tier: "REGULAR",
          sentiment_label: "NEUTRAL",
          created_at: new Date("2026-04-05"),
        },
      ];

      mockTicketService.getPendingApprovalTickets.mockResolvedValue(
        mockTickets,
      );

      // Act
      const result = await caller.getPendingApproval();

      // Assert
      expect(mockTicketService.getPendingApprovalTickets).toHaveBeenCalled();
      expect(result).toEqual(mockTickets);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no pending tickets", async () => {
      // Arrange
      mockTicketService.getPendingApprovalTickets.mockResolvedValue([]);

      // Act
      const result = await caller.getPendingApproval();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should get ticket details via service", async () => {
      // Arrange
      const ticketId = "ticket-123";
      const mockTicket = {
        id: "ticket-123",
        ticket_number: "TKT-001",
        subject: "Test ticket",
        body: "Test body",
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        priority_score: 85,
        category: "technical",
        sentiment_label: SentimentLabel.NEUTRAL,
        sentiment_score: 0.5,
        assigned_team: "TECHNICAL_SUPPORT",
        assigned_to: "John Doe",
        customer: {
          email: "test@example.com",
          name: "Test User",
          tier: CustomerTier.VIP,
          total_orders: 5,
          lifetime_value: 1500,
        },
        order: null,
        created_at: new Date("2026-04-05"),
      };

      mockTicketService.getTicketDetails.mockResolvedValue(mockTicket);

      // Act
      const result = await caller.getById({ id: ticketId });

      // Assert
      expect(mockTicketService.getTicketDetails).toHaveBeenCalledWith(ticketId);
      expect(result).toEqual(mockTicket);
    });

    it("should throw error if ticket not found", async () => {
      // Arrange
      mockTicketService.getTicketDetails.mockRejectedValue(
        new Error("Ticket not found"),
      );

      // Act & Assert
      await expect(caller.getById({ id: "non-existent" })).rejects.toThrow(
        "Ticket not found",
      );
    });
  });

  describe("approve", () => {
    it("should approve ticket via service", async () => {
      // Arrange
      const input = {
        id: "ticket-123",
        assigned_team: "TECHNICAL_SUPPORT",
        resolution: "Issue resolved",
      };

      const mockResponse = {
        success: true,
        ticket_number: "TKT-001",
      };

      mockTicketService.approveTicket.mockResolvedValue(mockResponse);

      // Act
      const result = await caller.approve(input);

      // Assert
      expect(mockTicketService.approveTicket).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResponse);
    });

    it("should approve ticket without resolution", async () => {
      // Arrange
      const input = {
        id: "ticket-456",
        assigned_team: "BILLING",
      };

      const mockResponse = {
        success: true,
        ticket_number: "TKT-002",
      };

      mockTicketService.approveTicket.mockResolvedValue(mockResponse);

      // Act
      const result = await caller.approve(input);

      // Assert
      expect(mockTicketService.approveTicket).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResponse);
    });

    it("should handle approval errors", async () => {
      // Arrange
      const input = {
        id: "ticket-999",
        assigned_team: "SUPPORT",
      };

      mockTicketService.approveTicket.mockRejectedValue(
        new Error("Ticket not found"),
      );

      // Act & Assert
      await expect(caller.approve(input)).rejects.toThrow("Ticket not found");
    });
  });

  describe("reject", () => {
    it("should reject ticket via service", async () => {
      // Arrange
      const input = {
        id: "ticket-123",
        reason: "Invalid request",
      };

      const mockResponse = {
        success: true,
        ticket_number: "TKT-001",
      };

      mockTicketService.rejectTicket.mockResolvedValue(mockResponse);

      // Act
      const result = await caller.reject(input);

      // Assert
      expect(mockTicketService.rejectTicket).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResponse);
    });

    it("should reject ticket with different reason", async () => {
      // Arrange
      const input = {
        id: "ticket-456",
        reason: "Spam",
      };

      const mockResponse = {
        success: true,
        ticket_number: "TKT-002",
      };

      mockTicketService.rejectTicket.mockResolvedValue(mockResponse);

      // Act
      const result = await caller.reject(input);

      // Assert
      expect(mockTicketService.rejectTicket).toHaveBeenCalledWith(input);
      expect(result.success).toBe(true);
    });

    it("should handle rejection errors", async () => {
      // Arrange
      const input = {
        id: "non-existent",
        reason: "Test",
      };

      mockTicketService.rejectTicket.mockRejectedValue(
        new Error("Ticket not found"),
      );

      // Act & Assert
      await expect(caller.reject(input)).rejects.toThrow("Ticket not found");
    });
  });

  describe("getAIRecommendations", () => {
    it("should get AI recommendations via service", async () => {
      // Arrange
      const ticketId = "ticket-123";
      const mockRecommendations = {
        similar_tickets: [
          {
            id: "similar-1",
            subject: "Similar issue",
            category: "technical",
            resolution: "Reboot device",
            similarity: 0.92,
          },
          {
            id: "similar-2",
            subject: "Another issue",
            category: "technical",
            resolution: "Update firmware",
            similarity: 0.85,
          },
        ],
        suggested_solution: "Reboot device",
      };

      mockTicketService.getAIRecommendations.mockResolvedValue(
        mockRecommendations,
      );

      // Act
      const result = await caller.getAIRecommendations({ ticketId });

      // Assert
      expect(mockTicketService.getAIRecommendations).toHaveBeenCalledWith(
        ticketId,
      );
      expect(result).toEqual(mockRecommendations);
      expect(result.similar_tickets).toHaveLength(2);
    });

    it("should return empty recommendations on error", async () => {
      // Arrange
      const ticketId = "ticket-456";
      const emptyRecommendations = {
        similar_tickets: [],
        suggested_solution: undefined,
      };

      mockTicketService.getAIRecommendations.mockResolvedValue(
        emptyRecommendations,
      );

      // Act
      const result = await caller.getAIRecommendations({ ticketId });

      // Assert
      expect(result.similar_tickets).toEqual([]);
      expect(result.suggested_solution).toBeUndefined();
    });

    it("should handle service errors", async () => {
      // Arrange
      mockTicketService.getAIRecommendations.mockRejectedValue(
        new Error("Ticket not found"),
      );

      // Act & Assert
      await expect(
        caller.getAIRecommendations({ ticketId: "non-existent" }),
      ).rejects.toThrow("Ticket not found");
    });
  });
});
