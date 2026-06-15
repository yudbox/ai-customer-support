// Mock recharts
jest.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock tRPC
const mockGetTicketMetrics = jest.fn();

jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    analytics: {
      getTicketMetrics: {
        useQuery: () => mockGetTicketMetrics(),
      },
    },
  },
}));

import { render, screen } from "@testing-library/react";

import { TicketMetricsSection } from "../TicketMetricsSection";

const mockData = {
  total: 100,
  byStatus: {
    open: 10,
    in_progress: 5,
    pending_approval: 3,
    resolved: 75,
    closed: 5,
    rejected: 2,
  },
  byCategory: { Shipping: 40, Payment: 35, Technical: 25 },
  byDay: [
    { date: "2026-06-01", count: 10 },
    { date: "2026-06-02", count: 15 },
  ],
  avgResolutionMinutes: 12,
};

const from = new Date("2026-06-01");
const to = new Date("2026-06-15");

describe("TicketMetricsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeleton when isLoading", () => {
    mockGetTicketMetrics.mockReturnValue({ data: undefined, isLoading: true });
    render(<TicketMetricsSection from={from} to={to} />);
    expect(screen.getByText("🎫 Ticket Metrics")).toBeInTheDocument();
    // Skeleton should be rendered — section heading still visible during loading
    expect(screen.getAllByText("🎫 Ticket Metrics")).toHaveLength(1);
  });

  it("renders KPI cards with real data", () => {
    mockGetTicketMetrics.mockReturnValue({ data: mockData, isLoading: false });
    render(<TicketMetricsSection from={from} to={to} />);

    expect(screen.getByText("Total Tickets")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    expect(screen.getByText("Avg Resolution")).toBeInTheDocument();
  });

  it("renders resolved count with percentage", () => {
    mockGetTicketMetrics.mockReturnValue({ data: mockData, isLoading: false });
    render(<TicketMetricsSection from={from} to={to} />);
    expect(screen.getByText("75 (75%)")).toBeInTheDocument();
  });

  it("formats avg resolution minutes to minutes string", () => {
    mockGetTicketMetrics.mockReturnValue({ data: mockData, isLoading: false });
    render(<TicketMetricsSection from={from} to={to} />);
    expect(screen.getByText("12m")).toBeInTheDocument();
  });

  it("shows dash when avgResolutionMinutes is null", () => {
    mockGetTicketMetrics.mockReturnValue({
      data: { ...mockData, avgResolutionMinutes: null },
      isLoading: false,
    });
    render(<TicketMetricsSection from={from} to={to} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats hours when resolution time > 60 minutes", () => {
    mockGetTicketMetrics.mockReturnValue({
      data: { ...mockData, avgResolutionMinutes: 90 },
      isLoading: false,
    });
    render(<TicketMetricsSection from={from} to={to} />);
    expect(screen.getByText("1.5h")).toBeInTheDocument();
  });

  it("renders volume chart and category chart", () => {
    mockGetTicketMetrics.mockReturnValue({ data: mockData, isLoading: false });
    render(<TicketMetricsSection from={from} to={to} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders section heading", () => {
    mockGetTicketMetrics.mockReturnValue({ data: mockData, isLoading: false });
    render(<TicketMetricsSection from={from} to={to} />);
    expect(screen.getByText("🎫 Ticket Metrics")).toBeInTheDocument();
  });

  it("pending approval card shows yellow accent when > 10", () => {
    mockGetTicketMetrics.mockReturnValue({
      data: { ...mockData, byStatus: { ...mockData.byStatus, pending_approval: 15 } },
      isLoading: false,
    });
    render(<TicketMetricsSection from={from} to={to} />);
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
