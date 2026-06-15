// Mock recharts (all charts used by AgentPerformanceSection sub-components)
jest.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Cell: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock tRPC
const mockGetAgentPerformance = jest.fn();
const mockGetResolutionStats = jest.fn();

jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    analytics: {
      getAgentPerformance: {
        useQuery: () => mockGetAgentPerformance(),
      },
      getResolutionStats: {
        useQuery: () => mockGetResolutionStats(),
      },
    },
  },
}));

import { render, screen } from "@testing-library/react";

import { AgentPerformanceSection } from "../AgentPerformanceSection";

const mockAgentData = {
  autoResolveRate: 75,
  hitlRate: 25,
  totalTickets: 100,
  hitlTickets: 25,
};

const mockResolutionData = {
  resolvedTotal: 80,
  rejectedTotal: 5,
  avgPriorityScore: 2.3,
  byPriorityLevel: { low: 20, medium: 35, high: 18, critical: 5, unset: 2 },
};

const from = new Date("2026-06-01");
const to = new Date("2026-06-15");

describe("AgentPerformanceSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeleton when agentData is loading", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByText("🤖 Agent Performance")).toBeInTheDocument();
    expect(screen.queryByText("Auto-resolve Rate")).not.toBeInTheDocument();
  });

  it("renders loading skeleton when resolutionData is loading", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByText("🤖 Agent Performance")).toBeInTheDocument();
    expect(screen.queryByText("Auto-resolve Rate")).not.toBeInTheDocument();
  });

  it("renders section heading when loaded", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByText("🤖 Agent Performance")).toBeInTheDocument();
  });

  it("renders all 4 KPI card labels", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByText("Auto-resolve Rate")).toBeInTheDocument();
    expect(screen.getByText("HITL Escalations")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("Rejection Rate")).toBeInTheDocument();
  });

  it("renders auto-resolve rate value", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders HITL escalation count", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders rejection rate percentage", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    // rejectedTotal=5, resolvedTotal=80 → 5/85 ≈ 6%
    expect(screen.getByText("6%")).toBeInTheDocument();
  });

  it("renders pie chart for auto-resolve gauge", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders bar chart for priority distribution", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("shows avg priority score when available", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: mockResolutionData,
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.getByText(/avg score: 2.3/)).toBeInTheDocument();
  });

  it("hides avg score when null", () => {
    mockGetAgentPerformance.mockReturnValue({
      data: mockAgentData,
      isLoading: false,
    });
    mockGetResolutionStats.mockReturnValue({
      data: { ...mockResolutionData, avgPriorityScore: null },
      isLoading: false,
    });
    render(<AgentPerformanceSection from={from} to={to} />);
    expect(screen.queryByText(/avg score/)).not.toBeInTheDocument();
  });
});
