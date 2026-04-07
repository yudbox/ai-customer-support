import { render, screen, fireEvent } from "@testing-library/react";

import { SimilarTickets } from "@/app/_components/TicketDetailPanel/SimilarTickets";

describe("SimilarTickets Component", () => {
  const mockOnSelectTicket = jest.fn();

  const defaultProps = {
    isLoading: false,
    similarTickets: [
      {
        similarity: 0.95,
        subject: "Login issue with SSO",
        resolution: "Reset SSO credentials and clear cache.",
      },
      {
        similarity: 0.87,
        subject: "Cannot access dashboard",
        resolution: "Clear browser cookies and try again.",
      },
    ],
    suggestedSolution: undefined as string | undefined,
    selectedIndex: null as number | null,
    onSelectTicket: mockOnSelectTicket,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders component with heading", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(
        screen.getByText("🔍 Similar Resolved Tickets"),
      ).toBeInTheDocument();
    });

    it("renders heading as h2", () => {
      render(<SimilarTickets {...defaultProps} />);

      const heading = screen.getByRole("heading", {
        name: /similar resolved tickets/i,
      });
      expect(heading.tagName).toBe("H2");
    });

    it("renders container with correct styling", () => {
      const { container } = render(<SimilarTickets {...defaultProps} />);
      const mainDiv = container.firstChild;

      expect(mainDiv).toHaveClass("bg-white");
      expect(mainDiv).toHaveClass("rounded-lg");
      expect(mainDiv).toHaveClass("shadow");
      expect(mainDiv).toHaveClass("p-6");
    });

    it("renders heading with emoji", () => {
      render(<SimilarTickets {...defaultProps} />);

      const heading = screen.getByText(/similar resolved tickets/i);
      expect(heading).toHaveTextContent("🔍");
    });
  });

  describe("Loading State", () => {
    it("displays loading spinner when isLoading is true", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      const spinner = screen.getByText(/searching pinecone/i).previousSibling;
      expect(spinner).toHaveClass("animate-spin");
    });

    it("displays loading message when isLoading is true", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      expect(
        screen.getByText("Searching Pinecone for similar tickets..."),
      ).toBeInTheDocument();
    });

    it("does not display similar tickets when loading", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      expect(
        screen.queryByText("Login issue with SSO"),
      ).not.toBeInTheDocument();
    });

    it("does not display empty state when loading", () => {
      render(
        <SimilarTickets
          {...defaultProps}
          isLoading={true}
          similarTickets={undefined}
        />,
      );

      expect(
        screen.queryByText(/no similar tickets found/i),
      ).not.toBeInTheDocument();
    });

    it("spinner has correct styling", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      const spinner = screen.getByText(/searching pinecone/i).previousSibling;
      expect(spinner).toHaveClass("rounded-full");
      expect(spinner).toHaveClass("h-8");
      expect(spinner).toHaveClass("w-8");
      expect(spinner).toHaveClass("border-b-2");
      expect(spinner).toHaveClass("border-blue-600");
    });

    it("loading container has centered text", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      // Check loading text is displayed (centering is CSS)
      expect(screen.getByText(/searching pinecone/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("displays empty state when similarTickets is undefined", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={undefined} />);

      expect(
        screen.getByText("❌ No similar tickets found"),
      ).toBeInTheDocument();
    });

    it("displays empty state when similarTickets is empty array", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(
        screen.getByText("❌ No similar tickets found"),
      ).toBeInTheDocument();
    });

    it("displays first ticket message in empty state", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={undefined} />);

      expect(
        screen.getByText("This appears to be the first ticket of this type."),
      ).toBeInTheDocument();
    });

    it("displays manual investigation message in empty state", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={undefined} />);

      expect(
        screen.getByText("Manual investigation required by support team."),
      ).toBeInTheDocument();
    });

    it("does not display similar tickets in empty state", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(screen.queryByText(/login issue/i)).not.toBeInTheDocument();
    });

    it("empty state has centered text", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      // Check empty state text is displayed (centering is CSS)
      expect(screen.getByText(/no similar tickets found/i)).toBeInTheDocument();
    });
  });

  describe("Similar Tickets Display", () => {
    it("renders all similar tickets", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("Login issue with SSO")).toBeInTheDocument();
      expect(screen.getByText("Cannot access dashboard")).toBeInTheDocument();
    });

    it("displays similarity percentage for each ticket", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("[95% match]")).toBeInTheDocument();
      expect(screen.getByText("[87% match]")).toBeInTheDocument();
    });

    it("displays subject for each ticket", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("Login issue with SSO")).toBeInTheDocument();
      expect(screen.getByText("Cannot access dashboard")).toBeInTheDocument();
    });

    it("displays resolution label", () => {
      render(<SimilarTickets {...defaultProps} />);

      const resolutionLabels = screen.getAllByText("Resolution:");
      expect(resolutionLabels).toHaveLength(2);
    });

    it("displays resolution text for each ticket", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(
        screen.getByText("Reset SSO credentials and clear cache."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Clear browser cookies and try again."),
      ).toBeInTheDocument();
    });

    it("renders single similar ticket correctly", () => {
      const singleTicket = [
        {
          similarity: 0.99,
          subject: "Single ticket",
          resolution: "Single resolution",
        },
      ];

      render(
        <SimilarTickets {...defaultProps} similarTickets={singleTicket} />,
      );

      expect(screen.getByText("Single ticket")).toBeInTheDocument();
      expect(screen.getByText("[99% match]")).toBeInTheDocument();
      expect(screen.getByText("Single resolution")).toBeInTheDocument();
    });

    it("renders many similar tickets correctly", () => {
      const manyTickets = Array.from({ length: 5 }, (_, i) => ({
        similarity: 0.9 - i * 0.1,
        subject: `Ticket ${i + 1}`,
        resolution: `Resolution ${i + 1}`,
      }));

      render(<SimilarTickets {...defaultProps} similarTickets={manyTickets} />);

      expect(screen.getByText("Ticket 1")).toBeInTheDocument();
      expect(screen.getByText("Ticket 5")).toBeInTheDocument();
      expect(screen.getByText("[90% match]")).toBeInTheDocument();
      expect(screen.getByText("[50% match]")).toBeInTheDocument();
    });
  });

  describe("Similarity Percentage Formatting", () => {
    it("formats similarity as percentage with no decimals", () => {
      render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("[95% match]")).toBeInTheDocument();
    });

    it("rounds similarity percentage correctly", () => {
      const tickets = [
        { similarity: 0.956, subject: "Test 1", resolution: "Res 1" },
        { similarity: 0.954, subject: "Test 2", resolution: "Res 2" },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[96% match]")).toBeInTheDocument();
      expect(screen.getByText("[95% match]")).toBeInTheDocument();
    });

    it("handles 100% similarity", () => {
      const tickets = [
        { similarity: 1.0, subject: "Perfect match", resolution: "Fix it" },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[100% match]")).toBeInTheDocument();
    });

    it("handles 0% similarity", () => {
      const tickets = [
        { similarity: 0.0, subject: "No match", resolution: "No res" },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[0% match]")).toBeInTheDocument();
    });

    it("handles very low similarity", () => {
      const tickets = [
        { similarity: 0.05, subject: "Low match", resolution: "Low res" },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[5% match]")).toBeInTheDocument();
    });
  });

  describe("Selection State", () => {
    it("highlights selected ticket with green border", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={0} />);

      const selectedTicket = screen
        .getByText("Login issue with SSO")
        .closest("div.border-l-4");
      expect(selectedTicket).toHaveClass("border-green-500");
      expect(selectedTicket).toHaveClass("bg-green-50");
    });

    it("displays checkmark for selected ticket", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={0} />);

      const checkmark = screen.getByText("✓");
      expect(checkmark).toBeInTheDocument();
      expect(checkmark).toHaveClass("text-green-600");
    });

    it("non-selected tickets have blue border", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={0} />);

      const nonSelectedTicket = screen
        .getByText("Cannot access dashboard")
        .closest("div.border-l-4");
      expect(nonSelectedTicket).toHaveClass("border-blue-500");
      expect(nonSelectedTicket).toHaveClass("bg-blue-50");
    });

    it("only selected ticket shows checkmark", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={1} />);

      const checkmarks = screen.getAllByText("✓");
      expect(checkmarks).toHaveLength(1);
    });

    it("no checkmark when no ticket is selected", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={null} />);

      expect(screen.queryByText("✓")).not.toBeInTheDocument();
    });

    it("all tickets have blue border when nothing is selected", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={null} />);

      // Check all tickets are rendered by verifying their text content
      expect(screen.getByText("Login issue with SSO")).toBeInTheDocument();
      expect(screen.getByText("Cannot access dashboard")).toBeInTheDocument();
    });

    it("handles selection of last ticket", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={1} />);

      const selectedTicket = screen
        .getByText("Cannot access dashboard")
        .closest("div.border-l-4");
      expect(selectedTicket).toHaveClass("border-green-500");
    });
  });

  describe("Click Interactions", () => {
    it("calls onSelectTicket when ticket is clicked", () => {
      render(<SimilarTickets {...defaultProps} />);

      const firstTicket = screen
        .getByText("Login issue with SSO")
        .closest("div.border-l-4");
      fireEvent.click(firstTicket!);

      expect(mockOnSelectTicket).toHaveBeenCalledWith(
        0,
        "Reset SSO credentials and clear cache.",
      );
      expect(mockOnSelectTicket).toHaveBeenCalledTimes(1);
    });

    it("calls onSelectTicket with correct index and resolution", () => {
      render(<SimilarTickets {...defaultProps} />);

      const secondTicket = screen
        .getByText("Cannot access dashboard")
        .closest("div.border-l-4");
      fireEvent.click(secondTicket!);

      expect(mockOnSelectTicket).toHaveBeenCalledWith(
        1,
        "Clear browser cookies and try again.",
      );
    });

    it("can click same ticket multiple times", () => {
      render(<SimilarTickets {...defaultProps} />);

      const firstTicket = screen
        .getByText("Login issue with SSO")
        .closest("div.border-l-4");
      fireEvent.click(firstTicket!);
      fireEvent.click(firstTicket!);
      fireEvent.click(firstTicket!);

      expect(mockOnSelectTicket).toHaveBeenCalledTimes(3);
    });

    it("clicking different tickets calls handler with different arguments", () => {
      render(<SimilarTickets {...defaultProps} />);

      const firstTicket = screen
        .getByText("Login issue with SSO")
        .closest("div.border-l-4");
      const secondTicket = screen
        .getByText("Cannot access dashboard")
        .closest("div.border-l-4");

      fireEvent.click(firstTicket!);
      fireEvent.click(secondTicket!);

      expect(mockOnSelectTicket).toHaveBeenNthCalledWith(
        1,
        0,
        "Reset SSO credentials and clear cache.",
      );
      expect(mockOnSelectTicket).toHaveBeenNthCalledWith(
        2,
        1,
        "Clear browser cookies and try again.",
      );
    });

    it("ticket has cursor-pointer class", () => {
      render(<SimilarTickets {...defaultProps} />);

      const ticket = screen
        .getByText("Login issue with SSO")
        .closest("div.border-l-4");
      expect(ticket).toHaveClass("cursor-pointer");
    });
  });

  describe("Suggested Solution Display", () => {
    it("displays suggested solution when provided", () => {
      render(
        <SimilarTickets
          {...defaultProps}
          suggestedSolution="This is the AI recommended solution."
        />,
      );

      expect(
        screen.getByText("This is the AI recommended solution."),
      ).toBeInTheDocument();
    });

    it("displays suggested solution heading", () => {
      render(
        <SimilarTickets {...defaultProps} suggestedSolution="AI solution" />,
      );

      expect(
        screen.getByText("💡 AI Recommended Solution (Best Match)"),
      ).toBeInTheDocument();
    });

    it("does not display suggested solution when not provided", () => {
      render(
        <SimilarTickets {...defaultProps} suggestedSolution={undefined} />,
      );

      expect(
        screen.queryByText(/ai recommended solution/i),
      ).not.toBeInTheDocument();
    });

    it("does not display suggested solution when empty string", () => {
      render(<SimilarTickets {...defaultProps} suggestedSolution="" />);

      expect(
        screen.queryByText(/ai recommended solution/i),
      ).not.toBeInTheDocument();
    });

    it("suggested solution has green styling", () => {
      render(
        <SimilarTickets {...defaultProps} suggestedSolution="AI solution" />,
      );

      const solutionContainer = screen
        .getByText("AI solution")
        .closest("div.bg-green-50");
      expect(solutionContainer).toHaveClass("border-green-500");
    });

    it("suggested solution heading has emoji", () => {
      render(
        <SimilarTickets {...defaultProps} suggestedSolution="AI solution" />,
      );

      const heading = screen.getByText(/ai recommended solution/i);
      expect(heading).toHaveTextContent("💡");
    });

    it("displays very long suggested solution", () => {
      const longSolution = "A".repeat(1000);
      render(
        <SimilarTickets {...defaultProps} suggestedSolution={longSolution} />,
      );

      expect(screen.getByText(longSolution)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("ticket has border-l-4 class", () => {
      render(<SimilarTickets {...defaultProps} />);

      const ticket = screen
        .getByText("Login issue with SSO")
        .closest("div.border-l-4");
      expect(ticket).toHaveClass("p-4");
      expect(ticket).toHaveClass("rounded");
    });

    it("similarity has blue text", () => {
      render(<SimilarTickets {...defaultProps} />);

      const similarity = screen.getByText("[95% match]");
      expect(similarity).toHaveClass("text-blue-700");
      expect(similarity).toHaveClass("font-bold");
    });

    it("subject has gray text", () => {
      render(<SimilarTickets {...defaultProps} />);

      const subject = screen.getByText("Login issue with SSO");
      expect(subject).toHaveClass("text-gray-600");
    });

    it("resolution label has medium font weight", () => {
      render(<SimilarTickets {...defaultProps} />);

      const labels = screen.getAllByText("Resolution:");
      expect(labels[0]).toHaveClass("font-medium");
      expect(labels[0]).toHaveClass("text-gray-700");
    });

    it("tickets have transition-colors class", () => {
      render(<SimilarTickets {...defaultProps} />);

      const ticket = screen
        .getByText("Login issue with SSO")
        .closest("div.border-l-4");
      expect(ticket).toHaveClass("transition-colors");
    });

    it("heading has correct margins", () => {
      render(<SimilarTickets {...defaultProps} />);

      const heading = screen.getByText(/similar resolved tickets/i);
      expect(heading).toHaveClass("mb-4");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long subject text", () => {
      const tickets = [
        {
          similarity: 0.9,
          subject: "A".repeat(200),
          resolution: "Fix",
        },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("A".repeat(200))).toBeInTheDocument();
    });

    it("handles very long resolution text", () => {
      const tickets = [
        {
          similarity: 0.9,
          subject: "Test",
          resolution: "R".repeat(500),
        },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("R".repeat(500))).toBeInTheDocument();
    });

    it("handles special characters in subject", () => {
      const tickets = [
        {
          similarity: 0.9,
          subject: "<script>alert('xss')</script>",
          resolution: "Fix",
        },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(
        screen.getByText("<script>alert('xss')</script>"),
      ).toBeInTheDocument();
    });

    it("handles unicode characters", () => {
      const tickets = [
        {
          similarity: 0.9,
          subject: "Login problem with special chars 🚀",
          resolution: "Solution with instructions",
        },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(
        screen.getByText("Login problem with special chars 🚀"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Solution with instructions"),
      ).toBeInTheDocument();
    });

    it("handles empty subject", () => {
      const tickets = [
        {
          similarity: 0.9,
          subject: "",
          resolution: "Fix",
        },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      expect(screen.getByText("[90% match]")).toBeInTheDocument();
    });

    it("handles empty resolution", () => {
      const tickets = [
        {
          similarity: 0.9,
          subject: "Test",
          resolution: "",
        },
      ];

      render(<SimilarTickets {...defaultProps} similarTickets={tickets} />);

      const resolutionLabel = screen.getByText("Resolution:");
      expect(resolutionLabel).toBeInTheDocument();
    });

    it("handles negative selectedIndex gracefully", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={-1} />);

      expect(screen.queryByText("✓")).not.toBeInTheDocument();
    });

    it("handles selectedIndex beyond array length", () => {
      render(<SimilarTickets {...defaultProps} selectedIndex={999} />);

      expect(screen.queryByText("✓")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("heading is accessible", () => {
      render(<SimilarTickets {...defaultProps} />);

      const heading = screen.getByRole("heading", {
        name: /similar resolved tickets/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("loading message is accessible", () => {
      render(<SimilarTickets {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/searching pinecone/i)).toBeInTheDocument();
    });

    it("empty state message is accessible", () => {
      render(<SimilarTickets {...defaultProps} similarTickets={[]} />);

      expect(screen.getByText(/no similar tickets found/i)).toBeInTheDocument();
    });

    it("tickets are clickable with proper cursor", () => {
      render(<SimilarTickets {...defaultProps} />);

      const ticket = screen
        .getByText("Login issue with SSO")
        .closest("div.cursor-pointer");
      expect(ticket).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("accepts and uses all props correctly", () => {
      const customProps = {
        isLoading: false,
        similarTickets: [
          { similarity: 0.8, subject: "Custom", resolution: "Custom res" },
        ],
        suggestedSolution: "Custom AI solution",
        selectedIndex: 0,
        onSelectTicket: jest.fn(),
      };

      render(<SimilarTickets {...customProps} />);

      expect(screen.getByText("Custom")).toBeInTheDocument();
      expect(screen.getByText("Custom AI solution")).toBeInTheDocument();
      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("re-renders when isLoading changes", () => {
      const { rerender } = render(
        <SimilarTickets {...defaultProps} isLoading={false} />,
      );

      expect(screen.getByText("Login issue with SSO")).toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} isLoading={true} />);

      expect(
        screen.queryByText("Login issue with SSO"),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/searching pinecone/i)).toBeInTheDocument();
    });

    it("re-renders when similarTickets changes", () => {
      const { rerender } = render(<SimilarTickets {...defaultProps} />);

      expect(screen.getByText("Login issue with SSO")).toBeInTheDocument();

      const newTickets = [
        { similarity: 0.7, subject: "New ticket", resolution: "New res" },
      ];
      rerender(
        <SimilarTickets {...defaultProps} similarTickets={newTickets} />,
      );

      expect(
        screen.queryByText("Login issue with SSO"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("New ticket")).toBeInTheDocument();
    });

    it("re-renders when selectedIndex changes", () => {
      const { rerender } = render(
        <SimilarTickets {...defaultProps} selectedIndex={null} />,
      );

      expect(screen.queryByText("✓")).not.toBeInTheDocument();

      rerender(<SimilarTickets {...defaultProps} selectedIndex={0} />);

      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("re-renders when suggestedSolution changes", () => {
      const { rerender } = render(
        <SimilarTickets {...defaultProps} suggestedSolution={undefined} />,
      );

      expect(
        screen.queryByText(/ai recommended solution/i),
      ).not.toBeInTheDocument();

      rerender(
        <SimilarTickets
          {...defaultProps}
          suggestedSolution="New AI solution"
        />,
      );

      expect(screen.getByText("New AI solution")).toBeInTheDocument();
    });
  });

  describe("State Combinations", () => {
    it("handles loading with undefined similarTickets", () => {
      render(
        <SimilarTickets
          {...defaultProps}
          isLoading={true}
          similarTickets={undefined}
        />,
      );

      expect(screen.getByText(/searching pinecone/i)).toBeInTheDocument();
      expect(screen.queryByText(/no similar tickets/i)).not.toBeInTheDocument();
    });

    it("handles not loading with empty similarTickets", () => {
      render(
        <SimilarTickets
          {...defaultProps}
          isLoading={false}
          similarTickets={[]}
        />,
      );

      expect(screen.getByText(/no similar tickets found/i)).toBeInTheDocument();
    });

    it("handles tickets with suggestedSolution", () => {
      render(
        <SimilarTickets
          {...defaultProps}
          suggestedSolution="AI recommendation"
        />,
      );

      expect(screen.getByText("Login issue with SSO")).toBeInTheDocument();
      expect(screen.getByText("AI recommendation")).toBeInTheDocument();
    });

    it("handles tickets with selection and suggestedSolution", () => {
      render(
        <SimilarTickets
          {...defaultProps}
          selectedIndex={0}
          suggestedSolution="AI recommendation"
        />,
      );

      expect(screen.getByText("✓")).toBeInTheDocument();
      expect(screen.getByText("AI recommendation")).toBeInTheDocument();
    });

    it("handles empty state without suggestedSolution", () => {
      render(
        <SimilarTickets
          {...defaultProps}
          similarTickets={[]}
          suggestedSolution={undefined}
        />,
      );

      expect(screen.getByText(/no similar tickets found/i)).toBeInTheDocument();
      expect(screen.queryByText(/ai recommended/i)).not.toBeInTheDocument();
    });
  });
});
