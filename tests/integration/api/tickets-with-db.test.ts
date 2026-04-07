/**
 * Integration tests for Tickets Feature - WITH REAL DATABASE
 *
 * ✅ Tests FULL chain: router → service → repository → pg-mem in-memory
 * ✅ Covers: ticket.router.ts, ticket.service.ts, ticket.repository.ts
 * ✅ Uses real SQL queries (not mocks)
 * ✅ Mocks only external services (Pinecone, LangGraph, OpenAI)
 */

import { CustomerTier } from "@/lib/database/entities/Customer";
import { TicketPriority } from "@/lib/database/entities/Ticket";
import { appRouter } from "@/lib/trpc/routers/_app";
import { TicketStatus } from "@/lib/types/common";

import {
  seedCustomer,
  seedPendingApprovalTicket,
  seedTicket,
} from "../../helpers/seed-data";
import {
  cleanupTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
  testDataSource,
  mockGetDataSource,
} from "../../setup/test-db";

// ✅ Mock ONLY external dependencies
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

// ✅ Replace getDataSource with test database
jest.mock("@/lib/database/connection", () => ({
  getDataSource: jest.fn(() => mockGetDataSource()),
}));

// Import mocked modules
const { resumeWorkflow } = jest.requireMock<
  typeof import("@/lib/langgraph/workflow")
>("@/lib/langgraph/workflow");

const { createEmbedding, formatTicketForEmbedding } = jest.requireMock<
  typeof import("@/lib/services/embeddings")
>("@/lib/services/embeddings");

const { pineconeIndex } = jest.requireMock<
  typeof import("@/lib/clients/pinecone")
>("@/lib/clients/pinecone");

