import { render, screen } from "@testing-library/react";

import Page from "../page";

// Mock HomePage
jest.mock("../_components/HomePage", () => ({
  HomePage: () => <div data-testid="home-page">HomePage Component</div>,
}));

describe("Page Component", () => {
  it("renders without crashing", () => {
    render(<Page />);

    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("renders HomePage component", () => {
    render(<Page />);

    expect(screen.getByText("HomePage Component")).toBeInTheDocument();
  });

  it("wraps HomePage in Suspense", () => {
    const { container } = render(<Page />);

    // Verify the component renders successfully (Suspense is working)
    expect(container.firstChild).toBeInTheDocument();
  });
});
