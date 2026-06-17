// Mock database connection BEFORE any imports
jest.mock("@/lib/database/connection");

// Mock analytics service
jest.mock("@/lib/features/analytics/analytics.service", () => ({
  analyticsService: {
    getTicketMetrics: jest.fn(),
    getAgentPerformance: jest.fn(),
    getResolutionStats: jest.fn(),
    getCostMetrics: jest.fn(),
  },
}));

import { analyticsService } from "@/lib/features/analytics/analytics.service";
import type {
  AgentPerformance,
  CostMetrics,
  ResolutionStats,
  TicketMetrics,
} from "@/lib/features/analytics/analytics.service";

import { analyticsRouter } from "../analytics.router";

const mockAnalyticsService = analyticsService as jest.Mocked<
  typeof analyticsService
>;

describe("analyticsRouter", () => {
  let caller: ReturnType<typeof analyticsRouter.createCaller>;

  const from = new Date("2026-06-01T00:00:00.000Z");
  const to = new Date("2026-06-15T23:59:59.000Z");

  beforeEach(() => {
    caller = analyticsRouter.createCaller({});
    jest.clearAllMocks();
  });

  // ─── Router structure ──────────────────────────────────────────────────────

  describe("router structure", () => {
    it("should expose all 4 procedures", () => {
      const keys = Object.keys(analyticsRouter._def.procedures);
      expect(keys).toContain("getTicketMetrics");
      expect(keys).toContain("getAgentPerformance");
      expect(keys).toContain("getResolutionStats");
      expect(keys).toContain("getCostMetrics");
    });
  });

  // ─── getTicketMetrics ──────────────────────────────────────────────────────

  describe("getTicketMetrics", () => {
    const mockMetrics: TicketMetrics = {
      total: 42,
      byStatus: {
        open: 10,
        in_progress: 5,
        pending_approval: 2,
        resolved: 20,
        closed: 3,
        rejected: 2,
      },
      byCategory: { Shipping: 15, Payment: 10, Technical: 17 },
      byDay: [
        { date: "2026-06-01", count: 5 },
        { date: "2026-06-02", count: 8 },
      ],
      avgResolutionMinutes: 12.5,
    };

    it("should return ticket metrics from service", async () => {
      mockAnalyticsService.getTicketMetrics.mockResolvedValueOnce(mockMetrics);

      const result = await caller.getTicketMetrics({ from, to });

      expect(result).toEqual(mockMetrics);
      expect(mockAnalyticsService.getTicketMetrics).toHaveBeenCalledWith(
        from,
        to,
      );
    });

    it("should handle empty period (zero tickets)", async () => {
      const emptyMetrics: TicketMetrics = {
        total: 0,
        byStatus: {
          open: 0,
          in_progress: 0,
          pending_approval: 0,
          resolved: 0,
          closed: 0,
          rejected: 0,
        },
        byCategory: {},
        byDay: [],
        avgResolutionMinutes: null,
      };
      mockAnalyticsService.getTicketMetrics.mockResolvedValueOnce(emptyMetrics);

      const result = await caller.getTicketMetrics({ from, to });

      expect(result.total).toBe(0);
      expect(result.avgResolutionMinutes).toBeNull();
    });

    it("should coerce string dates to Date objects", async () => {
      mockAnalyticsService.getTicketMetrics.mockResolvedValueOnce(mockMetrics);

      // tRPC input uses z.coerce.date() so strings should be accepted
      await caller.getTicketMetrics({
        from: new Date("2026-06-01"),
        to: new Date("2026-06-15"),
      });

      expect(mockAnalyticsService.getTicketMetrics).toHaveBeenCalled();
    });
  });

  // ─── getAgentPerformance ───────────────────────────────────────────────────

  describe("getAgentPerformance", () => {
    const mockPerformance: AgentPerformance = {
      autoResolveRate: 69,
      hitlRate: 31,
      totalTickets: 100,
      hitlTickets: 31,
    };

    it("should return agent performance from service", async () => {
      mockAnalyticsService.getAgentPerformance.mockResolvedValueOnce(
        mockPerformance,
      );

      const result = await caller.getAgentPerformance({ from, to });

      expect(result).toEqual(mockPerformance);
      expect(mockAnalyticsService.getAgentPerformance).toHaveBeenCalledWith(
        from,
        to,
      );
    });

    it("should return zeros when no tickets exist", async () => {
      const zeroPerformance: AgentPerformance = {
        autoResolveRate: 0,
        hitlRate: 0,
        totalTickets: 0,
        hitlTickets: 0,
      };
      mockAnalyticsService.getAgentPerformance.mockResolvedValueOnce(
        zeroPerformance,
      );

      const result = await caller.getAgentPerformance({ from, to });

      expect(result.autoResolveRate).toBe(0);
      expect(result.hitlRate).toBe(0);
    });
  });

  // ─── getResolutionStats ────────────────────────────────────────────────────

  describe("getResolutionStats", () => {
    const mockStats: ResolutionStats = {
      resolvedTotal: 75,
      rejectedTotal: 5,
      avgPriorityScore: 62.4,
      byPriorityLevel: {
        low: 20,
        medium: 35,
        high: 30,
        critical: 10,
        unset: 5,
      },
    };

    it("should return resolution stats from service", async () => {
      mockAnalyticsService.getResolutionStats.mockResolvedValueOnce(mockStats);

      const result = await caller.getResolutionStats({ from, to });

      expect(result).toEqual(mockStats);
      expect(mockAnalyticsService.getResolutionStats).toHaveBeenCalledWith(
        from,
        to,
      );
    });

    it("should handle null avgPriorityScore when no scored tickets", async () => {
      const statsWithNull: ResolutionStats = {
        ...mockStats,
        avgPriorityScore: null,
      };
      mockAnalyticsService.getResolutionStats.mockResolvedValueOnce(
        statsWithNull,
      );

      const result = await caller.getResolutionStats({ from, to });

      expect(result.avgPriorityScore).toBeNull();
    });
  });

  // ─── getCostMetrics ────────────────────────────────────────────────────────

  describe("getCostMetrics", () => {
    const mockCost: CostMetrics = {
      totalCostUsd: 0.0834,
      costPerTicketUsd: 0.000803,
      classificationCallsCount: 100,
      embeddingCallsCount: 100,
      breakdown: {
        classificationUsd: 0.08,
        embeddingUsd: 0.0003,
        huggingfaceFree: true,
        pineconeFree: true,
      },
    };

    it("should return cost metrics from service", async () => {
      mockAnalyticsService.getCostMetrics.mockResolvedValueOnce(mockCost);

      const result = await caller.getCostMetrics({ from, to });

      expect(result).toEqual(mockCost);
      expect(mockAnalyticsService.getCostMetrics).toHaveBeenCalledWith(
        from,
        to,
      );
    });

    it("should return zero costs when no tickets", async () => {
      const zeroCost: CostMetrics = {
        totalCostUsd: 0,
        costPerTicketUsd: 0,
        classificationCallsCount: 0,
        embeddingCallsCount: 0,
        breakdown: {
          classificationUsd: 0,
          embeddingUsd: 0,
          huggingfaceFree: true,
          pineconeFree: true,
        },
      };
      mockAnalyticsService.getCostMetrics.mockResolvedValueOnce(zeroCost);

      const result = await caller.getCostMetrics({ from, to });

      expect(result.totalCostUsd).toBe(0);
      expect(result.costPerTicketUsd).toBe(0);
      expect(result.breakdown.huggingfaceFree).toBe(true);
      expect(result.breakdown.pineconeFree).toBe(true);
    });
  });
});
