import { render, screen } from "@testing-library/react";

import Page from "../page";

// Mock ManagerDashboardPage
jest.mock("../../_components/ManagerDashboardPage", () => ({
  ManagerDashboardPage: () => (
    <div data-testid="manager-dashboard">Manager Dashboard Page</div>
  ),
}));

describe("Manager Page Component", () => {
  it("renders without crashing", () => {
    render(<Page />);

    expect(screen.getByTestId("manager-dashboard")).toBeInTheDocument();
  });

  it("renders ManagerDashboardPage component", () => {
    render(<Page />);

    expect(screen.getByText("Manager Dashboard Page")).toBeInTheDocument();
  });
});
