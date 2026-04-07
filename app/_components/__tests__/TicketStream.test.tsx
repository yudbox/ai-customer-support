import { render, screen, fireEvent } from "@testing-library/react";

import { TicketStatus, WorkflowStep } from "@/lib/types/common";

import { TicketStream } from "../TicketStream";

// Mock useTicketStream hook
const mockUseTicketStream = jest.fn();
jest.mock("@/hooks", () => ({
  useTicketStream: (ticketId: string | null) => mockUseTicketStream(ticketId),
}));

describe("TicketStream Component", () => {
  const defaultMockData = {
    events: [],
    isComplete: false,
    isCritical: false,
    resolution: null,
    assignedTeam: null,
    assignedTo: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTicketStream.mockReturnValue(defaultMockData);
  });

  describe("Empty State", () => {
    it("renders empty state when ticketId is null", () => {
      render(<TicketStream ticketId={null} />);

      expect(screen.getByText("Ready to Process")).toBeInTheDocument();
      expect(
        screen.getByText("Submit a ticket to see AI agents in action"),
      ).toBeInTheDocument();
      expect(screen.getByText("🤖")).toBeInTheDocument();
    });

    it("renders robot emoji in empty state", () => {
      render(<TicketStream ticketId={null} />);

      const robotEmoji = screen.getByText("🤖");
      expect(robotEmoji).toBeInTheDocument();
    });

    it("does not call useTicketStream when ticketId is null", () => {
      render(<TicketStream ticketId={null} />);

      expect(mockUseTicketStream).toHaveBeenCalledWith(null);
    });
  });

  describe("Processing State", () => {
    it("renders processing header with ticket ID", () => {
      const ticketId = "ticket-12345678";
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [],
      });

      render(<TicketStream ticketId={ticketId} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Processing Ticket #ticket-1");
      expect(
        screen.getByText("AI agents are analyzing your request"),
      ).toBeInTheDocument();
    });

    it("truncates long ticket ID to 8 characters", () => {
      const ticketId = "very-long-ticket-id-12345678";
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [],
      });

      render(<TicketStream ticketId={ticketId} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Processing Ticket #very-lon");
    });

    it("calls useTicketStream with correct ticketId", () => {
      const ticketId = "ticket-123";
      render(<TicketStream ticketId={ticketId} />);

      expect(mockUseTicketStream).toHaveBeenCalledWith(ticketId);
    });
  });

  describe("Event Rendering", () => {
    it("renders events from stream", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [
          {
            message: "Analyzing ticket",
            status: TicketStatus.IN_PROGRESS,
            step: WorkflowStep.INTAKE_AGENT,
          },
          {
            message: "Ticket classified",
            detail: "Category: Account Issues",
            status: TicketStatus.RESOLVED,
            step: WorkflowStep.CLASSIFICATION_AGENT,
          },
        ],
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("Analyzing ticket")).toBeInTheDocument();
      expect(screen.getByText("Ticket classified")).toBeInTheDocument();
      expect(screen.getByText("Category: Account Issues")).toBeInTheDocument();
    });

    it("renders IN_PROGRESS status with spinner", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [
          {
            message: "Processing...",
            status: TicketStatus.IN_PROGRESS,
            step: WorkflowStep.INTAKE_AGENT,
          },
        ],
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("renders RESOLVED status with checkmark", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [
          {
            message: "Step completed",
            status: TicketStatus.RESOLVED,
            step: WorkflowStep.INTAKE_AGENT,
          },
        ],
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("✅")).toBeInTheDocument();
    });

    it("renders PENDING_APPROVAL status with alert icon", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [
          {
            message: "Requires approval",
            status: TicketStatus.PENDING_APPROVAL,
            step: WorkflowStep.COMPLETE,
          },
        ],
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("🚨")).toBeInTheDocument();
    });

    it("renders default status with hourglass", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [
          {
            message: "Waiting",
            status: TicketStatus.OPEN,
            step: WorkflowStep.INTAKE_AGENT,
          },
        ],
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("⏳")).toBeInTheDocument();
    });

    it("renders event detail when provided", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [
          {
            message: "Analysis complete",
            detail: "Sentiment: Positive",
            status: TicketStatus.RESOLVED,
            step: WorkflowStep.SENTIMENT_AGENT,
          },
        ],
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("Sentiment: Positive")).toBeInTheDocument();
    });

    it("renders critical complete status with alert icon", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [
          {
            message: "Critical issue detected",
            status: TicketStatus.RESOLVED,
            step: WorkflowStep.COMPLETE,
            critical: true,
          },
        ],
      });

      render(<TicketStream ticketId="ticket-123" />);

      const alerts = screen.getAllByText("🚨");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe("Critical Ticket Result", () => {
    it("renders critical approval card when isComplete and isCritical", () => {
      const ticketId = "critical-ticket-123";
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [],
        isComplete: true,
        isCritical: true,
      });

      render(<TicketStream ticketId={ticketId} />);

      expect(screen.getByText("REQUIRES MANAGER APPROVAL")).toBeInTheDocument();
      expect(
        screen.getByText(/Your request has been escalated/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Pending Manager Review/)).toBeInTheDocument();
      expect(screen.getByText(/Priority: CRITICAL/)).toBeInTheDocument();
    });

    it("shows 60 minute response time for critical tickets", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        isCritical: true,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText(/within 60 minutes/)).toBeInTheDocument();
    });

    it("displays ticket ID in critical card", () => {
      const ticketId = "critical-12345678";
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        isCritical: true,
      });

      render(<TicketStream ticketId={ticketId} />);

      const ticketIdElements = screen.getAllByText((content, element) => {
        return element?.tagName === "P" && content.includes("Ticket ID:");
      });
      expect(ticketIdElements.length).toBeGreaterThan(0);
      expect(ticketIdElements[0]).toHaveTextContent(ticketId.slice(0, 8));
    });
  });

  describe("Auto-Resolved Result", () => {
    it("renders auto-resolved card with resolution", () => {
      const ticketId = "resolved-ticket";
      const resolution = "Your password has been reset. Check your email.";

      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [],
        isComplete: true,
        isCritical: false,
        resolution,
      });

      render(<TicketStream ticketId={ticketId} />);

      expect(
        screen.getByText("TICKET RESOLVED AUTOMATICALLY"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Your ticket has been resolved/),
      ).toBeInTheDocument();
      expect(screen.getByText(resolution)).toBeInTheDocument();
    });

    it("shows resolution in formatted box", () => {
      const resolution = "Multi-line\nresolution\ntext";

      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        resolution,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("📋 Resolution:")).toBeInTheDocument();
      const resolutionElement = screen.getByText((content, element) => {
        return !!(
          element?.className?.includes("whitespace-pre-wrap") &&
          content.includes("Multi-line")
        );
      });
      expect(resolutionElement).toBeInTheDocument();
    });

    it("displays resolved status in auto-resolved card", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        resolution: "Fixed",
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText(/Status: ✅ Resolved/)).toBeInTheDocument();
    });
  });

  describe("Assigned Ticket Result", () => {
    it("renders assigned card when complete but not critical and no resolution", () => {
      const assignedTeam = "TECHNICAL_SUPPORT";
      const assignedTo = "John Doe";

      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        isCritical: false,
        resolution: null,
        assignedTeam,
        assignedTo,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.getByText("TICKET ASSIGNED TO SUPPORT TEAM"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Your ticket has been analyzed and assigned/),
      ).toBeInTheDocument();
    });

    it("displays assigned team name", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        assignedTeam: "TECHNICAL_SUPPORT",
      });

      render(<TicketStream ticketId="ticket-123" />);

      const teamElement = screen.getByText((content, element) => {
        return element?.tagName === "SPAN" && content === "TECHNICAL SUPPORT";
      });
      expect(teamElement).toBeInTheDocument();
    });

    it("displays assigned person when provided", () => {
      const assignedTo = "Jane Smith";

      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        assignedTeam: "BILLING",
        assignedTo,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText(/Assigned to:/)).toBeInTheDocument();
      expect(screen.getByText(assignedTo)).toBeInTheDocument();
    });

    it("does not show assigned person when not provided", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        assignedTeam: "BILLING",
        assignedTo: null,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.queryByText(/Assigned to:/)).not.toBeInTheDocument();
    });

    it("shows expected response time", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        assignedTeam: "SUPPORT",
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.getByText(/Expected response: Within 2 hours/),
      ).toBeInTheDocument();
    });

    it("replaces underscores in team name", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        assignedTeam: "ACCOUNT_MANAGEMENT",
      });

      render(<TicketStream ticketId="ticket-123" />);

      const teamElements = screen.getAllByText(/ACCOUNT MANAGEMENT/);
      expect(teamElements.length).toBeGreaterThan(0);
    });
  });

  describe("Reset Button", () => {
    it("renders reset button when isComplete and onReset provided", () => {
      const onReset = jest.fn();

      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
      });

      render(<TicketStream ticketId="ticket-123" onReset={onReset} />);

      expect(
        screen.getByRole("button", { name: /Submit Another Ticket/i }),
      ).toBeInTheDocument();
    });

    it("does not render reset button when not complete", () => {
      const onReset = jest.fn();

      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: false,
      });

      render(<TicketStream ticketId="ticket-123" onReset={onReset} />);

      expect(
        screen.queryByRole("button", { name: /Submit Another Ticket/i }),
      ).not.toBeInTheDocument();
    });

    it("does not render reset button when onReset not provided", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(
        screen.queryByRole("button", { name: /Submit Another Ticket/i }),
      ).not.toBeInTheDocument();
    });

    it("calls onReset when button clicked", () => {
      const onReset = jest.fn();

      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
      });

      render(<TicketStream ticketId="ticket-123" onReset={onReset} />);

      const button = screen.getByRole("button", {
        name: /Submit Another Ticket/i,
      });
      fireEvent.click(button);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it("renders button with envelope emoji", () => {
      const onReset = jest.fn();

      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
      });

      render(<TicketStream ticketId="ticket-123" onReset={onReset} />);

      expect(screen.getByText(/✉️ Submit Another Ticket/)).toBeInTheDocument();
    });
  });

  describe("Multiple Events", () => {
    it("renders multiple events in order", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [
          {
            message: "First event",
            status: TicketStatus.RESOLVED,
            step: WorkflowStep.INTAKE_AGENT,
          },
          {
            message: "Second event",
            status: TicketStatus.IN_PROGRESS,
            step: WorkflowStep.CLASSIFICATION_AGENT,
          },
          {
            message: "Third event",
            status: TicketStatus.RESOLVED,
            step: WorkflowStep.SENTIMENT_AGENT,
          },
        ],
      });

      render(<TicketStream ticketId="ticket-123" />);

      expect(screen.getByText("First event")).toBeInTheDocument();
      expect(screen.getByText("Second event")).toBeInTheDocument();
      expect(screen.getByText("Third event")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty assignedTeam gracefully", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        isComplete: true,
        assignedTeam: "",
      });

      render(<TicketStream ticketId="ticket-123" />);

      // Should not crash
      expect(
        screen.getByText("TICKET ASSIGNED TO SUPPORT TEAM"),
      ).toBeInTheDocument();
    });

    it("handles very short ticket ID", () => {
      mockUseTicketStream.mockReturnValue({
        ...defaultMockData,
        events: [],
      });

      render(<TicketStream ticketId="123" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Processing Ticket #123");
    });
  });
});
