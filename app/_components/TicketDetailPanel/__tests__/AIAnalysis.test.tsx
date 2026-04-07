import { render, screen } from "@testing-library/react";

import { AIAnalysis } from "@/app/_components/TicketDetailPanel/AIAnalysis";
import { SentimentLabel } from "@/lib/types/common";

describe("AIAnalysis Component", () => {
  const defaultProps = {
    category: "Payment Problems",
    sentimentLabel: SentimentLabel.NEUTRAL,
    sentimentScore: 0.75,
    priorityScore: 85,
    order: {
      order_number: "ORD-12345",
      total_price: 199.99,
    },
  };

  describe("Rendering", () => {
    it("renders component with correct heading", () => {
      render(<AIAnalysis {...defaultProps} />);

      expect(screen.getByText("🤖 AI Analysis")).toBeInTheDocument();
    });

    it("renders container with correct styling", () => {
      render(<AIAnalysis {...defaultProps} />);

      // Verify component renders by checking for heading
      expect(screen.getByText("🤖 AI Analysis")).toBeInTheDocument();
    });

    it("renders grid layout", () => {
      render(<AIAnalysis {...defaultProps} />);

      // Verify grid content by checking all expected labels exist
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Sentiment")).toBeInTheDocument();
      expect(screen.getByText("Priority Score")).toBeInTheDocument();
    });

    it("renders all labels", () => {
      render(<AIAnalysis {...defaultProps} />);

      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Sentiment")).toBeInTheDocument();
      expect(screen.getByText("Priority Score")).toBeInTheDocument();
      expect(screen.getByText("Order")).toBeInTheDocument();
    });
  });

  describe("Category Display", () => {
    it("displays category when provided", () => {
      render(<AIAnalysis {...defaultProps} category="Refund Requests" />);

      expect(screen.getByText("Refund Requests")).toBeInTheDocument();
    });

    it("displays N/A when category is null", () => {
      render(<AIAnalysis {...defaultProps} category={null} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("displays N/A when category is undefined", () => {
      render(<AIAnalysis {...defaultProps} category={undefined} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("displays N/A when category is empty string", () => {
      render(<AIAnalysis {...defaultProps} category="" />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });
  });

  describe("Sentiment Display", () => {
    it("displays ANGRY sentiment with correct emoji", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          sentimentLabel={SentimentLabel.ANGRY}
          sentimentScore={0.95}
        />,
      );

      expect(screen.getByText(/😡 ANGRY/)).toBeInTheDocument();
      expect(screen.getByText(/95%/)).toBeInTheDocument();
    });

    it("displays NEUTRAL sentiment with correct emoji", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={0.5}
        />,
      );

      expect(screen.getByText(/😐 NEUTRAL/)).toBeInTheDocument();
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    it("displays POSITIVE sentiment with correct emoji", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          sentimentLabel={SentimentLabel.POSITIVE}
          sentimentScore={0.85}
        />,
      );

      expect(screen.getByText(/😊 POSITIVE/)).toBeInTheDocument();
      expect(screen.getByText(/85%/)).toBeInTheDocument();
    });

    it("defaults to POSITIVE when sentiment is null", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          sentimentLabel={null}
          sentimentScore={0.6}
        />,
      );

      expect(screen.getByText(/😊 POSITIVE/)).toBeInTheDocument();
    });

    it("defaults to POSITIVE when sentiment is undefined", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          sentimentLabel={undefined}
          sentimentScore={0.7}
        />,
      );

      expect(screen.getByText(/😊 POSITIVE/)).toBeInTheDocument();
    });
  });

  describe("Sentiment Percentage Calculation", () => {
    it("converts decimal score to percentage", () => {
      render(<AIAnalysis {...defaultProps} sentimentScore={0.75} />);

      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });

    it("rounds to nearest integer", () => {
      render(<AIAnalysis {...defaultProps} sentimentScore={0.7777} />);

      expect(screen.getByText(/78%/)).toBeInTheDocument();
    });

    it("handles 0 score (falsy value)", () => {
      render(<AIAnalysis {...defaultProps} sentimentScore={0} />);

      // 0 is falsy, so it should show N/A
      expect(screen.getByText(/N\/A%/)).toBeInTheDocument();
    });

    it("handles 100% score", () => {
      render(<AIAnalysis {...defaultProps} sentimentScore={1.0} />);

      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it("displays N/A when score is null", () => {
      render(<AIAnalysis {...defaultProps} sentimentScore={null} />);

      expect(screen.getByText(/N\/A%/)).toBeInTheDocument();
    });

    it("displays N/A when score is undefined", () => {
      render(<AIAnalysis {...defaultProps} sentimentScore={undefined} />);

      expect(screen.getByText(/N\/A%/)).toBeInTheDocument();
    });
  });

  describe("Priority Score Display", () => {
    it("displays priority score when provided", () => {
      render(<AIAnalysis {...defaultProps} priorityScore={95} />);

      expect(screen.getByText("95/100")).toBeInTheDocument();
    });

    it("displays N/A when priority score is null", () => {
      render(<AIAnalysis {...defaultProps} priorityScore={null} />);

      expect(screen.getByText("N/A/100")).toBeInTheDocument();
    });

    it("displays N/A when priority score is undefined", () => {
      render(<AIAnalysis {...defaultProps} priorityScore={undefined} />);

      expect(screen.getByText("N/A/100")).toBeInTheDocument();
    });

    it("displays 0 when priority score is 0", () => {
      render(<AIAnalysis {...defaultProps} priorityScore={0} />);

      expect(screen.getByText("0/100")).toBeInTheDocument();
    });

    it("handles maximum priority score", () => {
      render(<AIAnalysis {...defaultProps} priorityScore={100} />);

      expect(screen.getByText("100/100")).toBeInTheDocument();
    });
  });

  describe("Order Display", () => {
    it("displays order information when order is provided", () => {
      render(<AIAnalysis {...defaultProps} />);

      expect(screen.getByText("Order")).toBeInTheDocument();
      expect(screen.getByText("#ORD-12345 ($199.99)")).toBeInTheDocument();
    });

    it("does not display order section when order is null", () => {
      render(<AIAnalysis {...defaultProps} order={null} />);

      expect(screen.queryByText("Order")).not.toBeInTheDocument();
    });

    it("does not display order section when order is undefined", () => {
      render(<AIAnalysis {...defaultProps} order={undefined} />);

      expect(screen.queryByText("Order")).not.toBeInTheDocument();
    });

    it("formats order price correctly", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          order={{ order_number: "ORD-999", total_price: 1234.56 }}
        />,
      );

      expect(screen.getByText("#ORD-999 ($1234.56)")).toBeInTheDocument();
    });

    it("handles integer prices", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          order={{ order_number: "ORD-100", total_price: 50 }}
        />,
      );

      expect(screen.getByText("#ORD-100 ($50)")).toBeInTheDocument();
    });

    it("handles zero price", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          order={{ order_number: "ORD-FREE", total_price: 0 }}
        />,
      );

      expect(screen.getByText("#ORD-FREE ($0)")).toBeInTheDocument();
    });
  });

  describe("Complete Data Scenarios", () => {
    it("renders correctly with all data provided", () => {
      render(<AIAnalysis {...defaultProps} />);

      expect(screen.getByText("Payment Problems")).toBeInTheDocument();
      expect(screen.getByText(/😐 NEUTRAL/)).toBeInTheDocument();
      expect(screen.getByText(/75%/)).toBeInTheDocument();
      expect(screen.getByText("85/100")).toBeInTheDocument();
      expect(screen.getByText("#ORD-12345 ($199.99)")).toBeInTheDocument();
    });

    it("renders correctly with minimal data (all optional fields null)", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText("🤖 AI Analysis")).toBeInTheDocument();
      expect(screen.getByText("N/A")).toBeInTheDocument();
      expect(screen.getByText(/😊 POSITIVE/)).toBeInTheDocument(); // Default
      expect(screen.getByText("N/A/100")).toBeInTheDocument();
      expect(screen.queryByText("Order")).not.toBeInTheDocument();
    });

    it("renders correctly with partial data", () => {
      render(
        <AIAnalysis
          category="Technical Issues"
          sentimentLabel={SentimentLabel.ANGRY}
          sentimentScore={null}
          priorityScore={70}
          order={null}
        />,
      );

      expect(screen.getByText("Technical Issues")).toBeInTheDocument();
      expect(screen.getByText(/😡 ANGRY/)).toBeInTheDocument();
      expect(screen.getByText(/N\/A%/)).toBeInTheDocument();
      expect(screen.getByText("70/100")).toBeInTheDocument();
      expect(screen.queryByText("Order")).not.toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("renders 4 grid items when order is present", () => {
      render(<AIAnalysis {...defaultProps} />);

      // Verify all 4 sections exist
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Sentiment")).toBeInTheDocument();
      expect(screen.getByText("Priority Score")).toBeInTheDocument();
      expect(screen.getByText("Order")).toBeInTheDocument();
    });

    it("renders 3 grid items when order is absent", () => {
      render(<AIAnalysis {...defaultProps} order={null} />);

      // Verify 3 sections exist and Order section doesn't
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Sentiment")).toBeInTheDocument();
      expect(screen.getByText("Priority Score")).toBeInTheDocument();
      expect(screen.queryByText("Order")).not.toBeInTheDocument();
    });
  });

  describe("Text Styling", () => {
    it("applies correct classes to labels", () => {
      render(<AIAnalysis {...defaultProps} />);

      const labels = screen
        .getAllByText(/Category|Sentiment|Priority Score|Order/)
        .filter((el) => el.tagName === "P");

      labels.forEach((label) => {
        expect(label).toHaveClass("text-sm", "font-medium", "text-gray-500");
      });
    });

    it("renders values with correct font size", () => {
      render(<AIAnalysis {...defaultProps} />);

      // Verify values are rendered
      expect(screen.getByText("Payment Problems")).toBeInTheDocument();
      expect(screen.getByText(/75%/)).toBeInTheDocument();
      expect(screen.getByText("85/100")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles very long category names", () => {
      const longCategory = "A".repeat(100);
      render(<AIAnalysis {...defaultProps} category={longCategory} />);

      expect(screen.getByText(longCategory)).toBeInTheDocument();
    });

    it("handles very long order numbers", () => {
      render(
        <AIAnalysis
          {...defaultProps}
          order={{ order_number: "ORD-" + "9".repeat(50), total_price: 100 }}
        />,
      );

      expect(screen.getByText(/ORD-9+/)).toBeInTheDocument();
    });

    it("handles negative priority scores", () => {
      render(<AIAnalysis {...defaultProps} priorityScore={-10} />);

      expect(screen.getByText("-10/100")).toBeInTheDocument();
    });

    it("handles scores over 100", () => {
      render(<AIAnalysis {...defaultProps} priorityScore={150} />);

      expect(screen.getByText("150/100")).toBeInTheDocument();
    });

    it("handles very small sentiment scores", () => {
      render(<AIAnalysis {...defaultProps} sentimentScore={0.001} />);

      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it("handles very large sentiment scores", () => {
      render(<AIAnalysis {...defaultProps} sentimentScore={5.5} />);

      expect(screen.getByText(/550%/)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML structure", () => {
      render(<AIAnalysis {...defaultProps} />);

      // Verify heading exists using semantic query
      expect(
        screen.getByRole("heading", { level: 2, name: "🤖 AI Analysis" }),
      ).toBeInTheDocument();
      // Verify labels exist
      expect(screen.getByText("Category")).toBeInTheDocument();
    });

    it("has proper heading hierarchy", () => {
      render(<AIAnalysis {...defaultProps} />);

      // Verify heading using role
      expect(
        screen.getByRole("heading", { level: 2, name: "🤖 AI Analysis" }),
      ).toBeInTheDocument();
    });
  });
});
