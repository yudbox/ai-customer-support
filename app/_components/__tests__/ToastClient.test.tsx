import { render, screen } from "@testing-library/react";

import { ToastClient } from "../ToastClient";

// Mock ToastProvider
jest.mock("@/lib/contexts", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
}));

describe("ToastClient Component", () => {
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(
        <ToastClient>
          <div>Test content</div>
        </ToastClient>,
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("wraps children with ToastProvider", () => {
      render(
        <ToastClient>
          <div>Child content</div>
        </ToastClient>,
      );

      const provider = screen.getByTestId("toast-provider");
      expect(provider).toBeInTheDocument();
      expect(provider).toContainElement(screen.getByText("Child content"));
    });
  });

  describe("Children Rendering", () => {
    it("renders single child", () => {
      render(
        <ToastClient>
          <p>Single child</p>
        </ToastClient>,
      );

      expect(screen.getByText("Single child")).toBeInTheDocument();
    });

    it("renders multiple children", () => {
      render(
        <ToastClient>
          <div>First child</div>
          <div>Second child</div>
          <div>Third child</div>
        </ToastClient>,
      );

      expect(screen.getByText("First child")).toBeInTheDocument();
      expect(screen.getByText("Second child")).toBeInTheDocument();
      expect(screen.getByText("Third child")).toBeInTheDocument();
    });

    it("renders nested children structure", () => {
      render(
        <ToastClient>
          <div>
            <span>Nested</span>
            <p>Content</p>
          </div>
        </ToastClient>,
      );

      expect(screen.getByText("Nested")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("renders text nodes", () => {
      render(<ToastClient>Plain text content</ToastClient>);

      expect(screen.getByText("Plain text content")).toBeInTheDocument();
    });
  });

  describe("Component Composition", () => {
    it("renders with custom components as children", () => {
      const CustomComponent = () => <div>Custom Component Content</div>;

      render(
        <ToastClient>
          <CustomComponent />
        </ToastClient>,
      );

      expect(screen.getByText("Custom Component Content")).toBeInTheDocument();
    });

    it("renders with fragment children", () => {
      render(
        <ToastClient>
          <>
            <div>Fragment child 1</div>
            <div>Fragment child 2</div>
          </>
        </ToastClient>,
      );

      expect(screen.getByText("Fragment child 1")).toBeInTheDocument();
      expect(screen.getByText("Fragment child 2")).toBeInTheDocument();
    });

    it("renders with conditional children", () => {
      const showExtra = true;

      render(
        <ToastClient>
          <div>Always shown</div>
          {showExtra && <div>Conditionally shown</div>}
        </ToastClient>,
      );

      expect(screen.getByText("Always shown")).toBeInTheDocument();
      expect(screen.getByText("Conditionally shown")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty children", () => {
      render(<ToastClient>{null}</ToastClient>);

      const provider = screen.getByTestId("toast-provider");
      expect(provider).toBeInTheDocument();
    });

    it("handles undefined children", () => {
      render(<ToastClient>{undefined}</ToastClient>);

      const provider = screen.getByTestId("toast-provider");
      expect(provider).toBeInTheDocument();
    });

    it("handles boolean children", () => {
      render(
        <ToastClient>
          {false}
          <div>Visible content</div>
        </ToastClient>,
      );

      expect(screen.getByText("Visible content")).toBeInTheDocument();
    });
  });

  describe("Provider Integration", () => {
    it("ensures ToastProvider receives children prop", () => {
      const testContent = "Test Provider Children";

      render(<ToastClient>{testContent}</ToastClient>);

      const provider = screen.getByTestId("toast-provider");
      expect(provider).toHaveTextContent(testContent);
    });

    it("maintains children order", () => {
      render(
        <ToastClient>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </ToastClient>,
      );

      const provider = screen.getByTestId("toast-provider");
      const text = provider.textContent;

      expect(text?.indexOf("First")).toBeLessThan(text?.indexOf("Second") ?? 0);
      expect(text?.indexOf("Second")).toBeLessThan(text?.indexOf("Third") ?? 0);
    });
  });
});
