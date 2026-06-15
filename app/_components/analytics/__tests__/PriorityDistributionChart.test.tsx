// Mock recharts
jest.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Cell: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { render, screen } from "@testing-library/react";

import { PriorityDistributionChart } from "../PriorityDistributionChart";

const emptyData = { low: 0, medium: 0, high: 0, critical: 0, unset: 0 };
const filledData = { low: 5, medium: 10, high: 8, critical: 2, unset: 1 };

describe("PriorityDistributionChart", () => {
  it("renders bar chart when data is present", () => {
    render(<PriorityDistributionChart data={filledData} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("shows empty state when all values are 0", () => {
    render(<PriorityDistributionChart data={emptyData} />);
    expect(screen.getByText("No data for this period")).toBeInTheDocument();
  });

  it("does not render bar chart in empty state", () => {
    render(<PriorityDistributionChart data={emptyData} />);
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });
});
