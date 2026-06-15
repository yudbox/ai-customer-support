// Mock recharts
jest.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

import { render, screen } from "@testing-library/react";

import { TicketsByCategoryChart } from "../TicketsByCategoryChart";

describe("TicketsByCategoryChart", () => {
  it("renders pie chart when data is provided", () => {
    const data = { Shipping: 45, Payment: 30, Technical: 25 };
    render(<TicketsByCategoryChart data={data} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<TicketsByCategoryChart data={{}} />);
    expect(screen.getByText("No data for selected period")).toBeInTheDocument();
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });

  it("renders responsive container", () => {
    const data = { Shipping: 10 };
    render(<TicketsByCategoryChart data={data} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});
