/**
 * Integration tests for TicketHeader component
 *
 * Тестирует заголовок тикета: номер, приоритет, эмодзи, статус.
 */

import { render, screen } from "@testing-library/react";

import { TicketHeader } from "@/app/_components/TicketDetailPanel/TicketHeader";

describe("TicketHeader Integration Tests", () => {
  const defaultProps = {
    ticketNumber: "TCK-12345",
    priority: "High",
    priorityScore: 75,
  };

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      expect(() => render(<TicketHeader {...defaultProps} />)).not.toThrow();
    });

    it("should render main container", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText(/Ticket #TCK-12345/)).toBeInTheDocument();
    });

    it("should render all sections", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText(/Ticket #/)).toBeInTheDocument();
      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
      expect(screen.getByText(/Pending Approval/)).toBeInTheDocument();
    });
  });

  describe("Ticket Number Display", () => {
    it("should display ticket number with hashtag", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText(/Ticket #TCK-12345/)).toBeInTheDocument();
    });

    it("should display different ticket numbers", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} ticketNumber="ABC-001" />,
      );

      expect(screen.getByText(/Ticket #ABC-001/)).toBeInTheDocument();

      rerender(<TicketHeader {...defaultProps} ticketNumber="XYZ-999" />);

      expect(screen.getByText(/Ticket #XYZ-999/)).toBeInTheDocument();
    });

    it("should render ticket number in H1 tag", () => {
      render(<TicketHeader {...defaultProps} />);

      const heading = screen.getByText(/Ticket #TCK-12345/);
      expect(heading.tagName).toBe("H1");
    });

    it("should have correct styling for ticket header", () => {
      render(<TicketHeader {...defaultProps} />);

      const heading = screen.getByText(/Ticket #TCK-12345/);
      expect(heading).toHaveClass("text-2xl", "font-bold", "text-gray-900");
    });
  });

  describe("Priority Emoji - High Priority (Urgent)", () => {
    it("should display 🚨 emoji for priority score >= 80", () => {
      render(<TicketHeader {...defaultProps} priorityScore={80} />);

      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();
    });

    it("should display 🚨 emoji for priority score = 80 exactly", () => {
      render(<TicketHeader {...defaultProps} priorityScore={80} />);

      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();
    });

    it("should display 🚨 emoji for priority score > 80", () => {
      render(<TicketHeader {...defaultProps} priorityScore={90} />);

      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();
    });

    it("should display 🚨 emoji for priority score = 100", () => {
      render(<TicketHeader {...defaultProps} priorityScore={100} />);

      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();
    });
  });

  describe("Priority Emoji - Normal Priority", () => {
    it("should display 🔴 emoji for priority score < 80", () => {
      render(<TicketHeader {...defaultProps} priorityScore={79} />);

      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });

    it("should display 🔴 emoji for priority score = 0", () => {
      render(<TicketHeader {...defaultProps} priorityScore={0} />);

      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });

    it("should display 🔴 emoji for priority score = 50", () => {
      render(<TicketHeader {...defaultProps} priorityScore={50} />);

      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });

    it("should display 🔴 emoji for priority score = 75", () => {
      render(<TicketHeader {...defaultProps} priorityScore={75} />);

      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });
  });

  describe("Priority Emoji - Undefined/Null Cases", () => {
    it("should display 🔴 emoji when priorityScore is undefined", () => {
      render(<TicketHeader {...defaultProps} priorityScore={undefined} />);

      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });

    it("should display 🔴 emoji when priorityScore is null", () => {
      render(<TicketHeader {...defaultProps} priorityScore={null} />);

      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });

    it("should treat undefined as 0 for emoji logic", () => {
      render(<TicketHeader {...defaultProps} priorityScore={undefined} />);

      // Should display 🔴 because undefined ?? 0 = 0, which is < 80
      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });

    it("should treat null as 0 for emoji logic", () => {
      render(<TicketHeader {...defaultProps} priorityScore={null} />);

      // Should display 🔴 because null ?? 0 = 0, which is < 80
      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });
  });

  describe("Priority Display Text", () => {
    it("should display priority name and score", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText("Priority: High (75/100)")).toBeInTheDocument();
    });

    it("should display different priority levels", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} priority="Low" priorityScore={20} />,
      );

      expect(screen.getByText("Priority: Low (20/100)")).toBeInTheDocument();

      rerender(
        <TicketHeader
          {...defaultProps}
          priority="Critical"
          priorityScore={95}
        />,
      );

      expect(
        screen.getByText("Priority: Critical (95/100)"),
      ).toBeInTheDocument();
    });

    it("should display N/A when priorityScore is undefined", () => {
      render(<TicketHeader {...defaultProps} priorityScore={undefined} />);

      expect(screen.getByText("Priority: High (N/A/100)")).toBeInTheDocument();
    });

    it("should display N/A when priorityScore is null", () => {
      render(<TicketHeader {...defaultProps} priorityScore={null} />);

      expect(screen.getByText("Priority: High (N/A/100)")).toBeInTheDocument();
    });

    it("should display 0 when priorityScore is 0", () => {
      render(<TicketHeader {...defaultProps} priorityScore={0} />);

      expect(screen.getByText("Priority: High (0/100)")).toBeInTheDocument();
    });

    it("should have correct styling for priority text", () => {
      render(<TicketHeader {...defaultProps} />);

      const priorityText = screen.getByText(/Priority:/);
      expect(priorityText).toHaveClass("text-sm", "text-gray-500");
    });
  });

  describe("Priority - Undefined Cases", () => {
    it("should handle undefined priority name", () => {
      render(<TicketHeader {...defaultProps} priority={undefined} />);

      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
      expect(screen.getByText(/75\/100/)).toBeInTheDocument();
    });

    it("should handle both priority and score as undefined", () => {
      render(
        <TicketHeader
          {...defaultProps}
          priority={undefined}
          priorityScore={undefined}
        />,
      );

      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
      expect(screen.getByText(/N\/A\/100/)).toBeInTheDocument();
    });
  });

  describe("Status Badge", () => {
    it("should display Pending Approval badge", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    });

    it("should always display Pending Approval badge", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} priorityScore={10} />,
      );

      expect(screen.getByText("Pending Approval")).toBeInTheDocument();

      rerender(<TicketHeader {...defaultProps} priorityScore={90} />);

      expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    });

    it("should have correct styling for status badge", () => {
      render(<TicketHeader {...defaultProps} />);

      const badge = screen.getByText("Pending Approval");
      expect(badge).toHaveClass(
        "px-3",
        "py-1",
        "bg-yellow-100",
        "text-yellow-800",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long ticket number", () => {
      const longNumber = "A".repeat(100);
      render(<TicketHeader {...defaultProps} ticketNumber={longNumber} />);

      expect(
        screen.getByText(new RegExp(`Ticket #${longNumber}`)),
      ).toBeInTheDocument();
    });

    it("should handle empty ticket number", () => {
      render(<TicketHeader {...defaultProps} ticketNumber="" />);

      expect(screen.getByText(/Ticket #$/)).toBeInTheDocument();
    });

    it("should handle very long priority name", () => {
      const longPriority = "B".repeat(100);
      render(<TicketHeader {...defaultProps} priority={longPriority} />);

      expect(
        screen.getByText(new RegExp(`Priority: ${longPriority}`)),
      ).toBeInTheDocument();
    });

    it("should handle empty priority name", () => {
      render(<TicketHeader {...defaultProps} priority="" />);

      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
      expect(screen.getByText(/75\/100/)).toBeInTheDocument();
    });

    it("should handle negative priority score", () => {
      render(<TicketHeader {...defaultProps} priorityScore={-10} />);

      expect(screen.getByText("Priority: High (-10/100)")).toBeInTheDocument();
      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });

    it("should handle priority score > 100", () => {
      render(<TicketHeader {...defaultProps} priorityScore={150} />);

      expect(screen.getByText("Priority: High (150/100)")).toBeInTheDocument();
      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();
    });

    it("should handle fractional priority score", () => {
      render(<TicketHeader {...defaultProps} priorityScore={75.5} />);

      expect(screen.getByText("Priority: High (75.5/100)")).toBeInTheDocument();
    });

    it("should handle special characters in ticket number", () => {
      render(<TicketHeader {...defaultProps} ticketNumber="TCK-#123-@456" />);

      expect(screen.getByText("🔴 Ticket #TCK-#123-@456")).toBeInTheDocument();
    });

    it("should handle special characters in priority", () => {
      render(<TicketHeader {...defaultProps} priority="High (Urgent!)" />);

      expect(
        screen.getByText("Priority: High (Urgent!) (75/100)"),
      ).toBeInTheDocument();
    });
  });

  describe("State Transitions", () => {
    it("should update emoji when priority changes from low to urgent", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} priorityScore={50} />,
      );

      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();

      rerender(<TicketHeader {...defaultProps} priorityScore={85} />);

      expect(screen.queryByText(/🔴 Ticket/)).not.toBeInTheDocument();
      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();
    });

    it("should update emoji when priority changes from urgent to low", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} priorityScore={90} />,
      );

      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();

      rerender(<TicketHeader {...defaultProps} priorityScore={70} />);

      expect(screen.queryByText(/🚨 Ticket/)).not.toBeInTheDocument();
      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
    });

    it("should update priority text dynamically", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} priority="Low" priorityScore={30} />,
      );

      expect(screen.getByText("Priority: Low (30/100)")).toBeInTheDocument();

      rerender(
        <TicketHeader {...defaultProps} priority="High" priorityScore={85} />,
      );

      expect(
        screen.queryByText("Priority: Low (30/100)"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Priority: High (85/100)")).toBeInTheDocument();
    });

    it("should update ticket number dynamically", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} ticketNumber="TCK-001" />,
      );

      expect(screen.getByText(/Ticket #TCK-001/)).toBeInTheDocument();

      rerender(<TicketHeader {...defaultProps} ticketNumber="TCK-999" />);

      expect(screen.queryByText(/Ticket #TCK-001/)).not.toBeInTheDocument();
      expect(screen.getByText(/Ticket #TCK-999/)).toBeInTheDocument();
    });

    it("should handle transition from defined to undefined priority score", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} priorityScore={75} />,
      );

      expect(screen.getByText("Priority: High (75/100)")).toBeInTheDocument();

      rerender(<TicketHeader {...defaultProps} priorityScore={undefined} />);

      expect(screen.getByText("Priority: High (N/A/100)")).toBeInTheDocument();
    });

    it("should handle transition from undefined to defined priority score", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} priorityScore={undefined} />,
      );

      expect(screen.getByText("Priority: High (N/A/100)")).toBeInTheDocument();

      rerender(<TicketHeader {...defaultProps} priorityScore={85} />);

      expect(screen.getByText("Priority: High (85/100)")).toBeInTheDocument();
    });
  });

  describe("Boundary Values", () => {
    it("should handle priority score at boundary 79", () => {
      render(<TicketHeader {...defaultProps} priorityScore={79} />);

      expect(screen.getByText(/🔴 Ticket/)).toBeInTheDocument();
      expect(screen.getByText("Priority: High (79/100)")).toBeInTheDocument();
    });

    it("should handle priority score at boundary 80", () => {
      render(<TicketHeader {...defaultProps} priorityScore={80} />);

      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();
      expect(screen.getByText("Priority: High (80/100)")).toBeInTheDocument();
    });

    it("should handle priority score at boundary 81", () => {
      render(<TicketHeader {...defaultProps} priorityScore={81} />);

      expect(screen.getByText(/🚨 Ticket/)).toBeInTheDocument();
      expect(screen.getByText("Priority: High (81/100)")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic H1 for ticket number", () => {
      render(<TicketHeader {...defaultProps} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Ticket #TCK-12345");
    });

    it("should have readable priority information", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
      expect(screen.getByText(/75\/100/)).toBeInTheDocument();
    });

    it("should have visible status badge", () => {
      render(<TicketHeader {...defaultProps} />);

      const badge = screen.getByText("Pending Approval");
      expect(badge).toBeVisible();
    });
  });
});
