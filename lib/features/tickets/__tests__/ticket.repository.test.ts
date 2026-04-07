// Mock database connection BEFORE any imports
jest.mock("@/lib/database/connection");

import { getDataSource } from "@/lib/database/connection";
import { Customer, CustomerTier } from "@/lib/database/entities/Customer";
import { Order } from "@/lib/database/entities/Order";
import { Team } from "@/lib/database/entities/Team";
import { Ticket, TicketPriority } from "@/lib/database/entities/Ticket";
import { TicketStatus } from "@/lib/types/common";

import {
  TicketRepository,
  PendingTicketRow,
  CreateTicketData,
} from "../ticket.repository";

import type { DataSource, Repository } from "typeorm";

describe("TicketRepository", () => {
  let repository: TicketRepository;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockTicketRepo: jest.Mocked<Repository<Ticket>>;
  let mockCustomerRepo: jest.Mocked<Repository<Customer>>;
  let mockOrderRepo: jest.Mocked<Repository<Order>>;
  let mockTeamRepo: jest.Mocked<Repository<Team>>;

  beforeEach(() => {
    // Create mock repositories
    mockTicketRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<Ticket>>;

    mockCustomerRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Repository<Customer>>;

    mockOrderRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Order>>;

    mockTeamRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Team>>;

    // Create mock data source
    mockDataSource = {
      getRepository: jest.fn(
        (
          entity:
            | typeof Ticket
            | typeof Customer
            | typeof Order
            | typeof Team
            | string,
        ) => {
          if (entity === Ticket || entity === "Ticket") return mockTicketRepo;
          if (entity === Customer || entity === "Customer")
            return mockCustomerRepo;
          if (entity === Order || entity === "Order") return mockOrderRepo;
          if (entity === Team || entity === "Team") return mockTeamRepo;
          return mockTicketRepo;
        },
      ),
      query: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    (getDataSource as jest.Mock).mockResolvedValue(mockDataSource);

    repository = new TicketRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findPendingApproval", () => {
    it("should return pending approval tickets from raw SQL query", async () => {
      // Arrange
      const mockPendingTickets: PendingTicketRow[] = [
        {
          id: "ticket-1",
          ticket_number: "TKT-2026-0001",
          subject: "Test ticket",
          status: "OPEN",
          priority: "HIGH",
          priority_score: 85,
          sentiment_label: "ANGRY",
          created_at: new Date("2026-04-05"),
          customer_email: "test@example.com",
          customer_tier: "VIP",
        },
      ];

      mockDataSource.query.mockResolvedValue(mockPendingTickets);

      // Act
      const result = await repository.findPendingApproval();

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
      );
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM tickets t"),
      );
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("INNER JOIN ticket_workflow_states"),
      );
      expect(result).toEqual(mockPendingTickets);
    });
  });

  describe("findByIdWithRelations", () => {
    it("should find ticket with customer and order relations", async () => {
      // Arrange
      const mockTicket = {
        id: "ticket-123",
        ticket_number: "TKT-001",
        subject: "Test",
        customer: { id: "cust-1", email: "test@example.com" },
        order: { id: "order-1", order_number: "ORD-001" },
      } as Ticket;

      mockTicketRepo.findOne.mockResolvedValue(mockTicket);

      // Act
      const result = await repository.findByIdWithRelations("ticket-123");

      // Assert
      expect(mockTicketRepo.findOne).toHaveBeenCalledWith({
        where: { id: "ticket-123" },
        relations: ["customer", "order"],
      });
      expect(result).toEqual(mockTicket);
    });

    it("should return null when ticket not found", async () => {
      // Arrange
      mockTicketRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findByIdWithRelations("non-existent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findCustomerByEmail", () => {
    it("should find customer by email", async () => {
      // Arrange
      const mockCustomer = {
        id: "customer-1",
        email: "test@example.com",
        name: "Test User",
      } as Customer;

      mockCustomerRepo.findOne.mockResolvedValue(mockCustomer);

      // Act
      const result = await repository.findCustomerByEmail("test@example.com");

      // Assert
      expect(mockCustomerRepo.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(result).toEqual(mockCustomer);
    });

    it("should return null when customer not found", async () => {
      // Arrange
      mockCustomerRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findCustomerByEmail(
        "nonexistent@example.com",
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("createCustomer", () => {
    it("should create and save new customer", async () => {
      // Arrange
      const customerData = {
        name: "New User",
        email: "new@example.com",
        tier: CustomerTier.NEW,
      };

      const createdCustomer = {
        id: "customer-new",
        ...customerData,
        total_orders: 0,
        total_spent: 0,
        lifetime_value: 0,
      } as Customer;

      mockCustomerRepo.create.mockReturnValue(createdCustomer);
      mockCustomerRepo.save.mockResolvedValue(createdCustomer);

      // Act
      const result = await repository.createCustomer(customerData);

      // Assert
      expect(mockCustomerRepo.create).toHaveBeenCalledWith({
        name: customerData.name,
        email: customerData.email,
        tier: customerData.tier,
        total_orders: 0,
        total_spent: 0,
        lifetime_value: 0,
      });
      expect(mockCustomerRepo.save).toHaveBeenCalledWith(createdCustomer);
      expect(result).toEqual(createdCustomer);
    });
  });

  describe("findOrderByNumber", () => {
    it("should find order by order number", async () => {
      // Arrange
      const mockOrder = {
        id: "order-1",
        order_number: "ORD-001",
      } as Order;

      mockOrderRepo.findOne.mockResolvedValue(mockOrder);

      // Act
      const result = await repository.findOrderByNumber("ORD-001");

      // Assert
      expect(mockOrderRepo.findOne).toHaveBeenCalledWith({
        where: { order_number: "ORD-001" },
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe("createTicket", () => {
    it("should create and save new ticket", async () => {
      // Arrange
      const ticketData: CreateTicketData = {
        ticket_number: "TKT-2026-0001",
        subject: "Test ticket",
        body: "Test body",
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        customer_id: "customer-1",
        order_id: "order-1",
      };

      const createdTicket = {
        id: "ticket-new",
        ...ticketData,
      } as Ticket;

      mockTicketRepo.create.mockReturnValue(createdTicket);
      mockTicketRepo.save.mockResolvedValue(createdTicket);

      // Act
      const result = await repository.createTicket(ticketData);

      // Assert
      expect(mockTicketRepo.create).toHaveBeenCalledWith(ticketData);
      expect(mockTicketRepo.save).toHaveBeenCalledWith(createdTicket);
      expect(result).toEqual(createdTicket);
    });
  });

  describe("updateTicketThreadId", () => {
    it("should update ticket thread_id", async () => {
      // Arrange
      const ticketId = "ticket-123";
      const threadId = "ticket-123-thread";

      mockTicketRepo.update.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      // Act
      await repository.updateTicketThreadId(ticketId, threadId);

      // Assert
      expect(mockTicketRepo.update).toHaveBeenCalledWith(
        { id: ticketId },
        { thread_id: threadId },
      );
    });
  });

  describe("findById", () => {
    it("should find ticket by ID without relations", async () => {
      // Arrange
      const mockTicket = {
        id: "ticket-123",
        ticket_number: "TKT-001",
      } as Ticket;

      mockTicketRepo.findOne.mockResolvedValue(mockTicket);

      // Act
      const result = await repository.findById("ticket-123");

      // Assert
      expect(mockTicketRepo.findOne).toHaveBeenCalledWith({
        where: { id: "ticket-123" },
      });
      expect(result).toEqual(mockTicket);
    });
  });

  describe("updateTicket", () => {
    it("should update ticket with partial data", async () => {
      // Arrange
      const ticketId = "ticket-123";
      const updateData: Partial<Ticket> = {
        status: TicketStatus.RESOLVED,
        resolution: "Fixed",
      };

      mockTicketRepo.update.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      // Act
      await repository.updateTicket(ticketId, updateData);

      // Assert
      expect(mockTicketRepo.update).toHaveBeenCalledWith(
        { id: ticketId },
        updateData,
      );
    });
  });

  describe("saveTicket", () => {
    it("should save ticket entity", async () => {
      // Arrange
      const ticketToSave = {
        id: "ticket-123",
        status: TicketStatus.RESOLVED,
      } as Ticket;

      mockTicketRepo.save.mockResolvedValue(ticketToSave);

      // Act
      const result = await repository.saveTicket(ticketToSave);

      // Assert
      expect(mockTicketRepo.save).toHaveBeenCalledWith(ticketToSave);
      expect(result).toEqual(ticketToSave);
    });
  });

  describe("findTeamByName", () => {
    it("should find team by name", async () => {
      // Arrange
      const mockTeam = {
        id: "team-1",
        name: "Technical Support",
        members: ["John Doe", "Jane Smith"],
      } as Team;

      mockTeamRepo.findOne.mockResolvedValue(mockTeam);

      // Act
      const result = await repository.findTeamByName("Technical Support");

      // Assert
      expect(mockTeamRepo.findOne).toHaveBeenCalledWith({
        where: { name: "Technical Support" },
      });
      expect(result).toEqual(mockTeam);
    });

    it("should return null when team not found", async () => {
      // Arrange
      mockTeamRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findTeamByName("Nonexistent Team");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("clearTicketThreadId", () => {
    it("should clear thread_id using raw SQL", async () => {
      // Arrange
      const ticketId = "ticket-123";
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockTicketRepo.createQueryBuilder.mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockQueryBuilder as any,
      );

      // Act
      await repository.clearTicketThreadId(ticketId);

      // Assert
      expect(mockTicketRepo.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        thread_id: expect.any(Function),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id", {
        id: ticketId,
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});
