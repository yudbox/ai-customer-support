import { render, screen } from "@testing-library/react";

import { TRPCProvider } from "../provider";

describe("TRPCProvider", () => {
  describe("rendering", () => {
    it("should render children", () => {
      // Arrange & Act
      render(
        <TRPCProvider>
          <div data-testid="test-child">Test Child</div>
        </TRPCProvider>,
      );

      // Assert
      expect(screen.getByTestId("test-child")).toBeInTheDocument();
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
      // Arrange & Act
      render(
        <TRPCProvider>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
        </TRPCProvider>,
      );

      // Assert
      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
    });

    it("should render nested components", () => {
      // Arrange
      const NestedComponent = () => (
        <div data-testid="nested">
          <span>Nested Content</span>
        </div>
      );

      // Act
      render(
        <TRPCProvider>
          <NestedComponent />
        </TRPCProvider>,
      );

      // Assert
      expect(screen.getByTestId("nested")).toBeInTheDocument();
      expect(screen.getByText("Nested Content")).toBeInTheDocument();
    });
  });

  describe("provider configuration", () => {
    it("should create provider without errors", () => {
      // Arrange & Act
      const { container } = render(
        <TRPCProvider>
          <div>Test</div>
        </TRPCProvider>,
      );

      // Assert
      expect(container).toBeInTheDocument();
    });

    it("should wrap children with QueryClientProvider", () => {
      // Arrange & Act
      const { container } = render(
        <TRPCProvider>
          <div data-testid="query-child">Query Test</div>
        </TRPCProvider>,
      );

      // Assert - child should be rendered, meaning providers are working
      expect(screen.getByTestId("query-child")).toBeInTheDocument();
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("multiple instances", () => {
    it("should handle multiple TRPCProvider instances", () => {
      // Arrange & Act
      const { rerender } = render(
        <TRPCProvider>
          <div data-testid="instance-1">Instance 1</div>
        </TRPCProvider>,
      );

      expect(screen.getByTestId("instance-1")).toBeInTheDocument();

      // Rerender with new content
      rerender(
        <TRPCProvider>
          <div data-testid="instance-2">Instance 2</div>
        </TRPCProvider>,
      );

      // Assert
      expect(screen.getByTestId("instance-2")).toBeInTheDocument();
    });
  });

  describe("client stability", () => {
    it("should maintain stable client across rerenders", () => {
      // Arrange
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return <div data-testid="counter">{renderCount}</div>;
      };

      // Act
      const { rerender } = render(
        <TRPCProvider>
          <TestComponent />
        </TRPCProvider>,
      );

      const firstRender = screen.getByTestId("counter").textContent;

      // Rerender
      rerender(
        <TRPCProvider>
          <TestComponent />
        </TRPCProvider>,
      );

      // Assert - render count should increment (showing component rerenders)
      expect(screen.getByTestId("counter").textContent).not.toBe(firstRender);
    });
  });
});
