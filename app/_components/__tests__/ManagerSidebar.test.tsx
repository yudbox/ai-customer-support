import { render, screen, fireEvent } from "@testing-library/react";

import { SentimentLabel } from "@/lib/types/common";

import { ManagerSidebar } from "../ManagerSidebar";

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => {
    return "5 minutes ago";
  }),
}));

// Mock tRPC
const mockGetPendingApproval = jest.fn();

jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    tickets: {
      getPendingApproval: {
        useQuery: () => mockGetPendingApproval(),
      },
    },
  },
}));

describe("ManagerSidebar Component", () => {
  const mockOnSelectTicket = jest.fn();
  const defaultProps = {
    selectedTicketId: null,
    onSelectTicket: mockOnSelectTicket,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("renders loading skeletons when data is loading", () => {
      mockGetPendingApproval.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(
        0,
      );
    });

    it("does not render header when loading", () => {
      mockGetPendingApproval.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.queryByText("PENDING APPROVAL")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("renders empty state when no tickets", () => {
      mockGetPendingApproval.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("No pending tickets")).toBeInTheDocument();
      expect(screen.getByText(/All caught up!/)).toBeInTheDocument();
    });

    it("shows 0 tickets count when no tickets", () => {
      mockGetPendingApproval.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("tickets")).toBeInTheDocument();
    });

    it("renders header even when empty", () => {
      mockGetPendingApproval.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("PENDING APPROVAL")).toBeInTheDocument();
    });
  });

  describe("Tickets List", () => {
    const mockTickets = [
      {
        id: "ticket-1",
        ticket_number: "T-001",
        subject: "Login issue",
        priority_score: 85,
        sentiment_label: SentimentLabel.ANGRY,
        customer_tier: "Regular",
        created_at: new Date("2024-01-01T10:00:00Z").toISOString(),
      },
      {
        id: "ticket-2",
        ticket_number: "T-002",
        subject: "Payment problem",
        priority_score: 50,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "VIP",
        created_at: new Date("2024-01-01T11:00:00Z").toISOString(),
      },
    ];

    it("renders all tickets", () => {
      mockGetPendingApproval.mockReturnValue({
        data: mockTickets,
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("#T-001")).toBeInTheDocument();
      expect(screen.getByText("#T-002")).toBeInTheDocument();
      expect(screen.getByText("Login issue")).toBeInTheDocument();
      expect(screen.getByText("Payment problem")).toBeInTheDocument();
    });

    it("shows correct ticket count", () => {
      mockGetPendingApproval.mockReturnValue({
        data: mockTickets,
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("calls onSelectTicket when ticket is clicked", () => {
      mockGetPendingApproval.mockReturnValue({
        data: mockTickets,
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      const firstTicket = screen.getByText("#T-001").closest("button");
      fireEvent.click(firstTicket!);

      expect(mockOnSelectTicket).toHaveBeenCalledWith("ticket-1");
      expect(mockOnSelectTicket).toHaveBeenCalledTimes(1);
    });

    it("highlights selected ticket", () => {
      mockGetPendingApproval.mockReturnValue({
        data: mockTickets,
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} selectedTicketId="ticket-1" />);

      const selectedTicket = screen.getByText("#T-001").closest("button");
      expect(selectedTicket).toHaveClass("bg-blue-50");
      expect(selectedTicket).toHaveClass("border-l-4");
    });

    it("does not highlight non-selected tickets", () => {
      mockGetPendingApproval.mockReturnValue({
        data: mockTickets,
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} selectedTicketId="ticket-1" />);

      const nonSelectedTicket = screen.getByText("#T-002").closest("button");
      expect(nonSelectedTicket).not.toHaveClass("bg-blue-50");
    });
  });

  describe("Priority Display", () => {
    it("shows urgent icon for high priority tickets", () => {
      const urgentTicket = {
        id: "urgent-1",
        ticket_number: "T-URGENT",
        subject: "Critical issue",
        priority_score: 90,
        sentiment_label: SentimentLabel.ANGRY,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [urgentTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("🚨")).toBeInTheDocument();
    });

    it("shows high priority icon for medium-high priority", () => {
      const mediumTicket = {
        id: "medium-1",
        ticket_number: "T-MED",
        subject: "Medium issue",
        priority_score: 60,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [mediumTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("🔴")).toBeInTheDocument();
    });

    it("shows low priority icon for low priority tickets", () => {
      const lowTicket = {
        id: "low-1",
        ticket_number: "T-LOW",
        subject: "Low priority issue",
        priority_score: 30,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [lowTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("🟡")).toBeInTheDocument();
    });

    it("handles null priority_score gracefully", () => {
      const nullPriorityTicket = {
        id: "null-1",
        ticket_number: "T-NULL",
        subject: "No priority",
        priority_score: null,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [nullPriorityTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      // Should default to low priority (0 >= MEDIUM is false)
      expect(screen.getByText("🟡")).toBeInTheDocument();
    });
  });

  describe("VIP Customer Badge", () => {
    it("shows VIP star for VIP customers", () => {
      const vipTicket = {
        id: "vip-1",
        ticket_number: "T-VIP",
        subject: "VIP issue",
        priority_score: 50,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "VIP",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [vipTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      const stars = screen.getAllByText("⭐");
      expect(stars.length).toBeGreaterThan(0);
    });

    it("does not show VIP star for non-VIP customers", () => {
      const regularTicket = {
        id: "reg-1",
        ticket_number: "T-REG",
        subject: "Regular issue",
        priority_score: 50,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [regularTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.queryByText("⭐")).not.toBeInTheDocument();
    });
  });

  describe("Sentiment Display", () => {
    it("shows angry emoji for angry sentiment", () => {
      const angryTicket = {
        id: "angry-1",
        ticket_number: "T-ANGRY",
        subject: "Angry customer",
        priority_score: 50,
        sentiment_label: SentimentLabel.ANGRY,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [angryTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("😡")).toBeInTheDocument();
    });

    it("shows neutral emoji for neutral sentiment", () => {
      const neutralTicket = {
        id: "neutral-1",
        ticket_number: "T-NEUTRAL",
        subject: "Neutral customer",
        priority_score: 50,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [neutralTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("😐")).toBeInTheDocument();
    });

    it("shows positive emoji for positive sentiment", () => {
      const positiveTicket = {
        id: "positive-1",
        ticket_number: "T-POSITIVE",
        subject: "Happy customer",
        priority_score: 50,
        sentiment_label: SentimentLabel.POSITIVE,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [positiveTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("😊")).toBeInTheDocument();
    });

    it("handles missing sentiment_label", () => {
      const noSentimentTicket = {
        id: "no-sent-1",
        ticket_number: "T-NOSENT",
        subject: "No sentiment",
        priority_score: 50,
        sentiment_label: null,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [noSentimentTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      // Should not crash
      expect(screen.getByText("No sentiment")).toBeInTheDocument();
    });
  });

  describe("Time Display", () => {
    it("shows formatted time for each ticket", () => {
      const ticket = {
        id: "time-1",
        ticket_number: "T-TIME",
        subject: "Time test",
        priority_score: 50,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "Regular",
        created_at: new Date("2024-01-01T10:00:00Z").toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [ticket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined tickets data", () => {
      mockGetPendingApproval.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("No pending tickets")).toBeInTheDocument();
    });

    it("handles null tickets data", () => {
      mockGetPendingApproval.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      expect(screen.getByText("No pending tickets")).toBeInTheDocument();
    });

    it("renders with null selectedTicketId", () => {
      const ticket = {
        id: "test-1",
        ticket_number: "T-TEST",
        subject: "Test",
        priority_score: 50,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [ticket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} selectedTicketId={null} />);

      const ticketButton = screen.getByText("#T-TEST").closest("button");
      expect(ticketButton).not.toHaveClass("bg-blue-50");
    });

    it("truncates long subjects", () => {
      const longSubjectTicket = {
        id: "long-1",
        ticket_number: "T-LONG",
        subject:
          "This is a very long subject that should be truncated in the sidebar to prevent UI issues and maintain a clean layout",
        priority_score: 50,
        sentiment_label: SentimentLabel.NEUTRAL,
        customer_tier: "Regular",
        created_at: new Date().toISOString(),
      };

      mockGetPendingApproval.mockReturnValue({
        data: [longSubjectTicket],
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      const subjectElement = screen.getByText(/This is a very long subject/);
      expect(subjectElement).toHaveClass("truncate");
    });
  });

  describe("Multiple Tickets Interaction", () => {
    it("allows clicking different tickets", () => {
      const tickets = [
        {
          id: "multi-1",
          ticket_number: "T-M1",
          subject: "First ticket",
          priority_score: 50,
          sentiment_label: SentimentLabel.NEUTRAL,
          customer_tier: "Regular",
          created_at: new Date().toISOString(),
        },
        {
          id: "multi-2",
          ticket_number: "T-M2",
          subject: "Second ticket",
          priority_score: 60,
          sentiment_label: SentimentLabel.ANGRY,
          customer_tier: "VIP",
          created_at: new Date().toISOString(),
        },
      ];

      mockGetPendingApproval.mockReturnValue({
        data: tickets,
        isLoading: false,
      });

      render(<ManagerSidebar {...defaultProps} />);

      const firstTicket = screen.getByText("#T-M1").closest("button");
      const secondTicket = screen.getByText("#T-M2").closest("button");

      fireEvent.click(firstTicket!);
      expect(mockOnSelectTicket).toHaveBeenCalledWith("multi-1");

      fireEvent.click(secondTicket!);
      expect(mockOnSelectTicket).toHaveBeenCalledWith("multi-2");

      expect(mockOnSelectTicket).toHaveBeenCalledTimes(2);
    });
  });
});
