/**
 * Integration tests for TicketStream component
 *
 * Тестирует отображение stream событий обработки тикета,
 * empty state, loading states, final results (resolved/critical/assigned).
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { TicketStream } from "@/app/_components/TicketStream";
import { TicketStatus, WorkflowStep } from "@/lib/types/common";

// Mock useTicketStream hook
const mockUseTicketStream = jest.fn();

jest.mock("@/hooks", () => ({
  useTicketStream: (ticketId: string | null) => mockUseTicketStream(ticketId),
}));

describe("TicketStream Integration Tests", () => {
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Empty State", () => {
    it("should show empty state when no ticket is selected", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId={null} />);

      expect(screen.getByText("🤖")).toBeInTheDocument();
      expect(screen.getByText("Ready to Process")).toBeInTheDocument();
      expect(
        screen.getByText("Submit a ticket to see AI agents in action"),
      ).toBeInTheDocument();
    });

    it("should not show processing header in empty state", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId={null} />);

      expect(screen.queryByText(/Processing Ticket/i)).not.toBeInTheDocument();
    });
  });

  describe("Processing Header", () => {
    it("should show processing header with ticket ID", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-12345678-abcd" />);

      expect(screen.getByText(/Processing Ticket #/i)).toBeInTheDocument();
      expect(screen.getByText(/ticket-1/i)).toBeInTheDocument();
      expect(
        screen.getByText("AI agents are analyzing your request"),
      ).toBeInTheDocument();
    });

    it("should truncate long ticket IDs to 8 characters", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="very-long-ticket-id-123456789" />);

      expect(screen.getByText(/Processing Ticket #/i)).toBeInTheDocument();
      expect(screen.getByText(/very-lon/i)).toBeInTheDocument();
    });
  });

  describe("Event Stream - Icons", () => {
    it("should show loading spinner for IN_PROGRESS status", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.SENTIMENT_AGENT,
            status: TicketStatus.IN_PROGRESS,
            message: "Analyzing ticket...",
          },
        ],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });

    it("should show checkmark for RESOLVED status", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.COMPLETE,
            status: TicketStatus.RESOLVED,
            message: "Ticket resolved",
            critical: false,
          },
        ],
        isComplete: true,
        isCritical: false,
        resolution: "Test resolution",
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      const checkmarks = screen.getAllByText("✅");
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it("should show critical badge for PENDING_APPROVAL status", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.WAIT_APPROVAL,
            status: TicketStatus.PENDING_APPROVAL,
            message: "Escalated to manager",
            critical: true,
          },
        ],
        isComplete: true,
        isCritical: true,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      const criticalBadges = screen.getAllByText("🚨");
      expect(criticalBadges.length).toBeGreaterThan(0);
    });

    it("should show hourglass for SUBMITTED status", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.INTAKE_AGENT,
            status: TicketStatus.OPEN,
            message: "Ticket submitted",
          },
        ],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("⏳")).toBeInTheDocument();
    });
  });

  describe("Event Messages", () => {
    it("should display event messages", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.SENTIMENT_AGENT,
            status: TicketStatus.IN_PROGRESS,
            message: "Analyzing customer sentiment...",
          },
          {
            step: WorkflowStep.CLASSIFICATION_AGENT,
            status: TicketStatus.IN_PROGRESS,
            message: "Classifying ticket priority...",
          },
        ],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.getByText("Analyzing customer sentiment..."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Classifying ticket priority..."),
      ).toBeInTheDocument();
    });

    it("should display event details when provided", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.SENTIMENT_AGENT,
            status: TicketStatus.RESOLVED,
            message: "Analysis complete",
            detail: "Sentiment: Positive, Priority: Medium",
          },
        ],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("Analysis complete")).toBeInTheDocument();
      expect(
        screen.getByText("Sentiment: Positive, Priority: Medium"),
      ).toBeInTheDocument();
    });

    it("should render multiple events in order", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.INTAKE_AGENT,
            status: TicketStatus.OPEN,
            message: "Step 1",
          },
          {
            step: WorkflowStep.SENTIMENT_AGENT,
            status: TicketStatus.IN_PROGRESS,
            message: "Step 2",
          },
          {
            step: WorkflowStep.CLASSIFICATION_AGENT,
            status: TicketStatus.RESOLVED,
            message: "Step 3",
          },
        ],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      const messages = screen.getAllByText(/Step \d/);
      expect(messages).toHaveLength(3);
      expect(messages[0]).toHaveTextContent("Step 1");
      expect(messages[1]).toHaveTextContent("Step 2");
      expect(messages[2]).toHaveTextContent("Step 3");
    });
  });

  describe("Final Result - Critical Ticket", () => {
    it("should show critical card when ticket is critical", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.WAIT_APPROVAL,
            status: TicketStatus.PENDING_APPROVAL,
            message: "Escalated",
            critical: true,
          },
        ],
        isComplete: true,
        isCritical: true,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-12345678" />);

      expect(screen.getByText("REQUIRES MANAGER APPROVAL")).toBeInTheDocument();
      expect(
        screen.getByText(/Your request has been escalated/i),
      ).toBeInTheDocument();
    });

    it("should display ticket details in critical card", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: true,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-12345678" />);

      expect(screen.getByText(/Ticket ID:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/ticket-1/i).length).toBeGreaterThan(0);
      expect(
        screen.getByText("Status: Pending Manager Review"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Priority: CRITICAL/i)).toBeInTheDocument();
    });

    it("should show 60 minutes response time for critical tickets", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: true,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText(/within 60 minutes/i)).toBeInTheDocument();
    });
  });

  describe("Final Result - Auto Resolved", () => {
    it("should show resolved card with resolution", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: "This issue can be resolved by restarting your device.",
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.getByText("TICKET RESOLVED AUTOMATICALLY"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "This issue can be resolved by restarting your device.",
        ),
      ).toBeInTheDocument();
    });

    it("should show ticket ID and status in resolved card", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: "Test resolution",
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-12345678" />);

      expect(screen.getByText(/Ticket ID:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/ticket-1/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Status:.*Resolved/i)).toBeInTheDocument();
    });

    it("should show follow-up message in resolved card", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: "Test resolution",
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.getByText(/If you need further assistance/i),
      ).toBeInTheDocument();
    });
  });

  describe("Final Result - Assigned to Team", () => {
    it("should show assigned card when no resolution", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: null,
        assignedTeam: "technical_support",
        assignedTo: "John Doe",
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.getByText("TICKET ASSIGNED TO SUPPORT TEAM"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/assigned to our support team/i),
      ).toBeInTheDocument();
    });

    it("should display assigned team name", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: null,
        assignedTeam: "billing_support",
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText(/Team:/)).toBeInTheDocument();
      expect(screen.getByText("BILLING SUPPORT")).toBeInTheDocument();
    });

    it("should display assigned person when provided", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: null,
        assignedTeam: "technical_support",
        assignedTo: "Jane Smith",
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText(/Assigned to:/)).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("should show expected response time", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: null,
        assignedTeam: "customer_service",
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.getByText("Expected response: Within 2 hours"),
      ).toBeInTheDocument();
    });

    it("should show ticket status as assigned", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: null,
        assignedTeam: "technical_support",
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("Status: 🎫 Assigned")).toBeInTheDocument();
    });
  });

  describe("Submit Another Ticket Button", () => {
    it("should show button when ticket is complete and onReset provided", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: "Test",
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" onReset={mockOnReset} />);

      expect(screen.getByText(/Submit Another Ticket/i)).toBeInTheDocument();
    });

    it("should not show button when ticket is incomplete", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: false,
        isCritical: false,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" onReset={mockOnReset} />);

      expect(
        screen.queryByText(/Submit Another Ticket/i),
      ).not.toBeInTheDocument();
    });

    it("should not show button when onReset not provided", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: "Test",
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.queryByText(/Submit Another Ticket/i),
      ).not.toBeInTheDocument();
    });

    it("should call onReset when button is clicked", () => {
      mockUseTicketStream.mockReturnValue({
        events: [],
        isComplete: true,
        isCritical: false,
        resolution: "Test",
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" onReset={mockOnReset} />);

      const button = screen.getByText(/Submit Another Ticket/i);
      fireEvent.click(button);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("Complex Scenarios", () => {
    it("should render complete workflow from start to auto-resolution", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.INTAKE_AGENT,
            status: TicketStatus.OPEN,
            message: "Ticket submitted",
          },
          {
            step: WorkflowStep.SENTIMENT_AGENT,
            status: TicketStatus.RESOLVED,
            message: "Sentiment analysis complete",
            detail: "Sentiment: Neutral",
          },
          {
            step: WorkflowStep.CLASSIFICATION_AGENT,
            status: TicketStatus.RESOLVED,
            message: "Priority classification complete",
            detail: "Priority: Medium",
          },
          {
            step: WorkflowStep.COMPLETE,
            status: TicketStatus.RESOLVED,
            message: "Ticket automatically resolved",
            critical: false,
          },
        ],
        isComplete: true,
        isCritical: false,
        resolution: "Please check your spam folder.",
        assignedTeam: null,
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" onReset={mockOnReset} />);

      // Check all events are displayed
      expect(screen.getByText("Ticket submitted")).toBeInTheDocument();
      expect(
        screen.getByText("Sentiment analysis complete"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Priority classification complete"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Ticket automatically resolved"),
      ).toBeInTheDocument();

      // Check final result
      expect(
        screen.getByText("TICKET RESOLVED AUTOMATICALLY"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Please check your spam folder."),
      ).toBeInTheDocument();

      // Check reset button
      expect(screen.getByText(/Submit Another Ticket/i)).toBeInTheDocument();
    });

    it("should render workflow escalated to manager", () => {
      mockUseTicketStream.mockReturnValue({
        events: [
          {
            step: WorkflowStep.INTAKE_AGENT,
            status: TicketStatus.OPEN,
            message: "Ticket submitted",
          },
          {
            step: WorkflowStep.SENTIMENT_AGENT,
            status: TicketStatus.RESOLVED,
            message: "High priority detected",
            detail: "Angry customer, VIP tier",
          },
          {
            step: WorkflowStep.WAIT_APPROVAL,
            status: TicketStatus.PENDING_APPROVAL,
            message: "Escalated to manager",
            critical: true,
          },
        ],
        isComplete: true,
        isCritical: true,
        resolution: null,
        assignedTeam: null,
        assignedTo: null,
      });

      render(
        <TicketStream ticketId="ticket-critical-123" onReset={mockOnReset} />,
      );

      // Check events
      expect(screen.getByText("Ticket submitted")).toBeInTheDocument();
      expect(screen.getByText("High priority detected")).toBeInTheDocument();
      expect(screen.getByText("Escalated to manager")).toBeInTheDocument();

      // Check critical card
      expect(screen.getByText("REQUIRES MANAGER APPROVAL")).toBeInTheDocument();
      expect(screen.getByText("Priority: CRITICAL 🚨")).toBeInTheDocument();

      // Check reset button
      expect(screen.getByText(/Submit Another Ticket/i)).toBeInTheDocument();
    });
  });
});