describe("Tickets Feature Integration Tests (Real DB)", () => {
  // Create tRPC caller for testing
  const caller = appRouter.createCaller({});

  // Mock references
  const mockResumeWorkflow = resumeWorkflow as jest.Mock;
  const mockCreateEmbedding = createEmbedding as jest.Mock;
  const mockFormatTicketForEmbedding = formatTicketForEmbedding as jest.Mock;
  const mockPineconeQuery = jest.fn();

  // Setup pinecone mock
  (pineconeIndex.namespace as jest.Mock).mockReturnValue({
    query: mockPineconeQuery,
  });

  beforeAll(async () => {
    // ✅ Initialize pg-mem database
    await setupTestDatabase();
  });

  afterEach(async () => {
    // ✅ Cleanup data between tests (isolation)
    await cleanupTestDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // ✅ Close database and free memory
    await teardownTestDatabase();
  });

  describe("getPendingApproval", () => {
    it("should return list of pending approval tickets", async () => {
      // ✅ Create real data in database
      const customer = await seedCustomer(testDataSource, {
        tier: CustomerTier.VIP,
      });

      await seedPendingApprovalTicket(testDataSource, customer.id, {
        subject: "Test Pending Ticket",
        priority: TicketPriority.HIGH,
      });

      // ✅ Test through full chain
      const result = await caller.tickets.getPendingApproval();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        subject: "Test Pending Ticket",
        status: TicketStatus.PENDING_APPROVAL,
      });
    });

    it("should return empty array when no pending tickets", async () => {
      // Database is empty after cleanup
      const result = await caller.tickets.getPendingApproval();

      expect(result).toEqual([]);
    });

    it("should not return tickets without thread_id", async () => {
      const customer = await seedCustomer(testDataSource);

      // Ticket WITHOUT thread_id (not pending approval)
      await seedTicket(testDataSource, customer.id, {
        status: TicketStatus.PENDING_APPROVAL,
        thread_id: undefined, // ✅ Without thread_id
      });

      const result = await caller.tickets.getPendingApproval();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return ticket details by id", async () => {
      const customer = await seedCustomer(testDataSource, {
        email: "test@example.com",
        name: "Test User",
      });

      const ticket = await seedTicket(testDataSource, customer.id, {
        subject: "Test Ticket",
        status: TicketStatus.OPEN,
      });

      // ✅ Real query with JOIN customer
      const result = await caller.tickets.getById({ id: ticket.id });

      expect(result).toMatchObject({
        id: ticket.id,
        subject: "Test Ticket",
        status: TicketStatus.OPEN,
        customer: {
          email: "test@example.com",
          name: "Test User",
        },
      });
    });

    it("should throw error when ticket not found", async () => {
      await expect(
        caller.tickets.getById({ id: "00000000-0000-0000-0000-000000000000" }),
      ).rejects.toThrow("Ticket not found");
    });
  });

  describe("create", () => {
    it("should create ticket for existing customer", async () => {
      const _customer = await seedCustomer(testDataSource, {
        email: "existing@example.com",
        tier: CustomerTier.REGULAR,
      });

      mockCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockFormatTicketForEmbedding.mockReturnValue("formatted text");

      const result = await caller.tickets.create({
        email: "existing@example.com",
        subject: "New Support Request",
        body: "I need help with my order",
      });

      expect(result).toMatchObject({
        ticket_number: expect.stringMatching(/^TKT-/),
        status: TicketStatus.OPEN,
      });

      // ✅ Verify ticket was actually saved to database
      const ticketRepo = testDataSource.getRepository("Ticket");
      const savedTicket = await ticketRepo.findOne({
        where: { id: result.id },
      });
      expect(savedTicket).toBeDefined();
    });

    it("should create customer if not exists", async () => {
      mockCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockFormatTicketForEmbedding.mockReturnValue("formatted text");

      const result = await caller.tickets.create({
        email: "newuser@example.com",
        subject: "First ticket",
        body: "Help needed",
      });

      expect(result).toBeDefined();

      // ✅ Verify customer was created
      const customerRepo = testDataSource.getRepository("Customer");
      const newCustomer = await customerRepo.findOne({
        where: { email: "newuser@example.com" },
      });
      expect(newCustomer).toBeDefined();
      expect(newCustomer?.tier).toBe(CustomerTier.NEW);
    });
  });

  describe("approve", () => {
    it("should approve ticket and resume workflow", async () => {
      const customer = await seedCustomer(testDataSource);
      const ticket = await seedPendingApprovalTicket(
        testDataSource,
        customer.id,
      );

      mockResumeWorkflow.mockResolvedValue(undefined);

      const result = await caller.tickets.approve({
        id: ticket.id,
        assigned_team: "technical_support",
        assigned_to: "agent-1",
        resolution: "Will investigate",
      });

      expect(result.success).toBe(true);
      expect(mockResumeWorkflow).toHaveBeenCalledWith(
        ticket.thread_id,
        expect.objectContaining({
          resolution: "Will investigate",
          assigned_team: "technical_support",
          needs_approval: false,
        }),
      );

      // ✅ Verify ticket was updated in database
      const ticketRepo = testDataSource.getRepository("Ticket");
      const updatedTicket = await ticketRepo.findOne({
        where: { id: ticket.id },
      });
      expect(updatedTicket?.status).toBe(TicketStatus.RESOLVED);
    });

    it("should throw error when ticket not found", async () => {
      await expect(
        caller.tickets.approve({
          id: "00000000-0000-0000-0000-000000000000",
          assigned_team: "technical_support",
        }),
      ).rejects.toThrow("Ticket not found");
    });
  });

  describe("reject", () => {
    it("should reject ticket and update status", async () => {
      const customer = await seedCustomer(testDataSource);
      const ticket = await seedPendingApprovalTicket(
        testDataSource,
        customer.id,
      );

      const result = await caller.tickets.reject({
        id: ticket.id,
        reason: "Not enough information",
      });

      expect(result.success).toBe(true);

      // ✅ Verify real update in database
      const ticketRepo = testDataSource.getRepository("Ticket");
      const rejectedTicket = await ticketRepo.findOne({
        where: { id: ticket.id },
      });
      expect(rejectedTicket?.status).toBe(TicketStatus.REJECTED);
      expect(rejectedTicket?.resolution).toContain("Not enough information");
    });
  });

  describe("getAIRecommendations", () => {
    it("should return AI recommendations from Pinecone", async () => {
      const customer = await seedCustomer(testDataSource);
      const ticket = await seedTicket(testDataSource, customer.id, {
        subject: "Login issue",
        body: "Cannot access my account",
      });

      const mockMatches = [
        {
          id: "rec-1",
          score: 0.95,
          metadata: {
            subject: "Similar login issue",
            resolution: "Reset password worked",
            category: "technical",
          },
        },
      ];

      mockFormatTicketForEmbedding.mockReturnValue("formatted ticket text");
      mockCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockPineconeQuery.mockResolvedValue({ matches: mockMatches });

      const result = await caller.tickets.getAIRecommendations({
        ticketId: ticket.id,
      });

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
      const customer = await seedCustomer(testDataSource);
      const ticket = await seedTicket(testDataSource, customer.id);

      mockFormatTicketForEmbedding.mockReturnValue("formatted text");
      mockCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockPineconeQuery.mockResolvedValue({ matches: [] });

      const result = await caller.tickets.getAIRecommendations({
        ticketId: ticket.id,
      });

      expect(result.similar_tickets).toEqual([]);
      expect(result.suggested_solution).toBeUndefined();
    });
  });
});
