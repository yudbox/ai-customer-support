/**
 * Integration tests for ManagerSidebar component
 *
 * Тестирует отображение списка pending tickets, loading states,
 * приоритеты, sentiment labels, VIP badges, и выбор тикетов.
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { ManagerSidebar } from "@/app/_components/ManagerSidebar";
import { PRIORITY_SCORE, SentimentLabel } from "@/lib/types/common";

// Mock tRPC
const mockUseQuery = jest.fn();

jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    tickets: {
      getPendingApproval: {
        useQuery: () => mockUseQuery(),
      },
    },
  },
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(
    (date: Date) =>
      `${Math.floor((Date.now() - date.getTime()) / 60000)} minutes ago`,
  ),
}));

describe("ManagerSidebar Integration Tests", () => {
  const mockOnSelectTicket = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should show loading skeletons when data is loading", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      const skeletons = screen.getAllByTestId("loading-skeleton");
      expect(skeletons).toHaveLength(3);
    });

    it("should have animate-pulse on loading skeletons", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      const skeletons = screen.getAllByTestId("loading-skeleton");
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("animate-pulse");
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no tickets", () => {
      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("No pending tickets")).toBeInTheDocument();
      expect(screen.getByText("All caught up! 🎉")).toBeInTheDocument();
    });

    it("should show 0 in pending count badge when no tickets", () => {
      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("tickets")).toBeInTheDocument();
    });
  });

  describe("Header", () => {
    it("should render header with title", () => {
      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("PENDING APPROVAL")).toBeInTheDocument();
    });

    it("should show correct pending count badge", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Test ticket 1",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            ticket_number: 1002,
            subject: "Test ticket 2",
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("Ticket List", () => {
    it("should render all tickets", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "First ticket",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            ticket_number: 1002,
            subject: "Second ticket",
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            ticket_number: 1003,
            subject: "Third ticket",
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("#1001")).toBeInTheDocument();
      expect(screen.getByText("#1002")).toBeInTheDocument();
      expect(screen.getByText("#1003")).toBeInTheDocument();
      expect(screen.getByText("First ticket")).toBeInTheDocument();
      expect(screen.getByText("Second ticket")).toBeInTheDocument();
      expect(screen.getByText("Third ticket")).toBeInTheDocument();
    });

    it("should call onSelectTicket when ticket is clicked", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "ticket-123",
            ticket_number: 1001,
            subject: "Test ticket",
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      const ticketButton = screen.getByText("#1001").closest("button");
      fireEvent.click(ticketButton!);

      expect(mockOnSelectTicket).toHaveBeenCalledWith("ticket-123");
      expect(mockOnSelectTicket).toHaveBeenCalledTimes(1);
    });

    it("should highlight selected ticket", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "ticket-selected",
            ticket_number: 1001,
            subject: "Selected ticket",
            created_at: new Date().toISOString(),
          },
          {
            id: "ticket-unselected",
            ticket_number: 1002,
            subject: "Unselected ticket",
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId="ticket-selected"
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      const selectedButton = screen.getByText("#1001").closest("button");
      const unselectedButton = screen.getByText("#1002").closest("button");

      expect(selectedButton).toHaveClass("bg-blue-50");
      expect(selectedButton).toHaveClass("border-blue-500");
      expect(unselectedButton).not.toHaveClass("bg-blue-50");
    });
  });

  describe("Priority Badges", () => {
    it("should show urgent emoji (🚨) for urgent priority", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Urgent ticket",
            priority_score: PRIORITY_SCORE.URGENT,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("🚨")).toBeInTheDocument();
    });

    it("should animate urgent priority badge", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Urgent ticket",
            priority_score: PRIORITY_SCORE.URGENT,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      const urgentBadge = screen.getByText("🚨");
      expect(urgentBadge).toHaveClass("animate-pulse");
    });

    it("should show medium emoji (🔴) for medium priority", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Medium priority ticket",
            priority_score: PRIORITY_SCORE.MEDIUM,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("🔴")).toBeInTheDocument();
    });

    it("should show low emoji (🟡) for low priority", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Low priority ticket",
            priority_score: PRIORITY_SCORE.LOW,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("🟡")).toBeInTheDocument();
    });

    it("should default to low priority when priority_score is null", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "No priority ticket",
            priority_score: null,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("🟡")).toBeInTheDocument();
    });
  });

  describe("VIP Badge", () => {
    it("should show VIP star for VIP customers", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "VIP ticket",
            customer_tier: "VIP",
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("⭐")).toBeInTheDocument();
    });

    it("should not show VIP star for non-VIP customers", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Regular ticket",
            customer_tier: "STANDARD",
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.queryByText("⭐")).not.toBeInTheDocument();
    });
  });

  describe("Sentiment Labels", () => {
    it("should show angry emoji for ANGRY sentiment", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Angry customer",
            sentiment_label: SentimentLabel.ANGRY,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("😡")).toBeInTheDocument();
    });

    it("should show neutral emoji for NEUTRAL sentiment", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Neutral customer",
            sentiment_label: SentimentLabel.NEUTRAL,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("😐")).toBeInTheDocument();
    });

    it("should show happy emoji for POSITIVE sentiment", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Happy customer",
            sentiment_label: SentimentLabel.POSITIVE,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("😊")).toBeInTheDocument();
    });

    it("should not show sentiment emoji when sentiment_label is null", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "No sentiment",
            sentiment_label: null,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.queryByText("😡")).not.toBeInTheDocument();
      expect(screen.queryByText("😐")).not.toBeInTheDocument();
      expect(screen.queryByText("😊")).not.toBeInTheDocument();
    });
  });

  describe("Time Display", () => {
    it("should show time ago for each ticket", () => {
      const pastDate = new Date(Date.now() - 5 * 60000); // 5 minutes ago

      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Recent ticket",
            created_at: pastDate.toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText(/minutes ago/i)).toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("should render ticket with all features combined", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "complex-ticket",
            ticket_number: 9999,
            subject: "Complex VIP urgent angry ticket",
            priority_score: PRIORITY_SCORE.URGENT,
            customer_tier: "VIP",
            sentiment_label: SentimentLabel.ANGRY,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      // Check all badges are present
      expect(screen.getByText("🚨")).toBeInTheDocument(); // Urgent
      expect(screen.getByText("⭐")).toBeInTheDocument(); // VIP
      expect(screen.getByText("😡")).toBeInTheDocument(); // Angry
      expect(screen.getByText("#9999")).toBeInTheDocument();
      expect(
        screen.getByText("Complex VIP urgent angry ticket"),
      ).toBeInTheDocument();
    });

    it("should handle multiple tickets with different states", () => {
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: "1",
            ticket_number: 1001,
            subject: "Urgent VIP",
            priority_score: PRIORITY_SCORE.URGENT,
            customer_tier: "VIP",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            ticket_number: 1002,
            subject: "Medium Standard",
            priority_score: PRIORITY_SCORE.MEDIUM,
            customer_tier: "STANDARD",
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            ticket_number: 1003,
            subject: "Low Regular",
            priority_score: PRIORITY_SCORE.LOW,
            created_at: new Date().toISOString(),
          },
        ],
        isLoading: false,
      });

      render(
        <ManagerSidebar
          selectedTicketId={null}
          onSelectTicket={mockOnSelectTicket}
        />,
      );

      expect(screen.getByText("🚨")).toBeInTheDocument();
      expect(screen.getByText("🔴")).toBeInTheDocument();
      expect(screen.getByText("🟡")).toBeInTheDocument();
      expect(screen.getByText("⭐")).toBeInTheDocument();
      expect(screen.queryAllByText("⭐")).toHaveLength(1); // Only one VIP
    });
  });
});
