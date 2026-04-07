/**
 * Integration tests for Tickets Feature
 *
 * Тестирует полную цепочку: router → service → repository (mocked)
 * Покрывает: ticket.router.ts, ticket.service.ts
 */

// Mock repository layer (database access)
jest.mock("@/lib/features/tickets/ticket.repository", () => ({
  ticketRepository: {
    findPendingApproval: jest.fn(),
    findById: jest.fn(),
    findByIdWithRelations: jest.fn(),
    findCustomerByEmail: jest.fn(),
    createCustomer: jest.fn(),
    findOrderByNumber: jest.fn(),
    createTicket: jest.fn(),
    updateTicketThreadId: jest.fn(),
    saveTicket: jest.fn(),
    clearTicketThreadId: jest.fn(),
  },
  TicketRepository: jest.fn(),
}));

// Mock external services
jest.mock("@/lib/langgraph/workflow", () => ({
  resumeWorkflow: jest.fn(),
}));

jest.mock("@/lib/services/embeddings", () => ({
  createEmbedding: jest.fn(),
  formatTicketForEmbedding: jest.fn(),
}));

jest.mock("@/lib/clients/pinecone", () => ({
  pineconeIndex: {
    namespace: jest.fn(() => ({
      query: jest.fn(),
    })),
  },
  PINECONE_NAMESPACE: "test-namespace",
}));

// Import mocked modules
const { ticketRepository } = jest.requireMock<
  typeof import("@/lib/features/tickets/ticket.repository")
>("@/lib/features/tickets/ticket.repository");

const { resumeWorkflow } = jest.requireMock<
  typeof import("@/lib/langgraph/workflow")
>("@/lib/langgraph/workflow");

const { createEmbedding, formatTicketForEmbedding } = jest.requireMock<
  typeof import("@/lib/services/embeddings")
>("@/lib/services/embeddings");

const { pineconeIndex } = jest.requireMock<
  typeof import("@/lib/clients/pinecone")
>("@/lib/clients/pinecone");

// Import router and types after mocks
import { CustomerTier } from "@/lib/database/entities/Customer";
import { TicketPriority } from "@/lib/database/entities/Ticket";
import { appRouter } from "@/lib/trpc/routers/_app";
import { TicketStatus, SentimentLabel } from "@/lib/types/common";

import { ticketFactory } from "../../factories/ticket.factory";

