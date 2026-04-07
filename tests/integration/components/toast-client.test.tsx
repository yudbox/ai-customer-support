/**
 * Integration tests for ToastClient component
 *
 * Тестирует обертку ToastProvider для клиентских компонентов.
 */

import { render, screen } from "@testing-library/react";

import { ToastClient } from "@/app/_components/ToastClient";

// Mock ToastProvider
jest.mock("@/lib/contexts", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
}));

describe("ToastClient Integration Tests", () => {
  describe("Rendering", () => {
    it("should render children", () => {
      render(
        <ToastClient>
          <div data-testid="test-child">Test Content</div>
        </ToastClient>,
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render ToastProvider", () => {
      render(
        <ToastClient>
          <div>Child</div>
        </ToastClient>,
      );

      expect(screen.getByTestId("toast-provider")).toBeInTheDocument();
    });

    it("should wrap children with ToastProvider", () => {
      render(
        <ToastClient>
          <div data-testid="child">Child Content</div>
        </ToastClient>,
      );

      const toastProvider = screen.getByTestId("toast-provider");
      const child = screen.getByTestId("child");

      expect(toastProvider).toContainElement(child);
    });
  });

  describe("Multiple Children", () => {
    it("should render multiple children", () => {
      render(
        <ToastClient>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <div data-testid="child-3">Third Child</div>
        </ToastClient>,
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });

    it("should render nested component trees", () => {
      render(
        <ToastClient>
          <div data-testid="parent">
            <div data-testid="child">
              <span data-testid="grandchild">Nested Content</span>
            </div>
          </div>
        </ToastClient>,
      );

      expect(screen.getByTestId("parent")).toBeInTheDocument();
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByTestId("grandchild")).toBeInTheDocument();
    });

    it("should preserve component hierarchy", () => {
      render(
        <ToastClient>
          <div data-testid="wrapper">
            <button>Click me</button>
            <input placeholder="Type here" />
            <p>Some text</p>
          </div>
        </ToastClient>,
      );

      const wrapper = screen.getByTestId("wrapper");
      expect(wrapper).toContainElement(screen.getByRole("button"));
      expect(wrapper).toContainElement(
        screen.getByPlaceholderText("Type here"),
      );
      expect(wrapper).toContainElement(screen.getByText("Some text"));
    });
  });

  describe("Edge Cases", () => {
    it("should render with single text node as child", () => {
      render(<ToastClient>Plain text content</ToastClient>);

      expect(screen.getByText("Plain text content")).toBeInTheDocument();
    });

    it("should render with fragment children", () => {
      render(
        <ToastClient>
          <>
            <div data-testid="fragment-child-1">First</div>
            <div data-testid="fragment-child-2">Second</div>
          </>
        </ToastClient>,
      );

      expect(screen.getByTestId("fragment-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("fragment-child-2")).toBeInTheDocument();
    });

    it("should render with conditional children", () => {
      const showContent = true;

      render(
        <ToastClient>
          {showContent && (
            <div data-testid="conditional">Conditional Content</div>
          )}
        </ToastClient>,
      );

      expect(screen.getByTestId("conditional")).toBeInTheDocument();
    });

    it("should render with null children gracefully", () => {
      render(
        <ToastClient>
          {null}
          <div data-testid="visible">Visible Content</div>
          {undefined}
        </ToastClient>,
      );

      expect(screen.getByTestId("visible")).toBeInTheDocument();
    });
  });

  describe("Provider Integration", () => {
    it("should make ToastProvider available to all children", () => {
      render(
        <ToastClient>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </ToastClient>,
      );

      const toastProvider = screen.getByTestId("toast-provider");

      expect(toastProvider).toContainElement(screen.getByTestId("child-1"));
      expect(toastProvider).toContainElement(screen.getByTestId("child-2"));
    });

    it("should maintain single ToastProvider instance", () => {
      render(
        <ToastClient>
          <div>Multiple</div>
          <div>Children</div>
        </ToastClient>,
      );

      const toastProviders = screen.getAllByTestId("toast-provider");
      expect(toastProviders).toHaveLength(1);
    });
  });
});
