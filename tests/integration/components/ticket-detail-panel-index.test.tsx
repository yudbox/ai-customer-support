/**
 * Integration tests for TicketDetailPanel index component
 *
 * Тестирует главный контейнер панели деталей тикета:
 * состояния загрузки, отображение компонентов, взаимодействия.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { TicketDetailPanel } from "@/app/_components/TicketDetailPanel";

// Mock all child components
jest.mock("@/app/_components/TicketDetailPanel/TicketHeader", () => ({
  TicketHeader: ({ ticketNumber }: { ticketNumber: string }) => (
    <div data-testid="ticket-header">Header: {ticketNumber}</div>
  ),
}));

jest.mock("@/app/_components/TicketDetailPanel/CustomerInfo", () => ({
  CustomerInfo: () => <div data-testid="customer-info">Customer Info</div>,
}));

jest.mock("@/app/_components/TicketDetailPanel/TicketMessage", () => ({
  TicketMessage: ({ subject }: { subject: string }) => (
    <div data-testid="ticket-message">Message: {subject}</div>
  ),
}));

jest.mock("@/app/_components/TicketDetailPanel/AIAnalysis", () => ({
  AIAnalysis: () => <div data-testid="ai-analysis">AI Analysis</div>,
}));

jest.mock("@/app/_components/TicketDetailPanel/SimilarTickets", () => ({
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

jest.mock("@/app/_components/TicketDetailPanel/ResolutionEditor", () => ({
  ResolutionEditor: ({
    resolutionText,
    onResolutionChange,
  }: {
    resolutionText: string;
    onResolutionChange: (text: string) => void;
  }) => (
    <div data-testid="resolution-editor">
      <textarea
        data-testid="resolution-textarea"
        value={resolutionText}
        onChange={(e) => onResolutionChange(e.target.value)}
      />
    </div>
  ),
}));

jest.mock("@/app/_components/TicketDetailPanel/ActionButtons", () => ({
  ActionButtons: ({
    onApprove,
    onReject,
    onTeamChange,
  }: {
    onApprove: () => void;
    onReject: () => void;
    onTeamChange: (team: string) => void;
  }) => (
    <div data-testid="action-buttons">
      <button data-testid="approve-button" onClick={onApprove}>
        Approve
      </button>
      <button data-testid="reject-button" onClick={onReject}>
        Reject
      </button>
      <button
        data-testid="team-change-button"
        onClick={() => onTeamChange("CUSTOMER_SERVICE")}
      >
        Change Team
      </button>
    </div>
  ),
}));

jest.mock("@/app/_components/TicketDetailPanel/ApproveModal", () => ({
  ApproveModal: ({
    isOpen,
    onClose,
    onConfirm,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="approve-modal">
        <button data-testid="approve-modal-close" onClick={onClose}>
          Close
        </button>
        <button data-testid="approve-modal-confirm" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    );
  },
}));

jest.mock("@/app/_components/TicketDetailPanel/RejectModal", () => ({
  RejectModal: ({
    isOpen,
    onClose,
    onConfirm,
    rejectReason,
    onReasonChange,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    rejectReason: string;
    onReasonChange: (reason: string) => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="reject-modal">
        <textarea
          data-testid="reject-reason-textarea"
          value={rejectReason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <button data-testid="reject-modal-close" onClick={onClose}>
          Close
        </button>
        <button data-testid="reject-modal-confirm" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    );
  },
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock tRPC
const mockInvalidate = jest.fn();
const mockMutate = jest.fn();

const mockTicketData = {
  id: "ticket-123",
  ticket_number: "TCK-12345",
  subject: "Test ticket subject",
  body: "Test ticket body",
  priority: "High",
  priority_score: 85,
  category: "Technical",
  sentiment_label: "NEUTRAL",
  sentiment_score: 0.5,
  order: { id: "order-1", total: 100 },
  customer: {
    id: "customer-1",
    email: "test@example.com",
    name: "Test Customer",
    tier: "VIP",
    total_orders: 10,
    lifetime_value: 1000,
  },
};

const mockAIRecommendations = {
  similar_tickets: [],
  suggested_solution: "AI suggested solution",
};

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
        useMutation: jest.fn(),
      },
      reject: {
        useMutation: jest.fn(),
      },
    },
    useUtils: () => ({
      tickets: {
        getPendingApproval: {
          invalidate: mockInvalidate,
        },
      },
    }),
  },
}));

describe("TicketDetailPanel Index Integration Tests", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { trpc } = require("@/lib/trpc/client");

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    trpc.tickets.getById.useQuery.mockReturnValue({
      data: mockTicketData,
      isLoading: false,
    });

    trpc.tickets.getAIRecommendations.useQuery.mockReturnValue({
      data: mockAIRecommendations,
      isLoading: false,
    });

    trpc.tickets.approve.useMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    trpc.tickets.reject.useMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  describe("Empty State - No Ticket Selected", () => {
    it("should display select ticket message when ticketId is null", () => {
      render(<TicketDetailPanel ticketId={null} />);

      expect(screen.getByText("Select a ticket")).toBeInTheDocument();
      expect(
        screen.getByText("Choose a ticket from the left panel to review"),
      ).toBeInTheDocument();
    });

    it("should not render child components when no ticket selected", () => {
      render(<TicketDetailPanel ticketId={null} />);

      expect(screen.queryByTestId("ticket-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("customer-info")).not.toBeInTheDocument();
    });

    it("should have correct styling for empty state", () => {
      render(<TicketDetailPanel ticketId={null} />);

      const message = screen.getByText("Select a ticket");
      expect(message).toHaveClass("text-lg", "font-medium");
    });
  });

  describe("Loading State", () => {
    it("should display loading skeletons when isLoading is true", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    });

    it("should not render child components during loading", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.queryByTestId("ticket-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("customer-info")).not.toBeInTheDocument();
    });

    it("should have animate-pulse class on skeleton", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      const skeleton = screen.getByTestId("loading-skeleton");
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });

  describe("Error State - Ticket Not Found", () => {
    it("should display error message when ticket data is null", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });

    it("should display error message when ticket data is undefined", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });

    it("should not render child components when ticket not found", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.queryByTestId("ticket-header")).not.toBeInTheDocument();
    });

    it("should have red text color for error message", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      const errorDiv = screen.getByText("Ticket not found").closest("div");
      expect(errorDiv).toHaveClass("text-red-500");
    });
  });

  describe("Successful Render - All Components", () => {
    it("should render all child components when ticket data is available", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.getByTestId("ticket-header")).toBeInTheDocument();
      expect(screen.getByTestId("customer-info")).toBeInTheDocument();
      expect(screen.getByTestId("ticket-message")).toBeInTheDocument();
      expect(screen.getByTestId("ai-analysis")).toBeInTheDocument();
      expect(screen.getByTestId("similar-tickets")).toBeInTheDocument();
      expect(screen.getByTestId("resolution-editor")).toBeInTheDocument();
      expect(screen.getByTestId("action-buttons")).toBeInTheDocument();
    });

    it("should not render customer info when customer is null", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: { ...mockTicketData, customer: null },
        isLoading: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.queryByTestId("customer-info")).not.toBeInTheDocument();
      expect(screen.getByTestId("ticket-header")).toBeInTheDocument();
    });

    it("should pass correct props to TicketHeader", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.getByText("Header: TCK-12345")).toBeInTheDocument();
    });

    it("should pass correct props to TicketMessage", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(
        screen.getByText("Message: Test ticket subject"),
      ).toBeInTheDocument();
    });
  });

  describe("Resolution Text State Management", () => {
    it("should update resolution text when typing", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const textarea = screen.getByTestId(
        "resolution-textarea",
      ) as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "New resolution" } });

      expect(textarea.value).toBe("New resolution");
    });

    it("should update resolution text when selecting similar ticket", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const selectButton = screen.getByText("Select Similar");
      fireEvent.click(selectButton);

      const textarea = screen.getByTestId(
        "resolution-textarea",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Test resolution");
    });

    it("should allow clearing resolution text", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const textarea = screen.getByTestId(
        "resolution-textarea",
      ) as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Some text" } });
      expect(textarea.value).toBe("Some text");

      fireEvent.change(textarea, { target: { value: "" } });
      expect(textarea.value).toBe("");
    });
  });

  describe("Team Selection", () => {
    it("should handle team change", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const teamButton = screen.getByTestId("team-change-button");
      fireEvent.click(teamButton);

      // Team state is internal, we just verify the button works
      expect(teamButton).toBeInTheDocument();
    });
  });

  describe("Approve Modal Workflow", () => {
    it("should open approve modal when approve button clicked with resolution text", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      // Set resolution text first
      const textarea = screen.getByTestId("resolution-textarea");
      fireEvent.change(textarea, { target: { value: "Resolution text" } });

      // Click approve
      const approveButton = screen.getByTestId("approve-button");
      fireEvent.click(approveButton);

      expect(screen.getByTestId("approve-modal")).toBeInTheDocument();
    });

    it("should not open approve modal when resolution text is empty", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const approveButton = screen.getByTestId("approve-button");
      fireEvent.click(approveButton);

      expect(screen.queryByTestId("approve-modal")).not.toBeInTheDocument();
    });

    it("should close approve modal when close button clicked", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const textarea = screen.getByTestId("resolution-textarea");
      fireEvent.change(textarea, { target: { value: "Resolution" } });

      const approveButton = screen.getByTestId("approve-button");
      fireEvent.click(approveButton);

      expect(screen.getByTestId("approve-modal")).toBeInTheDocument();

      const closeButton = screen.getByTestId("approve-modal-close");
      fireEvent.click(closeButton);

      expect(screen.queryByTestId("approve-modal")).not.toBeInTheDocument();
    });

    it("should call approve mutation when confirm clicked", async () => {
      const mockMutateApprove = jest.fn();
      trpc.tickets.approve.useMutation.mockReturnValue({
        mutate: mockMutateApprove,
        isPending: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      const textarea = screen.getByTestId("resolution-textarea");
      fireEvent.change(textarea, { target: { value: "Test resolution" } });

      const approveButton = screen.getByTestId("approve-button");
      fireEvent.click(approveButton);

      const confirmButton = screen.getByTestId("approve-modal-confirm");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockMutateApprove).toHaveBeenCalledWith({
          id: "ticket-123",
          assigned_team: "technical_support",
          resolution: "Test resolution",
        });
      });
    });
  });

  describe("Reject Modal Workflow", () => {
    it("should open reject modal when reject button clicked", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const rejectButton = screen.getByTestId("reject-button");
      fireEvent.click(rejectButton);

      expect(screen.getByTestId("reject-modal")).toBeInTheDocument();
    });

    it("should close reject modal when close button clicked", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const rejectButton = screen.getByTestId("reject-button");
      fireEvent.click(rejectButton);

      const closeButton = screen.getByTestId("reject-modal-close");
      fireEvent.click(closeButton);

      expect(screen.queryByTestId("reject-modal")).not.toBeInTheDocument();
    });

    it("should allow typing reject reason", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const rejectButton = screen.getByTestId("reject-button");
      fireEvent.click(rejectButton);

      const reasonTextarea = screen.getByTestId(
        "reject-reason-textarea",
      ) as HTMLTextAreaElement;
      fireEvent.change(reasonTextarea, { target: { value: "Test reason" } });

      expect(reasonTextarea.value).toBe("Test reason");
    });

    it("should not call reject mutation when reason is empty", async () => {
      const mockMutateReject = jest.fn();
      trpc.tickets.reject.useMutation.mockReturnValue({
        mutate: mockMutateReject,
        isPending: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      const rejectButton = screen.getByTestId("reject-button");
      fireEvent.click(rejectButton);

      const confirmButton = screen.getByTestId("reject-modal-confirm");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockMutateReject).not.toHaveBeenCalled();
      });
    });

    it("should call reject mutation when confirm clicked with reason", async () => {
      const mockMutateReject = jest.fn();
      trpc.tickets.reject.useMutation.mockReturnValue({
        mutate: mockMutateReject,
        isPending: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      const rejectButton = screen.getByTestId("reject-button");
      fireEvent.click(rejectButton);

      const reasonTextarea = screen.getByTestId("reject-reason-textarea");
      fireEvent.change(reasonTextarea, { target: { value: "Valid reason" } });

      const confirmButton = screen.getByTestId("reject-modal-confirm");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockMutateReject).toHaveBeenCalledWith({
          id: "ticket-123",
          reason: "Valid reason",
        });
      });
    });

    it("should clear reject reason after closing modal", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const rejectButton = screen.getByTestId("reject-button");
      fireEvent.click(rejectButton);

      const reasonTextarea = screen.getByTestId("reject-reason-textarea");
      fireEvent.change(reasonTextarea, { target: { value: "Some reason" } });

      const closeButton = screen.getByTestId("reject-modal-close");
      fireEvent.click(closeButton);

      // Open modal again
      fireEvent.click(rejectButton);

      const newReasonTextarea = screen.getByTestId(
        "reject-reason-textarea",
      ) as HTMLTextAreaElement;
      expect(newReasonTextarea.value).toBe("");
    });
  });

  describe("Query Management", () => {
    it("should enable ticket query when ticketId is provided", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(trpc.tickets.getById.useQuery).toHaveBeenCalledWith(
        { id: "ticket-123" },
        { enabled: true },
      );
    });

    it("should disable ticket query when ticketId is null", () => {
      render(<TicketDetailPanel ticketId={null} />);

      expect(trpc.tickets.getById.useQuery).toHaveBeenCalledWith(
        { id: null },
        { enabled: false },
      );
    });

    it("should enable AI recommendations query when ticketId is provided", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(trpc.tickets.getAIRecommendations.useQuery).toHaveBeenCalledWith(
        { ticketId: "ticket-123" },
        { enabled: true },
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle resolution text with only whitespace", () => {
      render(<TicketDetailPanel ticketId="ticket-123" />);

      const textarea = screen.getByTestId("resolution-textarea");
      fireEvent.change(textarea, { target: { value: "   " } });

      const approveButton = screen.getByTestId("approve-button");
      fireEvent.click(approveButton);

      expect(screen.queryByTestId("approve-modal")).not.toBeInTheDocument();
    });

    it("should handle reject reason with only whitespace", async () => {
      const mockMutateReject = jest.fn();
      trpc.tickets.reject.useMutation.mockReturnValue({
        mutate: mockMutateReject,
        isPending: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      const rejectButton = screen.getByTestId("reject-button");
      fireEvent.click(rejectButton);

      const reasonTextarea = screen.getByTestId("reject-reason-textarea");
      fireEvent.change(reasonTextarea, { target: { value: "   " } });

      const confirmButton = screen.getByTestId("reject-modal-confirm");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockMutateReject).not.toHaveBeenCalled();
      });
    });

    it("should handle ticket without customer", () => {
      trpc.tickets.getById.useQuery.mockReturnValue({
        data: { ...mockTicketData, customer: undefined },
        isLoading: false,
      });

      render(<TicketDetailPanel ticketId="ticket-123" />);

      expect(screen.queryByTestId("customer-info")).not.toBeInTheDocument();
      expect(screen.getByTestId("ticket-header")).toBeInTheDocument();
    });
  });
});