describe("Tickets Feature Integration Tests", () => {
  // Create tRPC caller for testing
  const caller = appRouter.createCaller({});

  // Type-safe mock references
  const mockFindPendingApproval =
    ticketRepository.findPendingApproval as jest.Mock;
  const mockFindById = ticketRepository.findById as jest.Mock;
  const mockFindByIdWithRelations =
    ticketRepository.findByIdWithRelations as jest.Mock;
  const mockFindCustomerByEmail =
    ticketRepository.findCustomerByEmail as jest.Mock;
  const mockCreateCustomer = ticketRepository.createCustomer as jest.Mock;
  const mockFindOrderByNumber = ticketRepository.findOrderByNumber as jest.Mock;
  const mockCreateTicket = ticketRepository.createTicket as jest.Mock;
  const mockUpdateTicketThreadId =
    ticketRepository.updateTicketThreadId as jest.Mock;
  const mockSaveTicket = ticketRepository.saveTicket as jest.Mock;
  const mockClearTicketThreadId =
    ticketRepository.clearTicketThreadId as jest.Mock;
  const mockResumeWorkflow = resumeWorkflow as jest.Mock;
  const mockCreateEmbedding = createEmbedding as jest.Mock;
  const mockFormatTicketForEmbedding = formatTicketForEmbedding as jest.Mock;
  const mockPineconeQuery = jest.fn();

  // Setup pinecone mock to return mockPineconeQuery
  (pineconeIndex.namespace as jest.Mock).mockReturnValue({
    query: mockPineconeQuery,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPendingApproval", () => {
    it("should return list of pending approval tickets", async () => {
      const mockTickets = [
        {
          id: "ticket-1",
          ticket_number: "TKT-2024-0101-0001",
          subject: "Test Subject",
          status: TicketStatus.PENDING_APPROVAL,
          priority: TicketPriority.HIGH,
          priority_score: 8,
          sentiment_label: SentimentLabel.NEUTRAL,
          created_at: new Date(),
          customer_email: "test@example.com",
          customer_tier: CustomerTier.VIP,
        },
      ];

      mockFindPendingApproval.mockResolvedValue(mockTickets);

      const result = await caller.tickets.getPendingApproval();

      expect(mockFindPendingApproval).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "ticket-1",
        ticket_number: "TKT-2024-0101-0001",
        subject: "Test Subject",
      });
    });

    it("should return empty array when no pending tickets", async () => {
      mockFindPendingApproval.mockResolvedValue([]);

      const result = await caller.tickets.getPendingApproval();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return ticket details by id", async () => {
      const mockTicket = ticketFactory.build({
        id: "ticket-123",
        subject: "Test Ticket",
        status: TicketStatus.OPEN,
        customer_id: "customer-1",
      });

      mockFindByIdWithRelations.mockResolvedValue(mockTicket);

      const result = await caller.tickets.getById({ id: "ticket-123" });

      expect(mockFindByIdWithRelations).toHaveBeenCalledWith("ticket-123");
      expect(result).toMatchObject({
        id: "ticket-123",
        subject: "Test Ticket",
        status: TicketStatus.OPEN,
      });
    });

    it("should throw error when ticket not found", async () => {
      mockFindByIdWithRelations.mockResolvedValue(null);

      await expect(
        caller.tickets.getById({ id: "non-existent" }),
      ).rejects.toThrow("Ticket not found");
    });
  });

  describe("create", () => {
    it("should create ticket for existing customer", async () => {
      const mockCustomer = {
        id: "customer-1",
        email: "test@example.com",
        name: "Test User",
        tier: CustomerTier.REGULAR,
      };

      const mockCreatedTicket = ticketFactory.build({
        id: "new-ticket-1",
        ticket_number: "TKT-2024-0101-0999",
        subject: "New Support Request",
        body: "I need help with my order",
        status: TicketStatus.OPEN,
        customer_id: "customer-1",
      });

      mockFindCustomerByEmail.mockResolvedValue(mockCustomer);
      mockFindOrderByNumber.mockResolvedValue(null);
      mockCreateTicket.mockResolvedValue(mockCreatedTicket);
      mockUpdateTicketThreadId.mockResolvedValue(undefined);
      mockCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockFormatTicketForEmbedding.mockReturnValue("formatted text");

      const result = await caller.tickets.create({
        email: "test@example.com",
        subject: "New Support Request",
        body: "I need help with my order",
      });

      expect(mockFindCustomerByEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockCreateTicket).toHaveBeenCalled();
      expect(mockUpdateTicketThreadId).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: "new-ticket-1",
        ticket_number: "TKT-2024-0101-0999",
        status: TicketStatus.OPEN,
      });
    });

    it("should create customer if not exists", async () => {
      const mockNewCustomer = {
        id: "new-customer-1",
        email: "newuser@example.com",
        name: "Newuser",
        tier: CustomerTier.NEW,
      };

      const mockCreatedTicket = ticketFactory.build({
        customer_id: "new-customer-1",
      });

      mockFindCustomerByEmail.mockResolvedValue(null);
      mockCreateCustomer.mockResolvedValue(mockNewCustomer);
      mockFindOrderByNumber.mockResolvedValue(null);
      mockCreateTicket.mockResolvedValue(mockCreatedTicket);
      mockUpdateTicketThreadId.mockResolvedValue(undefined);
      mockCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockFormatTicketForEmbedding.mockReturnValue("formatted text");

      await caller.tickets.create({
        email: "newuser@example.com",
        subject: "First ticket",
        body: "Help needed",
      });

      expect(mockCreateCustomer).toHaveBeenCalledWith({
        name: "Newuser",
        email: "newuser@example.com",
        tier: CustomerTier.NEW,
      });
      expect(mockCreateTicket).toHaveBeenCalled();
      expect(mockUpdateTicketThreadId).toHaveBeenCalled();
    });
  });

  describe("approve", () => {
    it("should approve ticket and resume workflow", async () => {
      const mockTicket = ticketFactory.build({
        id: "ticket-approve",
        status: TicketStatus.PENDING_APPROVAL,
        thread_id: "thread-123",
      });

      const mockUpdatedTicket = ticketFactory.build({
        ...mockTicket,
        status: TicketStatus.RESOLVED,
        assigned_team: "technical_support",
      });

      mockFindById.mockResolvedValue(mockTicket);
      mockFindByIdWithRelations.mockResolvedValue(mockUpdatedTicket);
      mockResumeWorkflow.mockResolvedValue(undefined);
      mockSaveTicket.mockResolvedValue(undefined);
      mockClearTicketThreadId.mockResolvedValue(undefined);

      const result = await caller.tickets.approve({
        id: "ticket-approve",
        assigned_team: "technical_support",
        assigned_to: "agent-1",
        resolution: "Will investigate",
      });

      expect(mockFindById).toHaveBeenCalledWith("ticket-approve");
      expect(mockResumeWorkflow).toHaveBeenCalledWith("thread-123", {
        resolution: "Will investigate",
        assigned_team: "technical_support",
        needs_approval: false,
      });
      expect(mockSaveTicket).toHaveBeenCalled();
      expect(mockClearTicketThreadId).toHaveBeenCalledWith("ticket-approve");
      expect(result.success).toBe(true);
    });

    it("should throw error when ticket not found", async () => {
      mockFindById.mockResolvedValue(null);

      await expect(
        caller.tickets.approve({
          id: "non-existent",
          assigned_team: "technical_support",
        }),
      ).rejects.toThrow("Ticket not found");
    });
  });

  describe("reject", () => {
    it("should reject ticket and update status", async () => {
      const mockTicket = ticketFactory.build({
        id: "ticket-reject",
        status: TicketStatus.PENDING_APPROVAL,
        thread_id: "thread-456",
      });

      mockFindById.mockResolvedValue(mockTicket);
      mockSaveTicket.mockResolvedValue(undefined);
      mockClearTicketThreadId.mockResolvedValue(undefined);

      const result = await caller.tickets.reject({
        id: "ticket-reject",
        reason: "Not enough information",
      });

      expect(mockFindById).toHaveBeenCalledWith("ticket-reject");
      expect(mockSaveTicket).toHaveBeenCalled();
      expect(mockClearTicketThreadId).toHaveBeenCalledWith("ticket-reject");
      expect(result.success).toBe(true);
    });
  });

  describe("getAIRecommendations", () => {
    it("should return AI recommendations from Pinecone", async () => {
      const mockTicket = ticketFactory.build({
        id: "ticket-ai",
        subject: "Login issue",
        body: "Cannot access my account",
      });

      const mockMatches = [
        {
          id: "rec-1",
          score: 0.95,
          metadata: {
            ticket_number: "TKT-2024-0101-0001",
            subject: "Similar login issue",
            resolution: "Reset password worked",
            category: "technical",
          },
        },
      ];

      mockFindById.mockResolvedValue(mockTicket);
      mockFormatTicketForEmbedding.mockReturnValue("formatted ticket text");
      mockCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockPineconeQuery.mockResolvedValue({ matches: mockMatches });

      const result = await caller.tickets.getAIRecommendations({
        ticketId: "ticket-ai",
      });

      expect(mockFindById).toHaveBeenCalledWith("ticket-ai");
      expect(mockCreateEmbedding).toHaveBeenCalled();
      expect(mockPineconeQuery).toHaveBeenCalledWith({
        vector: [0.1, 0.2, 0.3],
        topK: 3,
        includeMetadata: true,
      });
      expect(result.similar_tickets).toHaveLength(1);
      expect(result.similar_tickets[0]).toMatchObject({
        id: "rec-1",
        subject: "Similar login issue",
        similarity: 0.95,
      });
      expect(result.suggested_solution).toBe("Reset password worked");
    });

    it("should return empty array when no similar tickets found", async () => {
      const mockTicket = ticketFactory.build();

      mockFindById.mockResolvedValue(mockTicket);
      mockFormatTicketForEmbedding.mockReturnValue("formatted text");
      mockCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockPineconeQuery.mockResolvedValue({ matches: [] });

      const result = await caller.tickets.getAIRecommendations({
        ticketId: "ticket-no-recs",
      });

      expect(result.similar_tickets).toEqual([]);
      expect(result.suggested_solution).toBeUndefined();
    });
  });
});
