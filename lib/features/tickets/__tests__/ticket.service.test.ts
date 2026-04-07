// Mock database connection BEFORE any imports
jest.mock("@/lib/database/connection");

// Mock repository
jest.mock("../ticket.repository");

// Mock workflow (to avoid ESM import issues with @langchain/langgraph)
jest.mock("@/lib/langgraph/workflow", () => ({
  resumeWorkflow: jest.fn(),
}));

// Mock Pinecone client
jest.mock("@/lib/clients/pinecone", () => ({
  pineconeIndex: {
    namespace: jest.fn().mockReturnValue({
      query: jest.fn(),
    }),
  },
  PINECONE_NAMESPACE: "test-namespace",
}));

// Mock embeddings service
jest.mock("@/lib/services/embeddings", () => ({
  createEmbedding: jest.fn(),
  formatTicketForEmbedding: jest.fn(),
}));

import { pineconeIndex } from "@/lib/clients/pinecone";
import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import { Order, OrderStatus } from "@/lib/database/entities/Order";
import { Ticket, TicketPriority } from "@/lib/database/entities/Ticket";
import { resumeWorkflow } from "@/lib/langgraph/workflow";
import {
  createEmbedding,
  formatTicketForEmbedding,
} from "@/lib/services/embeddings";
import { TicketStatus, SentimentLabel } from "@/lib/types/common";

import { TicketRepository } from "../ticket.repository";
import { TicketService } from "../ticket.service";

// Get typed mocks
const mockResumeWorkflow = jest.mocked(resumeWorkflow);
const mockCreateEmbedding = jest.mocked(createEmbedding);
const mockFormatTicketForEmbedding = jest.mocked(formatTicketForEmbedding);
const mockPineconeNamespace = jest.mocked(pineconeIndex.namespace);
const mockPineconeQuery = jest.mocked(
  pineconeIndex.namespace("test-namespace").query,
);

