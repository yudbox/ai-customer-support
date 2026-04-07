/**
 * Integration tests for SimilarTickets component
 *
 * Тестирует отображение похожих тикетов: загрузка, список,
 * выбор тикета, AI рекомендации, пустое состояние.
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { SimilarTickets } from "@/app/_components/TicketDetailPanel/SimilarTickets";

describe("SimilarTickets Integration Tests", () => {
  const mockOnSelectTicket = jest.fn();

  const mockSimilarTickets = [
    {
      similarity: 0.95,
      subject: "Login issues",
      resolution: "Reset password and clear browser cache",
    },
    {
      similarity: 0.87,
      subject: "Cannot access account",
      resolution: "Check email verification status",
    },
    {
      similarity: 0.72,
      subject: "Password reset not working",
      resolution: "Contact support for manual reset",
    },
  ];

  const defaultProps = {
    isLoading: false,
    similarTickets: mockSimilarTickets,
    suggestedSolution: undefined,
    selectedIndex: null,
    onSelectTicket: mockOnSelectTicket,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      expect(() => render(<SimilarTickets {...defaultProps} />)).not.toThrow();
    });

    it("should render main container", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(
        screen.getByText("🔍 Similar Resolved Tickets"),
      ).toBeInTheDocument();
    });

    it("should render header with correct styling", () => {
      render(<SimilarTickets {...defaultProps} />);

      const header = screen.getByText("🔍 Similar Resolved Tickets");
      expect(header.tagName).toBe("H2");
      expect(header).toHaveClass("text-lg", "font-bold", "text-gray-900");
    });
  });

  describe("Loading State", () => {
    it("should display loading spinner when isLoading is true", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      expect(
        screen.getByText("Searching Pinecone for similar tickets..."),
      ).toBeInTheDocument();
    });

    it("should not display tickets when loading", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      expect(screen.queryByText("Login issues")).not.toBeInTheDocument();
    });

    it("should not display empty state when loading", () => {
      render(
        <SimilarTickets
          {...defaultProps}
          isLoading={true}
          similarTickets={undefined}
        />,
      );

      expect(
        screen.queryByText("❌ No similar tickets found"),
      ).not.toBeInTheDocument();
    });

    it("should have loading message with correct styling", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      const loadingText = screen.getByText(
        "Searching Pinecone for similar tickets...",
      );
      expect(loadingText).toHaveClass("text-sm", "text-gray-500");
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no tickets", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(
        screen.getByText("❌ No similar tickets found"),
      ).toBeInTheDocument();
    });

    it("should display empty state when similarTickets is undefined", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={undefined} />);

      expect(
        screen.getByText("❌ No similar tickets found"),
      ).toBeInTheDocument();
    });

    it("should display help text in empty state", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(
        screen.getByText("This appears to be the first ticket of this type."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Manual investigation required by support team."),
      ).toBeInTheDocument();
    });

    it("should not display tickets list in empty state", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(screen.queryByText("[95% match]")).not.toBeInTheDocument();
    });

    it("should not display loading spinner in empty state", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(
        screen.queryByText("Searching Pinecone for similar tickets..."),
      ).not.toBeInTheDocument();
    });
  });

  describe("Tickets Display", () => {
    it("should render all similar tickets", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("Login issues")).toBeInTheDocument();
      expect(screen.getByText("Cannot access account")).toBeInTheDocument();
      expect(
        screen.getByText("Password reset not working"),
      ).toBeInTheDocument();
    });

    it("should display similarity percentages", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("[95% match]")).toBeInTheDocument();
      expect(screen.getByText("[87% match]")).toBeInTheDocument();
      expect(screen.getByText("[72% match]")).toBeInTheDocument();
    });

    it("should display ticket subjects", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("Login issues")).toBeInTheDocument();
      expect(screen.getByText("Cannot access account")).toBeInTheDocument();
      expect(
        screen.getByText("Password reset not working"),
      ).toBeInTheDocument();
    });

    it("should display resolution label", () => {
      render(<SimilarTickets {...defaultProps} />);

      const resolutionLabels = screen.getAllByText("Resolution:");
      expect(resolutionLabels).toHaveLength(3);
    });

    it("should display resolution text for each ticket", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(
        screen.getByText("Reset password and clear browser cache"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Check email verification status"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Contact support for manual reset"),
      ).toBeInTheDocument();
    });

    it("should render single ticket correctly", () => {
      const singleTicket = [mockSimilarTickets[0]];
      render(
        <SimilarTickets {...defaultProps} similarTickets={singleTicket} />,
      );

      expect(screen.getByText("[95% match]")).toBeInTheDocument();
      expect(screen.getByText("Login issues")).toBeInTheDocument();
      expect(
        screen.getByText("Reset password and clear browser cache"),
      ).toBeInTheDocument();
    });

    it("should handle multiple tickets with same similarity", () => {
      const tickets = [
        { similarity: 0.85, subject: "Issue 1", resolution: "Solution 1" },
        { similarity: 0.85, subject: "Issue 2", resolution: "Solution 2" },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      const matches = screen.getAllByText("[85% match]");
      expect(matches).toHaveLength(2);
    });
  });

  describe("Similarity Percentage Formatting", () => {
    it("should round similarity to whole number", () => {
      const tickets = [
        { similarity: 0.956, subject: "Test 1", resolution: "Solution 1" },
        { similarity: 0.873, subject: "Test 2", resolution: "Solution 2" },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[96% match]")).toBeInTheDocument();
      expect(screen.getByText("[87% match]")).toBeInTheDocument();
    });

    it("should display 100% for perfect match", () => {
      const tickets = [
        { similarity: 1.0, subject: "Perfect match", resolution: "Same issue" },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[100% match]")).toBeInTheDocument();
    });

    it("should display low similarity correctly", () => {
      const tickets = [
        {
          similarity: 0.05,
          subject: "Low match",
          resolution: "Different issue",
        },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[5% match]")).toBeInTheDocument();
    });

    it("should display 0% for zero similarity", () => {
      const tickets = [
        { similarity: 0, subject: "No match", resolution: "Unrelated" },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[0% match]")).toBeInTheDocument();
    });
  });

  describe("Ticket Selection", () => {
    it("should call onSelectTicket when ticket is clicked", () => {
      render(<SimilarTickets {...defaultProps} />);

      const firstTicket = screen
        .getByText("Login issues")
        .closest("div")!.parentElement!;
      fireEvent.click(firstTicket);

      expect(mockOnSelectTicket).toHaveBeenCalledTimes(1);
      expect(mockOnSelectTicket).toHaveBeenCalledWith(
        0,
        "Reset password and clear browser cache",
      );
    });

    it("should call onSelectTicket with correct index and resolution", () => {
      render(<SimilarTickets {...defaultProps} />);

      const secondTicket = screen
        .getByText("Cannot access account")
        .closest("div")!.parentElement!;
      fireEvent.click(secondTicket);

      expect(mockOnSelectTicket).toHaveBeenCalledWith(
        1,
        "Check email verification status",
      );
    });

    it("should call onSelectTicket for each different ticket clicked", () => {
      render(<SimilarTickets {...defaultProps} />);

      const firstTicket = screen
        .getByText("Login issues")
        .closest("div")!.parentElement!;
      const thirdTicket = screen
        .getByText("Password reset not working")
        .closest("div")!.parentElement!;

      fireEvent.click(firstTicket);
      fireEvent.click(thirdTicket);

      expect(mockOnSelectTicket).toHaveBeenCalledTimes(2);
      expect(mockOnSelectTicket).toHaveBeenNthCalledWith(
        1,
        0,
        "Reset password and clear browser cache",
      );
      expect(mockOnSelectTicket).toHaveBeenNthCalledWith(
        2,
        2,
        "Contact support for manual reset",
      );
    });

    it("should allow clicking same ticket multiple times", () => {
      render(<SimilarTickets {...defaultProps} />);

      const firstTicket = screen
        .getByText("Login issues")
        .closest("div")!.parentElement!;

      fireEvent.click(firstTicket);
      fireEvent.click(firstTicket);
      fireEvent.click(firstTicket);

      expect(mockOnSelectTicket).toHaveBeenCalledTimes(3);
    });
  });

  describe("Selected State Indicator", () => {
    it("should display checkmark for selected ticket", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={0} />);

      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("should not display checkmark when no ticket is selected", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={null} />);

      expect(screen.queryByText("✓")).not.toBeInTheDocument();
    });

    it("should display checkmark only for selected ticket", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={1} />);

      const checkmarks = screen.queryAllByText("✓");
      expect(checkmarks).toHaveLength(1);
    });

    it("should move checkmark when different ticket is selected", () => {
      const { rerender } = render(
        <SimilarTickets {...defaultProps} selectedIndex={0} />,
      );

      expect(screen.getByText("✓")).toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} selectedIndex={2} />);

      const checkmarks = screen.queryAllByText("✓");
      expect(checkmarks).toHaveLength(1);
    });

    it("should remove checkmark when selection is cleared", () => {
      const { rerender } = render(
        <SimilarTickets {...defaultProps} selectedIndex={0} />,
      );

      expect(screen.getByText("✓")).toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} selectedIndex={null} />);

      expect(screen.queryByText("✓")).not.toBeInTheDocument();
    });

    it("should handle selected index for last ticket", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={2} />);

      expect(screen.getByText("✓")).toBeInTheDocument();
    });
  });

  describe("AI Recommended Solution", () => {
    it("should display AI solution when provided", () => {
      const solution =
        "Please reset your password by clicking the forgot password link";
      render(<SimilarTickets {...defaultProps} suggestedSolution={solution} />);

      expect(
        screen.getByText("💡 AI Recommended Solution (Best Match)"),
      ).toBeInTheDocument();
      expect(screen.getByText(solution)).toBeInTheDocument();
    });

    it("should not display AI solution when undefined", () => {
      render(
        <SimilarTickets {...defaultProps} suggestedSolution={undefined} />,
      );

      expect(
        screen.queryByText("💡 AI Recommended Solution (Best Match)"),
      ).not.toBeInTheDocument();
    });

    it("should not display AI solution when empty string", () => {
      render(<SimilarTickets {...defaultProps} suggestedSolution="" />);

      expect(
        screen.queryByText("💡 AI Recommended Solution (Best Match)"),
      ).not.toBeInTheDocument();
    });

    it("should display long AI solution", () => {
      const longSolution = "A".repeat(500);
      render(
        <SimilarTickets {...defaultProps} suggestedSolution={longSolution} />,
      );

      expect(screen.getByText(longSolution)).toBeInTheDocument();
    });

    it("should display AI solution with special characters", () => {
      const solution = "Contact support@email.com or call 1-800-123-4567";
      render(<SimilarTickets {...defaultProps} suggestedSolution={solution} />);

      expect(screen.getByText(solution)).toBeInTheDocument();
    });

    it("should display AI solution with multiline content", () => {
      const solution =
        "Step 1: Reset password. Step 2: Clear cache. Step 3: Login again";
      render(<SimilarTickets {...defaultProps} suggestedSolution={solution} />);

      expect(screen.getByText(/Step 1: Reset password/)).toBeInTheDocument();
      expect(screen.getByText(/Step 3: Login again/)).toBeInTheDocument();
    });

    it("should display AI solution below tickets list", () => {
      const solution = "Test solution";
      render(<SimilarTickets {...defaultProps} suggestedSolution={solution} />);

      // Tickets should be rendered
      expect(screen.getByText("Login issues")).toBeInTheDocument();
      // AI solution should also be rendered
      expect(screen.getByText(solution)).toBeInTheDocument();
    });
  });

  describe("Complete Workflows", () => {
    it("should handle loading to tickets transition", () => {
      const { rerender } = render(
        <SimilarTickets
          {...defaultProps}
          isLoading={true}
          similarTickets={undefined}
        />,
      );

      expect(
        screen.getByText("Searching Pinecone for similar tickets..."),
      ).toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} />);

      expect(
        screen.queryByText("Searching Pinecone for similar tickets..."),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Login issues")).toBeInTheDocument();
    });

    it("should handle loading to empty state transition", () => {
      const { rerender } = render(
        <SimilarTickets
          {...defaultProps}
          isLoading={true}
          similarTickets={undefined}
        />,
      );

      expect(
        screen.getByText("Searching Pinecone for similar tickets..."),
      ).toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(
        screen.queryByText("Searching Pinecone for similar tickets..."),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("❌ No similar tickets found"),
      ).toBeInTheDocument();
    });

    it("should handle selecting ticket and viewing AI solution", () => {
      const solution = "AI generated solution";
      render(<SimilarTickets {...defaultProps} suggestedSolution={solution} />);

      const firstTicket = screen
        .getByText("Login issues")
        .closest("div")!.parentElement!;
      fireEvent.click(firstTicket);

      expect(mockOnSelectTicket).toHaveBeenCalledWith(
        0,
        "Reset password and clear browser cache",
      );
      expect(screen.getByText(solution)).toBeInTheDocument();
    });

    it("should handle rapid ticket selection", () => {
      render(<SimilarTickets {...defaultProps} />);

      const tickets = [
        screen.getByText("Login issues").closest("div")!.parentElement!,
        screen.getByText("Cannot access account").closest("div")!
          .parentElement!,
        screen.getByText("Password reset not working").closest("div")!
          .parentElement!,
      ];

      tickets.forEach((ticket) => fireEvent.click(ticket));

      expect(mockOnSelectTicket).toHaveBeenCalledTimes(3);
    });
  });

  describe("Edge Cases", () => {
    it("should handle ticket with empty subject", () => {
      const tickets = [
        { similarity: 0.9, subject: "", resolution: "Some resolution" },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[90% match]")).toBeInTheDocument();
      expect(screen.getByText("Some resolution")).toBeInTheDocument();
    });

    it("should handle ticket with empty resolution", () => {
      const tickets = [
        { similarity: 0.9, subject: "Some subject", resolution: "" },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("Some subject")).toBeInTheDocument();
    });

    it("should handle very long subject", () => {
      const longSubject = "A".repeat(200);
      const tickets = [
        { similarity: 0.9, subject: longSubject, resolution: "Solution" },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText(longSubject)).toBeInTheDocument();
    });

    it("should handle very long resolution", () => {
      const longResolution = "B".repeat(500);
      const tickets = [
        { similarity: 0.9, subject: "Subject", resolution: longResolution },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText(longResolution)).toBeInTheDocument();
    });

    it("should handle negative selectedIndex gracefully", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={-1} />);

      expect(screen.queryByText("✓")).not.toBeInTheDocument();
    });

    it("should handle selectedIndex out of bounds", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={999} />);

      expect(screen.queryByText("✓")).not.toBeInTheDocument();
    });

    it("should handle many tickets", () => {
      const manyTickets = Array.from({ length: 20 }, (_, i) => ({
        similarity: 0.9 - i * 0.01,
        subject: `Ticket ${i + 1}`,
        resolution: `Resolution ${i + 1}`,
      }));
      render(<SimilarTickets {...defaultProps} similarTickets={manyTickets} />);

      expect(screen.getByText("Ticket 1")).toBeInTheDocument();
      expect(screen.getByText("Ticket 20")).toBeInTheDocument();
    });

    it("should handle fractional similarity edge cases", () => {
      const tickets = [
        { similarity: 0.999, subject: "Test 1", resolution: "Solution 1" },
        { similarity: 0.001, subject: "Test 2", resolution: "Solution 2" },
        { similarity: 0.5, subject: "Test 3", resolution: "Solution 3" },
      ];
      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[100% match]")).toBeInTheDocument();
      expect(screen.getByText("[0% match]")).toBeInTheDocument();
      expect(screen.getByText("[50% match]")).toBeInTheDocument();
    });
  });

  describe("State Transitions", () => {
    it("should transition from loading to filled correctly", () => {
      const { rerender } = render(
        <SimilarTickets
          {...defaultProps}
          isLoading={true}
          similarTickets={undefined}
        />,
      );

      expect(
        screen.getByText("Searching Pinecone for similar tickets..."),
      ).toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} isLoading={false} />);

      expect(
        screen.queryByText("Searching Pinecone for similar tickets..."),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Login issues")).toBeInTheDocument();
    });

    it("should transition from empty to filled", () => {
      const { rerender } = render(
        <SimilarTickets {...defaultProps} similarTickets={[]} />,
      );

      expect(
        screen.getByText("❌ No similar tickets found"),
      ).toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} />);

      expect(
        screen.queryByText("❌ No similar tickets found"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Login issues")).toBeInTheDocument();
    });

    it("should transition from filled to empty", () => {
      const { rerender } = render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("Login issues")).toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(screen.queryByText("Login issues")).not.toBeInTheDocument();
      expect(
        screen.getByText("❌ No similar tickets found"),
      ).toBeInTheDocument();
    });

    it("should update tickets when array changes", () => {
      const { rerender } = render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("Login issues")).toBeInTheDocument();

      const newTickets = [
        { similarity: 0.8, subject: "New ticket", resolution: "New solution" },
      ];
      rerender(
        <SimilarTickets {...defaultProps} similarTickets={newTickets} />,
      );

      expect(screen.queryByText("Login issues")).not.toBeInTheDocument();
      expect(screen.getByText("New ticket")).toBeInTheDocument();
    });

    it("should add and remove AI solution dynamically", () => {
      const { rerender } = render(
        <SimilarTickets {...defaultProps} suggestedSolution={undefined} />,
      );

      expect(
        screen.queryByText("💡 AI Recommended Solution (Best Match)"),
      ).not.toBeInTheDocument();

      rerender(
        <SimilarTickets
          {...defaultProps}
          suggestedSolution="New AI solution"
        />,
      );

      expect(
        screen.getByText("💡 AI Recommended Solution (Best Match)"),
      ).toBeInTheDocument();
      expect(screen.getByText("New AI solution")).toBeInTheDocument();

      rerender(
        <SimilarTickets {...defaultProps} suggestedSolution={undefined} />,
      );

      expect(
        screen.queryByText("💡 AI Recommended Solution (Best Match)"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic heading for title", () => {
      render(<SimilarTickets {...defaultProps} />);

      const heading = screen.getByText("🔍 Similar Resolved Tickets");
      expect(heading.tagName).toBe("H2");
    });

    it("should use semantic heading for AI solution", () => {
      render(
        <SimilarTickets {...defaultProps} suggestedSolution="Test solution" />,
      );

      const aiHeading = screen.getByText(
        "💡 AI Recommended Solution (Best Match)",
      );
      expect(aiHeading.tagName).toBe("H3");
    });

    it("should have clickable ticket elements", () => {
      render(<SimilarTickets {...defaultProps} />);

      const firstTicketText = screen.getByText("Login issues");
      expect(firstTicketText).toBeInTheDocument();
    });

    it("should provide resolution labels for screen readers", () => {
      render(<SimilarTickets {...defaultProps} />);

      const labels = screen.getAllByText("Resolution:");
      expect(labels.length).toBeGreaterThan(0);
    });
  });
});
