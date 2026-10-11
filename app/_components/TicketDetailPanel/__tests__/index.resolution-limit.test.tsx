import { render, screen, fireEvent } from "@testing-library/react";

import { RESOLUTION_MAX_LENGTH } from "@/lib/constants/resolution";

import { TicketDetailPanel } from "../index";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock tRPC
const mockInvalidate = jest.fn();
const mockApproveMutate = jest.fn();
const mockRejectMutate = jest.fn();

jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    tickets: {
      getById: {
        useQuery: jest.fn(),
      },
      getAIRecommendations: {
        useQuery: jest.fn(),
      },
      approve: {
        useMutation: jest.fn(() => ({
          mutate: mockApproveMutate,
          isPending: false,
        })),
      },
      reject: {
        useMutation: jest.fn(() => ({
          mutate: mockRejectMutate,
          isPending: false,
        })),
      },
    },
    useUtils: jest.fn(() => ({
      tickets: {
        getPendingApproval: {
          invalidate: mockInvalidate,
        },
      },
    })),
  },
}));

// Mock child components
jest.mock("../TicketHeader", () => ({
  TicketHeader: ({ ticketNumber }: { ticketNumber: string }) => (
    <div data-testid="ticket-header">Header: {ticketNumber}</div>
  ),
}));

jest.mock("../CustomerInfo", () => ({
  CustomerInfo: () => <div data-testid="customer-info">Customer Info</div>,
}));

jest.mock("../TicketMessage", () => ({
  TicketMessage: ({ subject }: { subject: string }) => (
    <div data-testid="ticket-message">Message: {subject}</div>
  ),
}));

jest.mock("../AIAnalysis", () => ({
  AIAnalysis: () => <div data-testid="ai-analysis">AI Analysis</div>,
}));

jest.mock("../SimilarTickets", () => ({
  SimilarTickets: ({
    onSelectTicket,
  }: {
    onSelectTicket: (index: number, resolution: string) => void;
  }) => (
    <div data-testid="similar-tickets">
      <button
        data-testid="select-over-limit"
        onClick={() => onSelectTicket(0, "A".repeat(5000 + 1200))}
      >
        Select Over Limit
      </button>
      <button
        data-testid="select-at-limit"
        onClick={() => onSelectTicket(0, "A".repeat(5000))}
      >
        Select At Limit
      </button>
    </div>
  ),
}));

jest.mock("../ResolutionEditor", () => ({
  ResolutionEditor: ({
    resolutionText,
    onResolutionChange,
  }: {
    resolutionText: string;
    onResolutionChange: (text: string) => void;
  }) => (
    <div data-testid="resolution-editor">
      <textarea
        value={resolutionText}
        onChange={(e) => onResolutionChange(e.target.value)}
        data-testid="resolution-textarea"
      />
    </div>
  ),
}));

jest.mock("../ActionButtons", () => ({
  ActionButtons: ({
    onApprove,
    isApproveDisabled,
  }: {
    onApprove: () => void;
    isApproveDisabled: boolean;
  }) => (
    <div data-testid="action-buttons">
      <button
        onClick={onApprove}
        disabled={isApproveDisabled}
        data-testid="approve-button"
      >
        Approve
      </button>
    </div>
  ),
}));

jest.mock("../ApproveModal", () => ({
  ApproveModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="approve-modal" /> : null,
}));

jest.mock("../RejectModal", () => ({
  RejectModal: () => null,
}));

// Import mocked trpc after jest.mock
const { trpc } = jest.requireMock("@/lib/trpc/client");

describe("TicketDetailPanel resolution limit", () => {
  const mockTicket = {
    id: "ticket-123",
    ticket_number: "TKT-001",
    subject: "Cannot login",
    body: "I cannot login to my account",
    priority: "HIGH",
    priority_score: 85,
    category: "Account Issues",
    sentiment_label: "ANGRY",
    sentiment_score: 0.8,
    customer: {
      id: "customer-1",
      email: "test@example.com",
      name: "John Doe",
      tier: "VIP",
      total_orders: 10,
      lifetime_value: 5000,
    },
    order: { id: "order-1", order_number: "ORD-123", total_amount: 100 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    trpc.tickets.getById.useQuery.mockReturnValue({
      data: mockTicket,
      isLoading: false,
    });
    trpc.tickets.getAIRecommendations.useQuery.mockReturnValue({
      data: { similar_tickets: [], suggested_solution: "x" },
      isLoading: false,
    });
  });

  it("disables Approve when the resolution is over the limit and does not open the modal", () => {
    render(<TicketDetailPanel ticketId="ticket-123" />);

    fireEvent.click(screen.getByTestId("select-over-limit"));

    const approve = screen.getByTestId("approve-button");
    expect(approve).toBeDisabled();
    fireEvent.click(approve);
    expect(screen.queryByTestId("approve-modal")).not.toBeInTheDocument();
  });

  it("enables Approve at exactly the limit", () => {
    render(<TicketDetailPanel ticketId="ticket-123" />);

    fireEvent.click(screen.getByTestId("select-at-limit"));

    expect(screen.getByTestId("approve-button")).toBeEnabled();
  });

  it("keeps Approve disabled for empty text", () => {
    render(<TicketDetailPanel ticketId="ticket-123" />);

    expect(screen.getByTestId("approve-button")).toBeDisabled();
  });

  it("re-enables Approve after shortening over-limit text to the limit", () => {
    render(<TicketDetailPanel ticketId="ticket-123" />);

    fireEvent.click(screen.getByTestId("select-over-limit"));
    expect(screen.getByTestId("approve-button")).toBeDisabled();

    fireEvent.change(screen.getByTestId("resolution-textarea"), {
      target: { value: "A".repeat(RESOLUTION_MAX_LENGTH) },
    });

    expect(screen.getByTestId("approve-button")).toBeEnabled();
  });
});
