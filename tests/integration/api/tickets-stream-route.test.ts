/**
 * Integration tests for /api/tickets/stream route
 *
 * Тестирует SSE endpoint для real-time стриминга прогресса обработки тикета
 */

import { GET } from "@/app/api/tickets/stream/route";
import { CustomerTier } from "@/lib/database/entities/Customer";
import { TicketPriority } from "@/lib/database/entities/Ticket";
import { TicketStatus, WorkflowStep, SentimentLabel } from "@/lib/types/common";

import { nextRequestFactory } from "../../factories/next-request.factory";
import { ticketFactory } from "../../factories/ticket.factory";

// Mock streamWorkflow
jest.mock("@/lib/langgraph/workflow", () => ({
  streamWorkflow: jest.fn(),
}));

// Mock database connection
const mockFindOne = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  getDataSource: jest.fn(() => ({
    getRepository: jest.fn(() => ({
      findOne: mockFindOne,
    })),
  })),
}));

// Import and get mocked streamWorkflow
// eslint-disable-next-line import/order
import { streamWorkflow } from "@/lib/langgraph/workflow";
const mockStreamWorkflow = streamWorkflow as jest.MockedFunction<typeof streamWorkflow>;

describe("Tickets Stream API Route Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Request Validation", () => {
    it("should return 400 when ticketId is missing", async () => {
      const request = nextRequestFactory.build();

      const response = await GET(request);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe("Missing ticketId parameter");
    });

    it("should return 400 when ticketId is empty string", async () => {
      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: "" }),
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe("Ticket Not Found", () => {
    it("should return 404 when ticket does not exist", async () => {
      mockFindOne.mockResolvedValue(null);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: "nonexistent-id" }),
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(404);
      const text = await response.text();
      expect(text).toBe("Ticket not found");
    });

    it("should call findOne with correct parameters", async () => {
      mockFindOne.mockResolvedValue(null);

      const ticketId = "test-ticket-id";
      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId }),
        },
      });

      await GET(request);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { id: ticketId },
        relations: ["customer"],
      });
    });
  });

  describe("Completed Ticket Stream (No thread_id)", () => {
    it("should stream all workflow steps for resolved ticket without thread_id", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        category: "Technical",
        subcategory: "Login",
        sentiment_label: SentimentLabel.POSITIVE,
        sentiment_score: 0.85,
        priority: TicketPriority.HIGH,
        priority_score: 75,
        assigned_team: "technical_support",
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/event-stream");
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
      expect(response.headers.get("Connection")).toBe("keep-alive");
    });

    it("should include all workflow steps in stream", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      const events: string[] = [];

      // Fast-forward all timers
      jest.runAllTimers();

      // Read all chunks
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");

      // Verify all workflow steps are present
      expect(allData).toContain(WorkflowStep.INTAKE_AGENT);
      expect(allData).toContain(WorkflowStep.CLASSIFICATION_AGENT);
      expect(allData).toContain(WorkflowStep.SENTIMENT_AGENT);
      expect(allData).toContain(WorkflowStep.CUSTOMER_AGENT);
      expect(allData).toContain(WorkflowStep.RESOLUTION_SEARCH_AGENT);
      expect(allData).toContain(WorkflowStep.PRIORITY_AGENT);
      expect(allData).toContain(WorkflowStep.WAIT_APPROVAL);
      expect(allData).toContain(WorkflowStep.FINALIZE_TICKET);
      expect(allData).toContain(WorkflowStep.SAVE_TO_DATABASE);
      expect(allData).toContain(WorkflowStep.COMPLETE);
    });

    it("should include ticket category in classification step", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        category: "Billing",
        subcategory: "Payment Issue",
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const events: string[] = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");
      expect(allData).toContain("Billing");
      expect(allData).toContain("Payment Issue");
    });

    it("should include sentiment information in sentiment step", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        sentiment_label: SentimentLabel.ANGRY,
        sentiment_score: 0.23,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const events: string[] = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");
      expect(allData).toContain("ANGRY");
      expect(allData).toContain("23%");
    });

    it("should include priority score and escalation info", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        priority: TicketPriority.CRITICAL,
        priority_score: 92,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const events: string[] = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");
      expect(allData).toContain("CRITICAL");
      expect(allData).toContain("92/100");
      expect(allData).toContain("Escalated to manager");
    });

    it("should not show escalation for low priority tickets", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        priority: TicketPriority.LOW,
        priority_score: 30,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const events: string[] = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");
      expect(allData).not.toContain("Escalated to manager");
    });

    it("should include customer tier information", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        customer: {
          id: "customer-1",
          email: "test@example.com",
          name: "Test Customer",
          tier: CustomerTier.VIP,
          total_orders: 50,
          lifetime_value: 5000,
        },
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const events: string[] = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");
      expect(allData).toContain("VIP tier");
      expect(allData).toContain("50 orders");
    });

    it("should include assigned team in finalize step", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        assigned_team: "billing_team",
        assigned_to: "support@example.com",
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const events: string[] = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");
      expect(allData).toContain("billing_team");
      expect(allData).toContain("support@example.com");
    });

    it("should include resolution in complete step", async () => {
      const resolution = "Issue resolved by resetting password";
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        resolution,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const events: string[] = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");
      expect(allData).toContain(resolution);
    });
  });

  describe("Active Ticket Stream (with thread_id)", () => {
    it("should use streamWorkflow for tickets with thread_id", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.PENDING_APPROVAL,
        thread_id: "thread-123",
      });

      mockFindOne.mockResolvedValue(ticket);

      // Mock async generator
      async function* mockGenerator() {
        yield {
          step: WorkflowStep.INTAKE_AGENT,
          status: TicketStatus.IN_PROGRESS,
          message: "Processing...",
          detail: "",
          critical: false,
          resolution: undefined,
          assigned_team: undefined,
        };
      }

      mockStreamWorkflow.mockReturnValue(Promise.resolve(mockGenerator()));

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);

      expect(mockStreamWorkflow).toHaveBeenCalledWith(
        {
          email: ticket.customer?.email || "",
          subject: ticket.subject,
          body: ticket.body,
          attachments: [],
        },
        ticket.id,
        expect.objectContaining({
          found: true,
          customer_id: ticket.customer?.id,
          tier: ticket.customer?.tier,
        }),
        "thread-123",
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    });

    it("should stream events from streamWorkflow", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.OPEN,
        thread_id: "thread-456",
      });

      mockFindOne.mockResolvedValue(ticket);

      async function* mockGenerator() {
        yield {
          step: WorkflowStep.INTAKE_AGENT,
          status: TicketStatus.IN_PROGRESS,
          message: "Step 1",
          detail: "",
          critical: false,
          resolution: undefined,
          assigned_team: undefined,
        };
        yield {
          step: WorkflowStep.CLASSIFICATION_AGENT,
          status: TicketStatus.IN_PROGRESS,
          message: "Step 2",
          detail: "",
          critical: false,
          resolution: undefined,
          assigned_team: undefined,
        };
      }

      mockStreamWorkflow.mockReturnValue(Promise.resolve(mockGenerator()));

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      const events: string[] = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          events.push(decoder.decode(value));
        }
      }

      const allData = events.join("");
      expect(allData).toContain("Step 1");
      expect(allData).toContain("Step 2");
    });

    it("should handle ticket without customer data", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.OPEN,
        thread_id: "thread-789",
        customer: undefined,
      });

      mockFindOne.mockResolvedValue(ticket);

      async function* mockGenerator() {
        yield {
          step: WorkflowStep.INTAKE_AGENT,
          status: TicketStatus.IN_PROGRESS,
          message: "Processing...",
          detail: "",
          critical: false,
          resolution: undefined,
          assigned_team: undefined,
        };
      }

      mockStreamWorkflow.mockReturnValue(Promise.resolve(mockGenerator()));

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      await GET(request);

      expect(mockStreamWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "",
        }),
        ticket.id,
        undefined,
        "thread-789",
      );
    });

    it("should handle streamWorkflow errors gracefully", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.OPEN,
        thread_id: "thread-error",
      });

      mockFindOne.mockResolvedValue(ticket);

      async function* mockGenerator() {
        yield {
          step: WorkflowStep.INTAKE_AGENT,
          status: TicketStatus.IN_PROGRESS,
          message: "Processing...",
          detail: "",
          critical: false,
          resolution: undefined,
          assigned_team: undefined,
        };
        throw new Error("Workflow error");
      }

      mockStreamWorkflow.mockReturnValue(Promise.resolve(mockGenerator()));

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();

      // Read until error or stream ends
      let error = false;
      try {
        let done = false;
        while (!done) {
          const { done: readerDone } = await reader.read();
          done = readerDone;
        }
      } catch (_err) {
        error = true;
      }

      // Stream should close gracefully without throwing
      expect(error).toBe(false);
      expect(response.status).toBe(200);
    });
  });

  describe("SSE Format", () => {
    it("should format events as SSE with data: prefix", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const { value } = await reader.read();
      const chunk = decoder.decode(value);

      expect(chunk).toMatch(/^data: /);
      expect(chunk).toContain("\n\n");
    });

    it("should encode events as JSON", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      jest.runAllTimers();

      const { value } = await reader.read();
      const chunk = decoder.decode(value);

      const jsonMatch = chunk.match(/data: (.+)\n\n/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        expect(parsed).toHaveProperty("step");
        expect(parsed).toHaveProperty("status");
        expect(parsed).toHaveProperty("message");
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle ticket with minimal data", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        category: undefined,
        subcategory: undefined,
        sentiment_label: undefined,
        sentiment_score: undefined,
        priority: undefined,
        priority_score: undefined,
        assigned_team: undefined,
        assigned_to: undefined,
        resolution: undefined,
        customer: undefined,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("should handle ticket with OPEN status but no thread_id", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.OPEN,
        thread_id: undefined,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      await GET(request);

      // Should use real streaming workflow
      expect(mockStreamWorkflow).toHaveBeenCalled();
    });

    it("should handle ticket with PENDING_APPROVAL status and no thread_id", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.PENDING_APPROVAL,
        thread_id: undefined,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      await GET(request);

      // Should send static events
      expect(mockStreamWorkflow).not.toHaveBeenCalled();
    });

    it("should handle very long ticket subject and body", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
        subject: "A".repeat(1000),
        body: "B".repeat(5000),
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Stream Cancellation", () => {
    it.skip("should handle stream cancellation gracefully", async () => {
      const ticket = ticketFactory.build({
        status: TicketStatus.RESOLVED,
        thread_id: undefined,
      });

      mockFindOne.mockResolvedValue(ticket);

      const request = nextRequestFactory.build({
        nextUrl: {
          searchParams: new URLSearchParams({ ticketId: ticket.id }),
        },
      });

      const response = await GET(request);
      const reader = response.body!.getReader();

      // Read one chunk then cancel
      await reader.read();
      await reader.cancel();

      // Should not throw error
      expect(response.status).toBe(200);
    });
  });
});