describe("TicketService", () => {
  let service: TicketService;
  let mockRepository: jest.Mocked<TicketRepository>;

  beforeEach(() => {
    // Create mock repository instance
    mockRepository = {
      findPendingApproval: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findCustomerByEmail: jest.fn(),
      createCustomer: jest.fn(),
      findOrderByNumber: jest.fn(),
      createTicket: jest.fn(),
      updateTicketThreadId: jest.fn(),
      findById: jest.fn(),
      saveTicket: jest.fn(),
      clearTicketThreadId: jest.fn(),
      findTeamByName: jest.fn(),
    } as unknown as jest.Mocked<TicketRepository>;

    // Inject mock repository into service
    service = new TicketService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTicketDetails", () => {
    it("should return full ticket details with customer and order", async () => {
      // Arrange
      const mockCustomer: Partial<Customer> = {
        id: "customer-123",
        email: "test@example.com",
        name: "Test User",
        tier: CustomerTier.VIP,
        total_orders: 5,
        lifetime_value: 1500.5,
      };

      const mockOrder: Partial<Order> = {
        id: "order-123",
        order_number: "ORD-2026-0001",
        total_price: 299.99,
        status: OrderStatus.DELIVERED,
      };

      const mockTicket: Partial<Ticket> = {
        id: "ticket-123",
        ticket_number: "TKT-2026-0405-0001",
        subject: "Product issue",
        body: "Product is not working",
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        priority_score: 85,
        category: "technical",
        sentiment_label: SentimentLabel.ANGRY,
        sentiment_score: 0.25,
        assigned_team: "TECHNICAL_SUPPORT",
        assigned_to: "John Doe",
        customer: mockCustomer as Customer,
        order: mockOrder as Order,
        created_at: new Date("2026-04-05T10:00:00Z"),
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(
        mockTicket as Ticket,
      );

      // Act
      const result = await service.getTicketDetails("ticket-123");

      // Assert
      expect(mockRepository.findByIdWithRelations).toHaveBeenCalledWith(
        "ticket-123",
      );

      expect(result).toEqual({
        id: "ticket-123",
        ticket_number: "TKT-2026-0405-0001",
        subject: "Product issue",
        body: "Product is not working",
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        priority_score: 85,
        category: "technical",
        sentiment_label: SentimentLabel.ANGRY,
        sentiment_score: 0.25,
        assigned_team: "TECHNICAL_SUPPORT",
        assigned_to: "John Doe",
        customer: {
          email: "test@example.com",
          name: "Test User",
          tier: CustomerTier.VIP,
          total_orders: 5,
          lifetime_value: 1500.5,
        },
        order: {
          order_number: "ORD-2026-0001",
          total_price: 299.99,
          status: OrderStatus.DELIVERED,
        },
        created_at: new Date("2026-04-05T10:00:00Z"),
      });
    });

    it("should return ticket without customer and order if not present", async () => {
      // Arrange
      const mockTicket: Partial<Ticket> = {
        id: "ticket-456",
        ticket_number: "TKT-2026-0405-0002",
        subject: "General inquiry",
        body: "Question about service",
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        priority_score: undefined,
        category: undefined,
        sentiment_label: undefined,
        sentiment_score: undefined,
        assigned_team: undefined,
        assigned_to: undefined,
        customer: undefined,
        order: undefined,
        created_at: new Date("2026-04-05T11:00:00Z"),
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(
        mockTicket as Ticket,
      );

      // Act
      const result = await service.getTicketDetails("ticket-456");

      // Assert
      expect(result.customer).toBeNull();
      expect(result.order).toBeNull();
      expect(result.id).toBe("ticket-456");
    });

    it("should convert sentiment_score to number if present", async () => {
      // Arrange
      const mockTicket: Partial<Ticket> = {
        id: "ticket-789",
        ticket_number: "TKT-2026-0405-0003",
        subject: "Test",
        body: "Test body",
        status: TicketStatus.OPEN,
        priority: TicketPriority.LOW,
        sentiment_score: "0.75" as unknown as number, // Simulating string from DB
        customer: undefined,
        order: undefined,
        created_at: new Date(),
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(
        mockTicket as Ticket,
      );

      // Act
      const result = await service.getTicketDetails("ticket-789");

      // Assert
      expect(result.sentiment_score).toBe(0.75);
      expect(typeof result.sentiment_score).toBe("number");
    });

    it("should return null for sentiment_score if not present", async () => {
      // Arrange
      const mockTicket: Partial<Ticket> = {
        id: "ticket-999",
        ticket_number: "TKT-2026-0405-0004",
        subject: "Test",
        body: "Test body",
        status: TicketStatus.OPEN,
        priority: TicketPriority.LOW,
        sentiment_score: undefined,
        customer: undefined,
        order: undefined,
        created_at: new Date(),
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(
        mockTicket as Ticket,
      );

      // Act
      const result = await service.getTicketDetails("ticket-999");

      // Assert
      expect(result.sentiment_score).toBeNull();
    });

    it("should throw error if ticket not found", async () => {
      // Arrange
      mockRepository.findByIdWithRelations.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getTicketDetails("non-existent-id")).rejects.toThrow(
        "Ticket not found",
      );

      expect(mockRepository.findByIdWithRelations).toHaveBeenCalledWith(
        "non-existent-id",
      );
    });

    it("should convert customer lifetime_value to number", async () => {
      // Arrange
      const mockCustomer: Partial<Customer> = {
        id: "customer-999",
        email: "test@example.com",
        name: "Test User",
        tier: CustomerTier.VIP,
        total_orders: 10,
        lifetime_value: "5000.50" as unknown as number, // String from DB
      };

      const mockTicket: Partial<Ticket> = {
        id: "ticket-abc",
        ticket_number: "TKT-2026-0405-0005",
        subject: "VIP customer",
        body: "VIP inquiry",
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        customer: mockCustomer as Customer,
        order: undefined,
        created_at: new Date(),
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(
        mockTicket as Ticket,
      );

      // Act
      const result = await service.getTicketDetails("ticket-abc");

      // Assert
      expect(result.customer?.lifetime_value).toBe(5000.5);
      expect(typeof result.customer?.lifetime_value).toBe("number");
    });

    it("should convert order total_price to number", async () => {
      // Arrange
      const mockOrder: Partial<Order> = {
        id: "order-xyz",
        order_number: "ORD-2026-0002",
        total_price: "499.99" as unknown as number, // String from DB
        status: OrderStatus.PENDING,
      };

      const mockTicket: Partial<Ticket> = {
        id: "ticket-def",
        ticket_number: "TKT-2026-0405-0006",
        subject: "Order inquiry",
        body: "Question about order",
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        customer: undefined,
        order: mockOrder as Order,
        created_at: new Date(),
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(
        mockTicket as Ticket,
      );

      // Act
      const result = await service.getTicketDetails("ticket-def");

      // Assert
      expect(result.order?.total_price).toBe(499.99);
      expect(typeof result.order?.total_price).toBe("number");
    });
  });

  describe("getPendingApprovalTickets", () => {
    it("should return list of pending approval tickets", async () => {
      // Arrange
      const mockRows = [
        {
          id: "ticket-1",
          ticket_number: "TKT-2026-0405-0001",
          subject: "Need approval",
          status: "open",
          priority: "high",
          priority_score: 90,
          sentiment_label: "ANGRY",
          created_at: new Date("2026-04-05T10:00:00Z"),
          customer_email: "customer1@example.com",
          customer_tier: "VIP",
        },
        {
          id: "ticket-2",
          ticket_number: "TKT-2026-0405-0002",
          subject: "Another pending ticket",
          status: "open",
          priority: "medium",
          priority_score: 60,
          sentiment_label: "NEUTRAL",
          created_at: new Date("2026-04-05T11:00:00Z"),
          customer_email: "customer2@example.com",
          customer_tier: "REGULAR",
        },
      ];

      mockRepository.findPendingApproval.mockResolvedValue(mockRows);

      // Act
      const result = await service.getPendingApprovalTickets();

      // Assert
      expect(mockRepository.findPendingApproval).toHaveBeenCalled();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "ticket-1",
        ticket_number: "TKT-2026-0405-0001",
        subject: "Need approval",
        status: "open",
        priority: "high",
        priority_score: 90,
        customer_tier: "VIP",
        sentiment_label: "ANGRY",
        created_at: new Date("2026-04-05T10:00:00Z"),
      });
      expect(result[1]).toEqual({
        id: "ticket-2",
        ticket_number: "TKT-2026-0405-0002",
        subject: "Another pending ticket",
        status: "open",
        priority: "medium",
        priority_score: 60,
        customer_tier: "REGULAR",
        sentiment_label: "NEUTRAL",
        created_at: new Date("2026-04-05T11:00:00Z"),
      });
    });

    it("should return empty array when no pending tickets", async () => {
      // Arrange
      mockRepository.findPendingApproval.mockResolvedValue([]);

      // Act
      const result = await service.getPendingApprovalTickets();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle tickets with null values", async () => {
      // Arrange
      const mockRows = [
        {
          id: "ticket-3",
          ticket_number: "TKT-2026-0405-0003",
          subject: "Minimal ticket",
          status: "open",
          priority: null,
          priority_score: null,
          sentiment_label: null,
          created_at: new Date("2026-04-05T12:00:00Z"),
          customer_email: null,
          customer_tier: null,
        },
      ];

      mockRepository.findPendingApproval.mockResolvedValue(mockRows);

      // Act
      const result = await service.getPendingApprovalTickets();

      // Assert
      expect(result[0].priority).toBeNull();
      expect(result[0].priority_score).toBeNull();
      expect(result[0].sentiment_label).toBeNull();
      expect(result[0].customer_tier).toBeNull();
    });
  });

  describe("createTicket", () => {
    it("should create ticket for existing customer", async () => {
      // Arrange
      const input = {
        email: "existing@example.com",
        subject: "Test ticket",
        body: "Test body",
        order_number: "ORD-001",
      };

      const mockCustomer = {
        id: "customer-1",
        email: "existing@example.com",
      } as Customer;

      const mockOrder = {
        id: "order-1",
        order_number: "ORD-001",
      } as Order;

      const mockCreatedTicket = {
        id: "ticket-new",
        ticket_number: "TKT-2026-0405-1234",
        status: TicketStatus.OPEN,
        created_at: new Date(),
      } as Ticket;

      mockRepository.findCustomerByEmail.mockResolvedValue(mockCustomer);
      mockRepository.findOrderByNumber.mockResolvedValue(mockOrder);
      mockRepository.createTicket.mockResolvedValue(mockCreatedTicket);
      mockRepository.updateTicketThreadId.mockResolvedValue();

      // Act
      const result = await service.createTicket(input);

      // Assert
      expect(mockRepository.findCustomerByEmail).toHaveBeenCalledWith(
        "existing@example.com",
      );
      expect(mockRepository.createCustomer).not.toHaveBeenCalled();
      expect(mockRepository.findOrderByNumber).toHaveBeenCalledWith("ORD-001");
      expect(mockRepository.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Test ticket",
          body: "Test body",
          status: TicketStatus.OPEN,
          priority: TicketPriority.MEDIUM,
          customer_id: "customer-1",
          order_id: "order-1",
        }),
      );
      expect(mockRepository.updateTicketThreadId).toHaveBeenCalledWith(
        "ticket-new",
        "ticket-ticket-new",
      );
      expect(result).toEqual({
        ticket_number: "TKT-2026-0405-1234",
        id: "ticket-new",
        status: TicketStatus.OPEN,
        created_at: mockCreatedTicket.created_at,
      });
    });

    it("should create new customer if not exists", async () => {
      // Arrange
      const input = {
        email: "newuser@example.com",
        subject: "New customer ticket",
        body: "First ticket",
      };

      const mockNewCustomer = {
        id: "customer-new",
        email: "newuser@example.com",
        name: "Newuser",
      } as Customer;

      const mockCreatedTicket = {
        id: "ticket-new-2",
        ticket_number: "TKT-2026-0405-5678",
        status: TicketStatus.OPEN,
        created_at: new Date(),
      } as Ticket;

      mockRepository.findCustomerByEmail.mockResolvedValue(null);
      mockRepository.createCustomer.mockResolvedValue(mockNewCustomer);
      mockRepository.createTicket.mockResolvedValue(mockCreatedTicket);
      mockRepository.updateTicketThreadId.mockResolvedValue();

      // Act
      const result = await service.createTicket(input);

      // Assert
      expect(mockRepository.createCustomer).toHaveBeenCalledWith({
        name: "Newuser",
        email: "newuser@example.com",
        tier: CustomerTier.NEW,
      });
      expect(mockRepository.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: "customer-new",
          order_id: undefined,
        }),
      );
      expect(result.id).toBe("ticket-new-2");
    });

    it("should handle ticket without order", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        subject: "No order ticket",
        body: "General inquiry",
      };

      const mockCustomer = { id: "customer-1" } as Customer;
      const mockCreatedTicket = {
        id: "ticket-3",
        ticket_number: "TKT-001",
        status: TicketStatus.OPEN,
        created_at: new Date(),
      } as Ticket;

      mockRepository.findCustomerByEmail.mockResolvedValue(mockCustomer);
      mockRepository.createTicket.mockResolvedValue(mockCreatedTicket);
      mockRepository.updateTicketThreadId.mockResolvedValue();

      // Act
      await service.createTicket(input);

      // Assert
      expect(mockRepository.findOrderByNumber).not.toHaveBeenCalled();
      expect(mockRepository.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: undefined,
        }),
      );
    });

    it("should generate valid ticket number format", async () => {
      // Arrange
      const input = {
        email: "test@example.com",
        subject: "Test",
        body: "Test",
      };

      const mockCustomer = { id: "customer-1" } as Customer;
      const mockCreatedTicket = {
        id: "ticket-4",
        ticket_number: "TKT-2026-0405-0001",
        status: TicketStatus.OPEN,
        created_at: new Date(),
      } as Ticket;

      mockRepository.findCustomerByEmail.mockResolvedValue(mockCustomer);
      mockRepository.createTicket.mockResolvedValue(mockCreatedTicket);
      mockRepository.updateTicketThreadId.mockResolvedValue();

      // Act
      await service.createTicket(input);

      // Assert
      const createCall = mockRepository.createTicket.mock.calls[0][0];
      expect(createCall.ticket_number).toMatch(/^TKT-\d{4}-\d{4}-\d{4}$/);
    });
  });

  describe("approveTicket", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should approve ticket with workflow", async () => {
      // Arrange
      const input = {
        id: "ticket-1",
        assigned_team: "TECHNICAL_SUPPORT",
        resolution: "Issue resolved",
      };

      const mockTicket = {
        id: "ticket-1",
        thread_id: "thread-123",
      } as Ticket;

      const mockUpdatedTicket = {
        id: "ticket-1",
        ticket_number: "TKT-001",
        status: TicketStatus.OPEN,
        assigned_to: undefined,
      } as Ticket;

      const mockTeam = {
        id: "team-1",
        name: "Technical Support",
        members: ["Alice", "Bob", "Charlie"],
      };

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockRepository.findByIdWithRelations.mockResolvedValue(mockUpdatedTicket);
      mockRepository.findTeamByName.mockResolvedValue(mockTeam);
      mockRepository.saveTicket.mockResolvedValue(mockUpdatedTicket);
      mockRepository.clearTicketThreadId.mockResolvedValue();

      // Act
      const result = await service.approveTicket(input);

      // Assert
      expect(mockResumeWorkflow).toHaveBeenCalledWith("thread-123", {
        resolution: "Issue resolved",
        assigned_team: "TECHNICAL_SUPPORT",
        needs_approval: false,
      });
      expect(mockRepository.saveTicket).toHaveBeenCalled();
      expect(mockRepository.clearTicketThreadId).toHaveBeenCalledWith(
        "ticket-1",
      );
      expect(result).toEqual({
        success: true,
        ticket_number: "TKT-001",
      });
    });

    it("should approve ticket without workflow (fallback)", async () => {
      // Arrange
      const input = {
        id: "ticket-2",
        assigned_team: "BILLING",
        resolution: "Billing corrected",
      };

      const mockTicket = {
        id: "ticket-2",
        ticket_number: "TKT-002",
        thread_id: undefined, // No workflow
      } as Partial<Ticket> as Ticket;

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockRepository.saveTicket.mockResolvedValue(mockTicket);

      // Act
      const result = await service.approveTicket(input);

      // Assert
      expect(mockResumeWorkflow).not.toHaveBeenCalled();
      expect(mockRepository.saveTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TicketStatus.IN_PROGRESS,
          assigned_team: "BILLING",
          resolution: "Billing corrected",
        }),
      );
      expect(result).toEqual({
        success: true,
        ticket_number: "TKT-002",
      });
    });

    it("should throw error if ticket not found", async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.approveTicket({
          id: "non-existent",
          assigned_team: "SUPPORT",
        }),
      ).rejects.toThrow("Ticket not found");
    });

    it("should assign random team member if not set by workflow", async () => {
      // Arrange
      const input = {
        id: "ticket-3",
        assigned_team: "TECHNICAL_SUPPORT",
      };

      const mockTicket = {
        id: "ticket-3",
        thread_id: "thread-456",
      } as Ticket;

      const mockUpdatedTicket = {
        id: "ticket-3",
        ticket_number: "TKT-003",
        assigned_to: undefined,
      } as Partial<Ticket> as Ticket;

      const mockTeam = {
        id: "team-1",
        name: "Technical Support",
        members: ["Alice", "Bob"],
      };

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockRepository.findByIdWithRelations.mockResolvedValue(mockUpdatedTicket);
      mockRepository.findTeamByName.mockResolvedValue(mockTeam);
      mockRepository.saveTicket.mockResolvedValue(mockUpdatedTicket);
      mockRepository.clearTicketThreadId.mockResolvedValue();

      // Act
      await service.approveTicket(input);

      // Assert
      const savedTicket = mockRepository.saveTicket.mock.calls[0][0];
      expect(["Alice", "Bob"]).toContain(savedTicket.assigned_to);
    });
  });

  describe("rejectTicket", () => {
    it("should reject ticket and clear thread_id", async () => {
      // Arrange
      const input = {
        id: "ticket-1",
        reason: "Invalid request",
      };

      const mockTicket = {
        id: "ticket-1",
        ticket_number: "TKT-001",
        thread_id: "thread-123",
      } as Ticket;

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockRepository.saveTicket.mockResolvedValue(mockTicket);
      mockRepository.clearTicketThreadId.mockResolvedValue();

      // Act
      const result = await service.rejectTicket(input);

      // Assert
      expect(mockRepository.saveTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TicketStatus.REJECTED,
          resolution: "Rejected by manager: Invalid request",
        }),
      );
      expect(mockRepository.clearTicketThreadId).toHaveBeenCalledWith(
        "ticket-1",
      );
      expect(result).toEqual({
        success: true,
        ticket_number: "TKT-001",
      });
    });

    it("should reject ticket without thread_id", async () => {
      // Arrange
      const input = {
        id: "ticket-2",
        reason: "Spam",
      };

      const mockTicket = {
        id: "ticket-2",
        ticket_number: "TKT-002",
        thread_id: undefined,
      } as Partial<Ticket> as Ticket;

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockRepository.saveTicket.mockResolvedValue(mockTicket);

      // Act
      await service.rejectTicket(input);

      // Assert
      expect(mockRepository.clearTicketThreadId).not.toHaveBeenCalled();
    });

    it("should throw error if ticket not found", async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.rejectTicket({ id: "non-existent", reason: "Test" }),
      ).rejects.toThrow("Ticket not found");
    });
  });

  describe("getAIRecommendations", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return AI recommendations with similar tickets", async () => {
      // Arrange
      const mockTicket = {
        id: "ticket-1",
        subject: "Product not working",
        body: "The product stopped working",
        category: "technical",
      } as Ticket;

      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockQueryResponse = {
        namespace: "test-namespace",
        matches: [
          {
            id: "similar-1",
            score: 0.92,
            metadata: {
              subject: "Similar issue",
              category: "technical",
              resolution: "Reboot the device",
            },
          },
          {
            id: "similar-2",
            score: 0.75,
            metadata: {
              subject: "Another issue",
              category: "technical",
              resolution: "Update firmware",
            },
          },
        ],
      };

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockFormatTicketForEmbedding.mockReturnValue("formatted text");
      mockCreateEmbedding.mockResolvedValue(mockEmbedding);
      mockPineconeQuery.mockResolvedValue(mockQueryResponse);

      // Act
      const result = await service.getAIRecommendations("ticket-1");

      // Assert
      expect(mockFormatTicketForEmbedding).toHaveBeenCalledWith(
        "Product not working",
        "The product stopped working",
        "technical",
      );
      expect(mockCreateEmbedding).toHaveBeenCalledWith("formatted text");
      expect(mockPineconeNamespace).toHaveBeenCalledWith("test-namespace");
      expect(result.similar_tickets).toHaveLength(2);
      expect(result.similar_tickets[0]).toEqual({
        id: "similar-1",
        subject: "Similar issue",
        category: "technical",
        resolution: "Reboot the device",
        similarity: 0.92,
      });
      expect(result.suggested_solution).toBe("Reboot the device");
    });

    it("should return empty results on error", async () => {
      // Arrange
      const mockTicket = {
        id: "ticket-2",
        subject: "Test",
        body: "Test",
      } as Ticket;

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockCreateEmbedding.mockRejectedValue(new Error("API error"));

      // Act
      const result = await service.getAIRecommendations("ticket-2");

      // Assert
      expect(result).toEqual({
        similar_tickets: [],
        suggested_solution: undefined,
      });
    });

    it("should filter out invalid matches", async () => {
      // Arrange
      const mockTicket = {
        id: "ticket-3",
        subject: "Test",
        body: "Test",
      } as Ticket;

      const mockQueryResponse = {
        namespace: "test-namespace",
        matches: [
          {
            id: "valid-1",
            score: 0.85,
            metadata: {
              subject: "Valid",
              resolution: "Fixed",
            },
          },
          {
            id: null, // Invalid - no id
            score: 0.9,
            metadata: { subject: "No ID", resolution: "Test" },
          },
          {
            id: "invalid-2",
            score: 0.8,
            metadata: {
              subject: "No resolution",
              // Missing resolution
            },
          },
        ],
      };

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockCreateEmbedding.mockResolvedValue([0.1, 0.2]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockPineconeQuery.mockResolvedValue(mockQueryResponse as any);

      // Act
      const result = await service.getAIRecommendations("ticket-3");

      // Assert
      expect(result.similar_tickets).toHaveLength(1);
      expect(result.similar_tickets[0].id).toBe("valid-1");
    });

    it("should not suggest solution if similarity < 80%", async () => {
      // Arrange
      const mockTicket = {
        id: "ticket-4",
        subject: "Test",
        body: "Test",
      } as Ticket;

      const mockQueryResponse = {
        namespace: "test-namespace",
        matches: [
          {
            id: "match-1",
            score: 0.75, // Below 80%
            metadata: {
              subject: "Low similarity",
              resolution: "Some solution",
            },
          },
        ],
      };

      mockRepository.findById.mockResolvedValue(mockTicket);
      mockCreateEmbedding.mockResolvedValue([0.1]);
      mockPineconeQuery.mockResolvedValue(mockQueryResponse);

      // Act
      const result = await service.getAIRecommendations("ticket-4");

      // Assert
      expect(result.suggested_solution).toBeUndefined();
    });

    it("should throw error if ticket not found", async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getAIRecommendations("non-existent"),
      ).rejects.toThrow("Ticket not found");
    });
  });
});
