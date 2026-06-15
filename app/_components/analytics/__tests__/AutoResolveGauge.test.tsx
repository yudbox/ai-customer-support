// Mock recharts
jest.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { render, screen } from "@testing-library/react";

import { AutoResolveGauge } from "../AutoResolveGauge";

describe("AutoResolveGauge", () => {
  it("renders pie chart when data is present", () => {
    render(<AutoResolveGauge autoResolveRate={75} hitlRate={25} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("shows empty state when both rates are 0", () => {
    render(<AutoResolveGauge autoResolveRate={0} hitlRate={0} />);
    expect(screen.getByText("No data for this period")).toBeInTheDocument();
  });

  it("renders auto-resolved legend label", () => {
    render(<AutoResolveGauge autoResolveRate={80} hitlRate={20} />);
    expect(screen.getByText(/Auto-resolved: 80%/)).toBeInTheDocument();
  });

  it("renders HITL escalated legend label", () => {
    render(<AutoResolveGauge autoResolveRate={80} hitlRate={20} />);
    expect(screen.getByText(/HITL Escalated: 20%/)).toBeInTheDocument();
  });
});
