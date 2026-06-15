import { z } from "zod";

import { router, publicProcedure } from "@/lib/trpc/server";

import { analyticsService } from "./analytics.service";

const dateRangeInput = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

/**
 * Analytics router
 * Содержит процедуры для метрик и KPI дашборда
 */
export const analyticsRouter = router({
  /**
   * Общие метрики тикетов за период
   * Используется в TicketMetricsSection (PR 3)
   */
  getTicketMetrics: publicProcedure
    .input(dateRangeInput)
    .query(async ({ input }) => {
      return analyticsService.getTicketMetrics(input.from, input.to);
    }),

  /**
   * Производительность агентов: auto-resolve rate, HITL rate
   * Используется в AgentPerformanceSection (PR 4)
   */
  getAgentPerformance: publicProcedure
    .input(dateRangeInput)
    .query(async ({ input }) => {
      return analyticsService.getAgentPerformance(input.from, input.to);
    }),

  /**
   * Статистика резолюций: resolved/rejected count, priority distribution
   * Используется в AgentPerformanceSection (PR 4)
   */
  getResolutionStats: publicProcedure
    .input(dateRangeInput)
    .query(async ({ input }) => {
      return analyticsService.getResolutionStats(input.from, input.to);
    }),

  /**
   * Стоимость API вызовов за период (расчёт из кол-ва тикетов × pricing constants)
   * Используется в CostTrackingSection (PR 5)
   */
  getCostMetrics: publicProcedure
    .input(dateRangeInput)
    .query(async ({ input }) => {
      return analyticsService.getCostMetrics(input.from, input.to);
    }),
});
