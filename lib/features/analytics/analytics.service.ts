import { analyticsRepository } from "./analytics.repository";

// OpenAI pricing constants (as of 2025)
// gpt-3.5-turbo: ~800 tokens × ($0.0005 input + $0.0015 output) / 1K
const CLASSIFICATION_COST_PER_TICKET = 0.0008;
// text-embedding-3-small: ~150 tokens × $0.00002 / 1K
const EMBEDDING_COST_PER_TICKET = 0.000003;
// Rounding precision: 4 decimal places for USD display
const ROUNDING_PRECISION = 10000;
// Rounding precision for cost-per-ticket (5 decimal places)
const COST_PER_TICKET_PRECISION = 100000;

export interface TicketMetrics {
  total: number;
  byStatus: {
    open: number;
    in_progress: number;
    pending_approval: number;
    resolved: number;
    closed: number;
    rejected: number;
  };
  byCategory: Record<string, number>;
  byDay: { date: string; count: number }[];
  avgResolutionMinutes: number | null;
}

export interface AgentPerformance {
  autoResolveRate: number;
  hitlRate: number;
  totalTickets: number;
  hitlTickets: number;
}

export interface ResolutionStats {
  resolvedTotal: number;
  rejectedTotal: number;
  avgPriorityScore: number | null;
  byPriorityLevel: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    unset: number;
  };
}

export interface CostMetrics {
  totalCostUsd: number;
  costPerTicketUsd: number;
  classificationCallsCount: number;
  embeddingCallsCount: number;
  breakdown: {
    classificationUsd: number;
    embeddingUsd: number;
    huggingfaceFree: true;
    pineconeFree: true;
  };
}

/**
 * AnalyticsService — бизнес-логика для аналитики
 * Собирает данные из репозитория и формирует структуры для tRPC
 */
export class AnalyticsService {
  async getTicketMetrics(from: Date, to: Date): Promise<TicketMetrics> {
    const [total, statusRows, categoryRows, dayRows, avgMinutes] =
      await Promise.all([
        analyticsRepository.countTotal(from, to),
        analyticsRepository.countByStatus(from, to),
        analyticsRepository.countByCategory(from, to),
        analyticsRepository.countByDay(from, to),
        analyticsRepository.avgResolutionMinutes(from, to),
      ]);

    const byStatus = {
      open: 0,
      in_progress: 0,
      pending_approval: 0,
      resolved: 0,
      closed: 0,
      rejected: 0,
    };
    for (const row of statusRows) {
      const key = row.status as keyof typeof byStatus;
      if (key in byStatus) {
        byStatus[key] = parseInt(row.count, 10);
      }
    }

    const byCategory: Record<string, number> = {};
    for (const row of categoryRows) {
      byCategory[row.category ?? "Uncategorized"] = parseInt(row.count, 10);
    }

    const byDay = dayRows.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
    }));

    return {
      total,
      byStatus,
      byCategory,
      byDay,
      avgResolutionMinutes: avgMinutes,
    };
  }

  async getAgentPerformance(from: Date, to: Date): Promise<AgentPerformance> {
    const { withHitl, total } = await analyticsRepository.hitlStats(from, to);

    const hitlRate = total > 0 ? Math.round((withHitl / total) * 100) : 0;
    const autoResolveRate =
      total > 0 ? Math.round(((total - withHitl) / total) * 100) : 0;

    return {
      autoResolveRate,
      hitlRate,
      totalTickets: total,
      hitlTickets: withHitl,
    };
  }

  async getResolutionStats(from: Date, to: Date): Promise<ResolutionStats> {
    const [statusRows, priorityRows, avgScore] = await Promise.all([
      analyticsRepository.countByStatus(from, to),
      analyticsRepository.countByPriority(from, to),
      analyticsRepository.avgPriorityScore(from, to),
    ]);

    const resolvedTotal = parseInt(
      statusRows.find((r) => r.status === "resolved")?.count ?? "0",
      10,
    );
    const rejectedTotal = parseInt(
      statusRows.find((r) => r.status === "rejected")?.count ?? "0",
      10,
    );

    const byPriorityLevel = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
      unset: 0,
    };
    for (const row of priorityRows) {
      const key = row.priority as keyof typeof byPriorityLevel;
      if (key in byPriorityLevel) {
        byPriorityLevel[key] = parseInt(row.count, 10);
      }
    }

    return {
      resolvedTotal,
      rejectedTotal,
      avgPriorityScore: avgScore,
      byPriorityLevel,
    };
  }

  async getCostMetrics(from: Date, to: Date): Promise<CostMetrics> {
    const total = await analyticsRepository.countTotal(from, to);

    const classificationUsd =
      Math.round(total * CLASSIFICATION_COST_PER_TICKET * ROUNDING_PRECISION) / ROUNDING_PRECISION;
    const embeddingUsd =
      Math.round(total * EMBEDDING_COST_PER_TICKET * ROUNDING_PRECISION) / ROUNDING_PRECISION;
    const totalCostUsd =
      Math.round((classificationUsd + embeddingUsd) * ROUNDING_PRECISION) / ROUNDING_PRECISION;
    const costPerTicketUsd =
      total > 0 ? Math.round((totalCostUsd / total) * COST_PER_TICKET_PRECISION) / COST_PER_TICKET_PRECISION : 0;

    return {
      totalCostUsd,
      costPerTicketUsd,
      classificationCallsCount: total,
      embeddingCallsCount: total,
      breakdown: {
        classificationUsd,
        embeddingUsd,
        huggingfaceFree: true,
        pineconeFree: true,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
