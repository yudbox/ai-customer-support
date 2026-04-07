import { render, screen } from "@testing-library/react";

import { PRIORITY_SCORE } from "@/lib/types/common";

import { TicketHeader } from "../TicketHeader";

describe("TicketHeader Component", () => {
  const defaultProps = {
    ticketNumber: "TKT-12345",
    priority: "HIGH",
    priorityScore: 75,
  };

  describe("Rendering", () => {
    it("renders component with ticket number", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText(/TKT-12345/i)).toBeInTheDocument();
    });

    it("renders heading as h1", () => {
      render(<TicketHeader {...defaultProps} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("renders priority text", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText(/Priority:/i)).toBeInTheDocument();
      expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
    });

    it("renders priority score", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText(/75\/100/i)).toBeInTheDocument();
    });

    it("renders pending approval badge", () => {
      render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    });
  });

  describe("Priority Score Emoji Logic", () => {
    it("displays urgent emoji (🚨) when priority score >= URGENT threshold", () => {
      render(
        <TicketHeader
          {...defaultProps}
          priorityScore={PRIORITY_SCORE.URGENT}
        />,
      );

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🚨");
    });

    it("displays urgent emoji for score above threshold", () => {
      render(<TicketHeader {...defaultProps} priorityScore={90} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🚨");
    });

    it("displays regular emoji (🔴) when priority score < URGENT threshold", () => {
      render(<TicketHeader {...defaultProps} priorityScore={75} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🔴");
      expect(heading).not.toHaveTextContent("🚨");
    });

    it("displays regular emoji for low priority scores", () => {
      render(<TicketHeader {...defaultProps} priorityScore={30} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🔴");
    });

    it("displays regular emoji when priority score is 0", () => {
      render(<TicketHeader {...defaultProps} priorityScore={0} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🔴");
    });

    it("displays regular emoji when priority score is null", () => {
      render(<TicketHeader {...defaultProps} priorityScore={null} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🔴");
    });

    it("displays regular emoji when priority score is undefined", () => {
      render(<TicketHeader {...defaultProps} priorityScore={undefined} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🔴");
    });
  });

  describe("Priority Score Display", () => {
    it("displays N/A when priority score is null", () => {
      render(<TicketHeader {...defaultProps} priorityScore={null} />);

      expect(screen.getByText(/N\/A\/100/i)).toBeInTheDocument();
    });

    it("displays N/A when priority score is undefined", () => {
      render(<TicketHeader {...defaultProps} priorityScore={undefined} />);

      expect(screen.getByText(/N\/A\/100/i)).toBeInTheDocument();
    });

    it("displays actual score when provided", () => {
      render(<TicketHeader {...defaultProps} priorityScore={85} />);

      expect(screen.getByText(/85\/100/i)).toBeInTheDocument();
    });

    it("displays 100 as maximum score", () => {
      render(<TicketHeader {...defaultProps} priorityScore={100} />);

      expect(screen.getByText(/100\/100/i)).toBeInTheDocument();
    });
  });

  describe("Priority Display", () => {
    it("displays priority when provided", () => {
      render(<TicketHeader {...defaultProps} priority="CRITICAL" />);

      expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
    });

    it("displays priority with different values", () => {
      render(<TicketHeader {...defaultProps} priority="LOW" />);

      expect(screen.getByText(/LOW/i)).toBeInTheDocument();
    });

    it("handles undefined priority gracefully", () => {
      render(<TicketHeader {...defaultProps} priority={undefined} />);

      // Priority label still exists
      expect(screen.getByText(/Priority:/i)).toBeInTheDocument();
    });
  });

  describe("Ticket Number Display", () => {
    it("displays ticket number in heading", () => {
      render(<TicketHeader {...defaultProps} ticketNumber="ABC-999" />);

      expect(screen.getByText(/#ABC-999/i)).toBeInTheDocument();
    });

    it("handles different ticket number formats", () => {
      render(<TicketHeader {...defaultProps} ticketNumber="12345" />);

      expect(screen.getByText(/#12345/i)).toBeInTheDocument();
    });

    it("includes # prefix in ticket number", () => {
      render(<TicketHeader {...defaultProps} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("#");
    });
  });

  describe("Styling", () => {
    it("has correct container styling", () => {
      const { container } = render(<TicketHeader {...defaultProps} />);
      const mainDiv = container.firstChild;

      expect(mainDiv).toHaveClass("bg-white");
      expect(mainDiv).toHaveClass("rounded-lg");
      expect(mainDiv).toHaveClass("shadow");
      expect(mainDiv).toHaveClass("p-6");
    });

    it("heading has correct text styling", () => {
      render(<TicketHeader {...defaultProps} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass("text-2xl");
      expect(heading).toHaveClass("font-bold");
      expect(heading).toHaveClass("text-gray-900");
    });

    it("priority text has correct styling", () => {
      render(<TicketHeader {...defaultProps} />);

      const priorityText = screen.getByText(/Priority:/i);
      expect(priorityText).toHaveClass("text-sm");
      expect(priorityText).toHaveClass("text-gray-500");
    });

    it("pending badge has yellow styling", () => {
      render(<TicketHeader {...defaultProps} />);

      const badge = screen.getByText("Pending Approval");
      expect(badge).toHaveClass("bg-yellow-100");
      expect(badge).toHaveClass("text-yellow-800");
      expect(badge).toHaveClass("rounded-full");
    });
  });

  describe("Component Props", () => {
    it("accepts and uses all props correctly", () => {
      const customProps = {
        ticketNumber: "CUSTOM-001",
        priority: "MEDIUM",
        priorityScore: 55,
      };

      render(<TicketHeader {...customProps} />);

      expect(screen.getByText(/#CUSTOM-001/i)).toBeInTheDocument();
      expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
      expect(screen.getByText(/55\/100/i)).toBeInTheDocument();
    });

    it("re-renders when props change", () => {
      const { rerender } = render(<TicketHeader {...defaultProps} />);

      expect(screen.getByText(/#TKT-12345/i)).toBeInTheDocument();

      rerender(<TicketHeader {...defaultProps} ticketNumber="NEW-999" />);

      expect(screen.getByText(/#NEW-999/i)).toBeInTheDocument();
      expect(screen.queryByText(/#TKT-12345/i)).not.toBeInTheDocument();
    });

    it("re-renders when priority score changes emoji", () => {
      const { rerender } = render(
        <TicketHeader {...defaultProps} priorityScore={70} />,
      );

      let heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🔴");

      rerender(<TicketHeader {...defaultProps} priorityScore={85} />);

      heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("🚨");
    });
  });

  describe("Accessibility", () => {
    it("heading is accessible", () => {
      render(<TicketHeader {...defaultProps} />);

      const heading = screen.getByRole("heading", {
        name: /ticket #TKT-12345/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("uses semantic HTML", () => {
      render(<TicketHeader {...defaultProps} />);

      const h1 = screen.getByRole("heading", { level: 1 });
      const p = screen.getByText(/priority:/i);

      expect(h1).toBeInTheDocument();
      expect(p).toBeInTheDocument();
    });
  });
});
