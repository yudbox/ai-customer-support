// Mock recharts — jsdom doesn't support SVG rendering
jest.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

import { render, screen } from "@testing-library/react";

import { TicketVolumeChart } from "../TicketVolumeChart";

describe("TicketVolumeChart", () => {
  it("renders bar chart when data is provided", () => {
    const data = [
      { date: "2026-06-01", count: 5 },
      { date: "2026-06-02", count: 8 },
      { date: "2026-06-03", count: 3 },
    ];
    render(<TicketVolumeChart data={data} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<TicketVolumeChart data={[]} />);
    expect(screen.getByText("No data for selected period")).toBeInTheDocument();
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });

  it("renders responsive container wrapping chart", () => {
    const data = [{ date: "2026-06-01", count: 10 }];
    render(<TicketVolumeChart data={data} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});
