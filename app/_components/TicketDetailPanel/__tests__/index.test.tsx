import { render, screen, fireEvent } from "@testing-library/react";

import { TeamCode } from "@/lib/types/common";

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
      <button onClick={() => onSelectTicket(0, "Test resolution")}>
        Select Similar
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
    onReject,
  }: {
    onApprove: () => void;
    onReject: () => void;
  }) => (
    <div data-testid="action-buttons">
      <button onClick={onApprove} data-testid="approve-button">
        Approve
      </button>
      <button onClick={onReject} data-testid="reject-button">
        Reject
      </button>
    </div>
  ),
}));

jest.mock("../ApproveModal", () => ({
  ApproveModal: ({
    isOpen,
    onConfirm,
    onClose,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="approve-modal">
        <button onClick={onConfirm} data-testid="confirm-approve">
          Confirm Approve
        </button>
        <button onClick={onClose} data-testid="close-approve">
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock("../RejectModal", () => ({
  RejectModal: ({
    isOpen,
    onConfirm,
    onClose,
    rejectReason,
    onReasonChange,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    rejectReason: string;
    onReasonChange: (reason: string) => void;
  }) =>
    isOpen ? (
      <div data-testid="reject-modal">
        <input
          value={rejectReason}
          onChange={(e) => onReasonChange(e.target.value)}
          data-testid="reject-reason-input"
        />
        <button onClick={onConfirm} data-testid="confirm-reject">
          Confirm Reject
        </button>
        <button onClick={onClose} data-testid="close-reject">
          Close
        </button>
      </div>
    ) : null,
}));

// Import mocked trpc after jest.mock
const { trpc } = jest.requireMock("@/lib/trpc/client");

describe("TicketDetailPanel Component", () => {
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
    order: {
      id: "order-1",
      order_number: "ORD-123",
      total_amount: 100,
    },
  };

  const mockAIRecommendations = {
    similar_tickets: [
      {
        similarity: 0.95,
        subject: "Login issue",
        resolution: "Reset password",
      },
    ],
    suggested_solution: "Please reset your password",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    trpc.tickets.getById.useQuery.mockReturnValue({
      data: mockTicket,
      isLoading: false,
    });

    trpc.tickets.getAIRecommendations.useQuery.mockReturnValue({
      data: mockAIRecommendations,
      isLoading: false,
    });

    trpc.tickets.approve.useMutation.mockReturnValue({
      mutate: mockApproveMutate,
      isPending: false,
    });

    trpc.tickets.reject.useMutation.mockReturnValue({
      mutate: mockRejectMutate,
      isPending: false,
    });
  });

  describe("Empty State", () => {
    it("shows select ticket message when no ticketId provided", () => {
      render(<TicketDetailPanel ticketId={null} />);

      expect(screen.getByText("Select a ticket")).toBeInTheDocument();
      expect(
        screen.getByText(/choose a ticket from the left panel/i),
      ).toBeInTheDocument();
    });

    it("does not render ticket components when no ticketId", () => {
      render(<TicketDetailPanel ticketId={null} />);

      expect(screen.queryByTestId("ticket-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("customer-info")).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading skeletons when isLoading is true", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      // Check for loading state by verifying skeleton is displayed
      expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    });

    it("does not render ticket components while loading", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.queryByTestId("ticket-header")).not.toBeInTheDocument();
    });
  });

  describe("Ticket Not Found", () => {
    it("shows ticket not found message when ticket is null", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<TicketDetailPanel ticketId="invalid-id" />);

      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });

    it("does not render ticket components when ticket not found", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<TicketDetailPanel ticketId="invalid-id" />);

      expect(screen.queryByTestId("ticket-header")).not.toBeInTheDocument();
    });
  });

  describe("Successful Ticket Render", () => {
    it("renders all ticket components when ticket data is available", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.getByTestId("ticket-header")).toBeInTheDocument();
      expect(screen.getByTestId("customer-info")).toBeInTheDocument();
      expect(screen.getByTestId("ticket-message")).toBeInTheDocument();
      expect(screen.getByTestId("ai-analysis")).toBeInTheDocument();
      expect(screen.getByTestId("similar-tickets")).toBeInTheDocument();
      expect(screen.getByTestId("resolution-editor")).toBeInTheDocument();
      expect(screen.getByTestId("action-buttons")).toBeInTheDocument();
    });

    it("renders ticket header with correct ticket number", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.getByText(/TKT-001/i)).toBeInTheDocument();
    });

    it("renders ticket message with correct subject", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.getByText(/Cannot login/i)).toBeInTheDocument();
    });
  });

  describe("Resolution Text Interaction", () => {
    it("updates resolution text when user types", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const textarea = screen.getByTestId("resolution-textarea");
      fireEvent.change(textarea, { target: { value: "New resolution" } });

      expect(textarea).toHaveValue("New resolution");
    });

    it("sets resolution text when similar ticket is selected", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const selectButton = screen.getByText("Select Similar");
      fireEvent.click(selectButton);

      const textarea = screen.getByTestId("resolution-textarea");
      expect(textarea).toHaveValue("Test resolution");
    });
  });

  describe("Approve Flow", () => {
    it("shows approve modal when approve button clicked with resolution text", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      // First add resolution text
      const textarea = screen.getByTestId("resolution-textarea");
      fireEvent.change(textarea, { target: { value: "Resolution text" } });

      // Click approve
      const approveButton = screen.getByTestId("approve-button");
      fireEvent.click(approveButton);

      expect(screen.getByTestId("approve-modal")).toBeInTheDocument();
    });

    it("does not trigger mutation when approve clicked without resolution", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const approveButton = screen.getByTestId("approve-button");
      fireEvent.click(approveButton);

      // Modal should not show if resolution is empty
      expect(screen.queryByTestId("approve-modal")).not.toBeInTheDocument();
    });

    it("calls approve mutation when confirmed in modal", async () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      // Add resolution
      const textarea = screen.getByTestId("resolution-textarea");
      fireEvent.change(textarea, { target: { value: "Fix applied" } });

      // Click approve
      fireEvent.click(screen.getByTestId("approve-button"));

      // Confirm in modal
      const confirmButton = screen.getByTestId("confirm-approve");
      fireEvent.click(confirmButton);

      expect(mockApproveMutate).toHaveBeenCalledWith({
        id: "ticket-123",
        assigned_team: TeamCode.TECHNICAL_SUPPORT,
        resolution: "Fix applied",
      });
    });

    it("closes approve modal when close button clicked", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      // Add resolution and open modal
      fireEvent.change(screen.getByTestId("resolution-textarea"), {
        target: { value: "Fix" },
      });
      fireEvent.click(screen.getByTestId("approve-button"));

      expect(screen.getByTestId("approve-modal")).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByTestId("close-approve"));

      expect(screen.queryByTestId("approve-modal")).not.toBeInTheDocument();
    });
  });

  describe("Reject Flow", () => {
    it("shows reject modal when reject button clicked", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const rejectButton = screen.getByTestId("reject-button");
      fireEvent.click(rejectButton);

      expect(screen.getByTestId("reject-modal")).toBeInTheDocument();
    });

    it("allows entering reject reason in modal", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      // Open reject modal
      fireEvent.click(screen.getByTestId("reject-button"));

      const reasonInput = screen.getByTestId("reject-reason-input");
      fireEvent.change(reasonInput, {
        target: { value: "Insufficient information" },
      });

      expect(reasonInput).toHaveValue("Insufficient information");
    });

    it("calls reject mutation when confirmed with reason", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      // Open modal
      fireEvent.click(screen.getByTestId("reject-button"));

      // Enter reason
      fireEvent.change(screen.getByTestId("reject-reason-input"), {
        target: { value: "Duplicate ticket" },
      });

      // Confirm
      fireEvent.click(screen.getByTestId("confirm-reject"));

      expect(mockRejectMutate).toHaveBeenCalledWith({
        id: "ticket-123",
        reason: "Duplicate ticket",
      });
    });

    it("does not call mutation when reason is empty", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      // Open modal
      fireEvent.click(screen.getByTestId("reject-button"));

      // Confirm without entering reason
      fireEvent.click(screen.getByTestId("confirm-reject"));

      expect(mockRejectMutate).not.toHaveBeenCalled();
    });

    it("closes reject modal and clears reason when close clicked", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      // Open and enter reason
      fireEvent.click(screen.getByTestId("reject-button"));
      fireEvent.change(screen.getByTestId("reject-reason-input"), {
        target: { value: "Test reason" },
      });

      // Close
      fireEvent.click(screen.getByTestId("close-reject"));

      expect(screen.queryByTestId("reject-modal")).not.toBeInTheDocument();

      // Reopen to check reason was cleared
      fireEvent.click(screen.getByTestId("reject-button"));
      expect(screen.getByTestId("reject-reason-input")).toHaveValue("");
    });
  });

  describe("tRPC Queries", () => {
    it("queries ticket data when ticketId is provided", () => {
      render(<TicketDetailPanel ticketId="ticket-456" />);

      expect(trpc.tickets.getById.useQuery).toHaveBeenCalledWith(
        { id: "ticket-456" },
        { enabled: true },
      );
    });

    it("disables ticket query when ticketId is null", () => {
      render(<TicketDetailPanel ticketId={null} />);

      expect(trpc.tickets.getById.useQuery).toHaveBeenCalledWith(
        expect.anything(),
        { enabled: false },
      );
    });

    it("queries AI recommendations when ticketId is provided", () => {
      render(<TicketDetailPanel ticketId="ticket-789" />);

      expect(trpc.tickets.getAIRecommendations.useQuery).toHaveBeenCalledWith(
        { ticketId: "ticket-789" },
        { enabled: true },
      );
    });
  });
});
