/**
 * Integration tests for AIAnalysis component
 *
 * Тестирует отображение AI анализа тикета: категория, настроение, приоритет, заказ.
 */

import { render, screen } from "@testing-library/react";

import { AIAnalysis } from "@/app/_components/TicketDetailPanel/AIAnalysis";
import { SentimentLabel } from "@/lib/types/common";

describe("AIAnalysis Integration Tests", () => {
  describe("Initial Rendering", () => {
    it("should render AIAnalysis component", () => {
      render(
        <AIAnalysis
          category="Account Issues"
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={0.5}
          priorityScore={50}
          order={null}
        />,
      );

      expect(screen.getByText("🤖 AI Analysis")).toBeInTheDocument();
    });

    it("should render header with emoji", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(
        screen.getByRole("heading", { name: /AI Analysis/i }),
      ).toBeInTheDocument();
    });

    it("should render all field labels", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Sentiment")).toBeInTheDocument();
      expect(screen.getByText("Priority Score")).toBeInTheDocument();
    });
  });

  describe("Category Display", () => {
    it("should display category when provided", () => {
      render(
        <AIAnalysis
          category="Account Issues"
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText("Account Issues")).toBeInTheDocument();
    });

    it("should display different categories", () => {
      const { rerender } = render(
        <AIAnalysis
          category="Payment Problems"
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText("Payment Problems")).toBeInTheDocument();

      rerender(
        <AIAnalysis
          category="Shipping Delays"
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText("Shipping Delays")).toBeInTheDocument();
    });

    it("should display N/A when category is null", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      const categoryLabels = screen.getAllByText("N/A");
      expect(categoryLabels.length).toBeGreaterThan(0);
    });

    it("should display N/A when category is undefined", () => {
      render(
        <AIAnalysis
          category={undefined}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      const categoryLabels = screen.getAllByText("N/A");
      expect(categoryLabels.length).toBeGreaterThan(0);
    });

    it("should display N/A when category is empty string", () => {
      render(
        <AIAnalysis
          category=""
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      const categoryLabels = screen.getAllByText("N/A");
      expect(categoryLabels.length).toBeGreaterThan(0);
    });
  });

  describe("Sentiment Display", () => {
    it("should display ANGRY sentiment with emoji", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.ANGRY}
          sentimentScore={0.85}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/😡 ANGRY/i)).toBeInTheDocument();
    });

    it("should display NEUTRAL sentiment with emoji", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={0.5}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/😐 NEUTRAL/i)).toBeInTheDocument();
    });

    it("should display POSITIVE sentiment with emoji", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.POSITIVE}
          sentimentScore={0.95}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/😊 POSITIVE/i)).toBeInTheDocument();
    });

    it("should display sentiment percentage", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.ANGRY}
          sentimentScore={0.85}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/85%/i)).toBeInTheDocument();
    });

    it("should calculate percentage correctly for different scores", () => {
      const { rerender } = render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={0.42}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/42%/i)).toBeInTheDocument();

      rerender(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.POSITIVE}
          sentimentScore={0.99}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/99%/i)).toBeInTheDocument();
    });

    it("should round percentage to nearest integer", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={0.456}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/46%/i)).toBeInTheDocument();
    });

    it("should display N/A for sentiment percentage when score is null", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/😐 NEUTRAL \(N\/A%\)/i)).toBeInTheDocument();
    });

    it("should display N/A for sentiment percentage when score is undefined", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.POSITIVE}
          sentimentScore={undefined}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/😊 POSITIVE \(N\/A%\)/i)).toBeInTheDocument();
    });

    it("should default to POSITIVE when sentiment label is null", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={0.75}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/😊 POSITIVE/i)).toBeInTheDocument();
    });

    it("should default to POSITIVE when sentiment label is undefined", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={undefined}
          sentimentScore={0.5}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/😊 POSITIVE/i)).toBeInTheDocument();
    });
  });

  describe("Priority Score Display", () => {
    it("should display priority score when provided", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={75}
          order={null}
        />,
      );

      expect(screen.getByText("75/100")).toBeInTheDocument();
    });

    it("should display different priority scores", () => {
      const { rerender } = render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={10}
          order={null}
        />,
      );

      expect(screen.getByText("10/100")).toBeInTheDocument();

      rerender(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={100}
          order={null}
        />,
      );

      expect(screen.getByText("100/100")).toBeInTheDocument();
    });

    it("should display zero priority score", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={0}
          order={null}
        />,
      );

      expect(screen.getByText("0/100")).toBeInTheDocument();
    });

    it("should display N/A when priority score is null", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText("N/A/100")).toBeInTheDocument();
    });

    it("should display N/A when priority score is undefined", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={undefined}
          order={null}
        />,
      );

      expect(screen.getByText("N/A/100")).toBeInTheDocument();
    });
  });

  describe("Order Display", () => {
    it("should display order when provided", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-12345",
            total_price: 99.99,
          }}
        />,
      );

      expect(screen.getByText("Order")).toBeInTheDocument();
      expect(screen.getByText(/#ORD-12345 \(\$99.99\)/i)).toBeInTheDocument();
    });

    it("should display different order numbers", () => {
      const { rerender } = render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-11111",
            total_price: 50.0,
          }}
        />,
      );

      expect(screen.getByText(/#ORD-11111 \(\$50\)/i)).toBeInTheDocument();

      rerender(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-99999",
            total_price: 199.99,
          }}
        />,
      );

      expect(screen.getByText(/#ORD-99999 \(\$199.99\)/i)).toBeInTheDocument();
    });

    it("should display order with decimal prices", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-56789",
            total_price: 123.45,
          }}
        />,
      );

      expect(screen.getByText(/#ORD-56789 \(\$123.45\)/i)).toBeInTheDocument();
    });

    it("should display order with integer prices", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-00001",
            total_price: 100,
          }}
        />,
      );

      expect(screen.getByText(/#ORD-00001 \(\$100\)/i)).toBeInTheDocument();
    });

    it("should not render order section when order is null", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.queryByText("Order")).not.toBeInTheDocument();
    });

    it("should not render order section when order is undefined", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={undefined}
        />,
      );

      expect(screen.queryByText("Order")).not.toBeInTheDocument();
    });
  });

  describe("Complete Data Scenarios", () => {
    it("should display all fields with complete data", () => {
      render(
        <AIAnalysis
          category="Payment Problems"
          sentimentLabel={SentimentLabel.ANGRY}
          sentimentScore={0.92}
          priorityScore={85}
          order={{
            order_number: "ORD-FULL-123",
            total_price: 249.99,
          }}
        />,
      );

      expect(screen.getByText("Payment Problems")).toBeInTheDocument();
      expect(screen.getByText(/😡 ANGRY/i)).toBeInTheDocument();
      expect(screen.getByText(/92%/i)).toBeInTheDocument();
      expect(screen.getByText("85/100")).toBeInTheDocument();
      expect(
        screen.getByText(/#ORD-FULL-123 \(\$249.99\)/i),
      ).toBeInTheDocument();
    });

    it("should display complete neutral sentiment scenario", () => {
      render(
        <AIAnalysis
          category="Technical Issues"
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={0.55}
          priorityScore={60}
          order={{
            order_number: "ORD-NEUTRAL-456",
            total_price: 75.5,
          }}
        />,
      );

      expect(screen.getByText("Technical Issues")).toBeInTheDocument();
      expect(screen.getByText(/😐 NEUTRAL/i)).toBeInTheDocument();
      expect(screen.getByText(/55%/i)).toBeInTheDocument();
      expect(screen.getByText("60/100")).toBeInTheDocument();
      expect(
        screen.getByText(/#ORD-NEUTRAL-456 \(\$75.5\)/i),
      ).toBeInTheDocument();
    });

    it("should display complete positive sentiment scenario", () => {
      render(
        <AIAnalysis
          category="Refund Requests"
          sentimentLabel={SentimentLabel.POSITIVE}
          sentimentScore={0.88}
          priorityScore={45}
          order={{
            order_number: "ORD-HAPPY-789",
            total_price: 150.0,
          }}
        />,
      );

      expect(screen.getByText("Refund Requests")).toBeInTheDocument();
      expect(screen.getByText(/😊 POSITIVE/i)).toBeInTheDocument();
      expect(screen.getByText(/88%/i)).toBeInTheDocument();
      expect(screen.getByText("45/100")).toBeInTheDocument();
      expect(screen.getByText(/#ORD-HAPPY-789 \(\$150\)/i)).toBeInTheDocument();
    });

    it("should handle high priority critical ticket", () => {
      render(
        <AIAnalysis
          category="Account Issues"
          sentimentLabel={SentimentLabel.ANGRY}
          sentimentScore={0.98}
          priorityScore={100}
          order={{
            order_number: "ORD-CRITICAL-001",
            total_price: 999.99,
          }}
        />,
      );

      expect(screen.getByText("Account Issues")).toBeInTheDocument();
      expect(screen.getByText(/😡 ANGRY/i)).toBeInTheDocument();
      expect(screen.getByText(/98%/i)).toBeInTheDocument();
      expect(screen.getByText("100/100")).toBeInTheDocument();
      expect(
        screen.getByText(/#ORD-CRITICAL-001 \(\$999.99\)/i),
      ).toBeInTheDocument();
    });

    it("should handle low priority positive ticket", () => {
      render(
        <AIAnalysis
          category="Product Quality"
          sentimentLabel={SentimentLabel.POSITIVE}
          sentimentScore={0.95}
          priorityScore={15}
          order={{
            order_number: "ORD-LOW-999",
            total_price: 25.0,
          }}
        />,
      );

      expect(screen.getByText("Product Quality")).toBeInTheDocument();
      expect(screen.getByText(/😊 POSITIVE/i)).toBeInTheDocument();
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
      expect(screen.getByText("15/100")).toBeInTheDocument();
      expect(screen.getByText(/#ORD-LOW-999 \(\$25\)/i)).toBeInTheDocument();
    });
  });

  describe("Partial Data Scenarios", () => {
    it("should handle only category provided", () => {
      render(
        <AIAnalysis
          category="Shipping Delays"
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText("Shipping Delays")).toBeInTheDocument();
      expect(screen.getByText(/😊 POSITIVE/i)).toBeInTheDocument();
      expect(screen.getByText("N/A/100")).toBeInTheDocument();
    });

    it("should handle only sentiment provided", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.ANGRY}
          sentimentScore={0.7}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
      expect(screen.getByText(/😡 ANGRY/i)).toBeInTheDocument();
      expect(screen.getByText(/70%/i)).toBeInTheDocument();
      expect(screen.getByText("N/A/100")).toBeInTheDocument();
    });

    it("should handle only priority score provided", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={80}
          order={null}
        />,
      );

      expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
      expect(screen.getByText("80/100")).toBeInTheDocument();
    });

    it("should handle category and order without sentiment", () => {
      render(
        <AIAnalysis
          category="Account Issues"
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-PARTIAL-123",
            total_price: 50.0,
          }}
        />,
      );

      expect(screen.getByText("Account Issues")).toBeInTheDocument();
      expect(
        screen.getByText(/#ORD-PARTIAL-123 \(\$50\)/i),
      ).toBeInTheDocument();
      expect(screen.getByText("N/A/100")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle all null values", () => {
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
      expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
    });

    it("should handle all undefined values", () => {
      render(
        <AIAnalysis
          category={undefined}
          sentimentLabel={undefined}
          sentimentScore={undefined}
          priorityScore={undefined}
          order={undefined}
        />,
      );

      expect(screen.getByText("🤖 AI Analysis")).toBeInTheDocument();
      expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
    });

    it("should handle sentiment score of 0", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={0}
          priorityScore={null}
          order={null}
        />,
      );

      // Score of 0 is falsy, so component returns N/A
      expect(screen.getByText(/😐 NEUTRAL \(N\/A%\)/i)).toBeInTheDocument();
    });

    it("should handle sentiment score of 1 (100%)", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={SentimentLabel.POSITIVE}
          sentimentScore={1}
          priorityScore={null}
          order={null}
        />,
      );

      expect(screen.getByText(/😊 POSITIVE \(100%\)/i)).toBeInTheDocument();
    });

    it("should handle very long category names", () => {
      render(
        <AIAnalysis
          category="Very Long Category Name That Might Cause Layout Issues"
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      expect(
        screen.getByText(
          "Very Long Category Name That Might Cause Layout Issues",
        ),
      ).toBeInTheDocument();
    });

    it("should handle very long order numbers", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-VERY-LONG-ORDER-NUMBER-12345678",
            total_price: 100,
          }}
        />,
      );

      expect(
        screen.getByText(/#ORD-VERY-LONG-ORDER-NUMBER-12345678 \(\$100\)/i),
      ).toBeInTheDocument();
    });

    it("should handle very large order prices", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-EXPENSIVE",
            total_price: 99999.99,
          }}
        />,
      );

      expect(
        screen.getByText(/#ORD-EXPENSIVE \(\$99999.99\)/i),
      ).toBeInTheDocument();
    });

    it("should handle very small order prices", () => {
      render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={{
            order_number: "ORD-CHEAP",
            total_price: 0.01,
          }}
        />,
      );

      expect(screen.getByText(/#ORD-CHEAP \(\$0.01\)/i)).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render with proper container classes", () => {
      const { container } = render(
        <AIAnalysis
          category={null}
          sentimentLabel={null}
          sentimentScore={null}
          priorityScore={null}
          order={null}
        />,
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass("bg-white", "rounded-lg", "shadow", "p-6");
    });

    it("should use grid layout for fields", () => {
      render(
        <AIAnalysis
          category="Test"
          sentimentLabel={SentimentLabel.NEUTRAL}
          sentimentScore={0.5}
          priorityScore={50}
          order={null}
        />,
      );

      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Sentiment")).toBeInTheDocument();
      expect(screen.getByText("Priority Score")).toBeInTheDocument();
    });
  });
});
