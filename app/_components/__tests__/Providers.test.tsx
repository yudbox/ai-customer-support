import { render, screen } from "@testing-library/react";

import { Providers } from "../Providers";

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

describe("Providers Component", () => {
  it("renders without crashing", () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <Providers>
        <div data-testid="child-component">Child Component</div>
      </Providers>,
    );

    expect(screen.getByTestId("child-component")).toBeInTheDocument();
    expect(screen.getByText("Child Component")).toBeInTheDocument();
  });

  it("wraps children with TRPCProvider", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );

    expect(screen.getByTestId("trpc-provider")).toBeInTheDocument();
  });

  it("wraps children with ToastProvider", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );

    expect(screen.getByTestId("toast-provider")).toBeInTheDocument();
  });

  it("maintains provider nesting order (TRPCProvider > ToastProvider)", () => {
    render(
      <Providers>
        <div data-testid="content">Content</div>
      </Providers>,
    );

    const trpcProvider = screen.getByTestId("trpc-provider");
    const toastProvider = screen.getByTestId("toast-provider");
    const content = screen.getByTestId("content");

    // ToastProvider should be inside TRPCProvider
    expect(trpcProvider).toContainElement(toastProvider);
    // Content should be inside ToastProvider
    expect(toastProvider).toContainElement(content);
  });

  it("renders multiple children", () => {
    render(
      <Providers>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </Providers>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("handles empty children", () => {
    const { container } = render(<Providers>{null}</Providers>);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("handles string children", () => {
    render(<Providers>Plain text content</Providers>);

    expect(screen.getByText("Plain text content")).toBeInTheDocument();
  });

  it("handles complex nested children", () => {
    render(
      <Providers>
        <div>
          <span>Nested</span>
          <div>
            <p>Deep nested</p>
          </div>
        </div>
      </Providers>,
    );

    expect(screen.getByText("Nested")).toBeInTheDocument();
    expect(screen.getByText("Deep nested")).toBeInTheDocument();
  });
});
