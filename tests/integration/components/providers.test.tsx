/**
 * Integration tests for Providers component
 *
 * Тестирует правильную инициализацию и вложенность провайдеров (TRPC, Toast).
 */

import { render, screen } from "@testing-library/react";

import { Providers } from "@/app/_components/Providers";

// Mock TRPCProvider
jest.mock("@/lib/trpc/provider", () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="trpc-provider">{children}</div>
  ),
}));

// Mock ToastProvider
jest.mock("@/lib/contexts", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
}));

describe("Providers Integration Tests", () => {
  describe("Rendering", () => {
    it("should render children", () => {
      render(
        <Providers>
          <div data-testid="test-child">Test Content</div>
        </Providers>,
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render TRPCProvider", () => {
      render(
        <Providers>
          <div>Child</div>
        </Providers>,
      );

      expect(screen.getByTestId("trpc-provider")).toBeInTheDocument();
    });

    it("should render ToastProvider", () => {
      render(
        <Providers>
          <div>Child</div>
        </Providers>,
      );

      expect(screen.getByTestId("toast-provider")).toBeInTheDocument();
    });
  });

  describe("Provider Nesting", () => {
    it("should nest providers in correct order: TRPC > Toast > children", () => {
      render(
        <Providers>
          <div data-testid="child">Child</div>
        </Providers>,
      );

      const trpcProvider = screen.getByTestId("trpc-provider");
      const toastProvider = screen.getByTestId("toast-provider");
      const child = screen.getByTestId("child");

      // TRPC should contain Toast
      expect(trpcProvider).toContainElement(toastProvider);

      // Toast should contain child
      expect(toastProvider).toContainElement(child);

      // TRPC should be the outermost
      expect(trpcProvider).toContainElement(child);
    });
  });

  describe("Multiple Children", () => {
    it("should render multiple children", () => {
      render(
        <Providers>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <div data-testid="child-3">Third Child</div>
        </Providers>,
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });

    it("should render nested component trees", () => {
      render(
        <Providers>
          <div data-testid="parent">
            <div data-testid="child">
              <span data-testid="grandchild">Nested Content</span>
            </div>
          </div>
        </Providers>,
      );

      expect(screen.getByTestId("parent")).toBeInTheDocument();
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByTestId("grandchild")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      render(<Providers>{null}</Providers>);

      expect(screen.getByTestId("trpc-provider")).toBeInTheDocument();
      expect(screen.getByTestId("toast-provider")).toBeInTheDocument();
    });

    it("should handle text-only children", () => {
      render(<Providers>Plain text content</Providers>);

      expect(screen.getByText("Plain text content")).toBeInTheDocument();
    });

    it("should handle fragment children", () => {
      render(
        <Providers>
          <>
            <div data-testid="fragment-child-1">First</div>
            <div data-testid="fragment-child-2">Second</div>
          </>
        </Providers>,
      );

      expect(screen.getByTestId("fragment-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("fragment-child-2")).toBeInTheDocument();
    });
  });
});
