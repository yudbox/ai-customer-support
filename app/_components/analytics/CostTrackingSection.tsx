"use client";

import { HUMAN_AGENT_COST_PER_TICKET_USD, PRICING_LABELS } from "@/lib/constants/pricing";
import { trpc } from "@/lib/trpc/client";

import { CostTrendChart } from "./CostTrendChart";
import { TicketKpiCard } from "./TicketKpiCard";

interface CostTrackingSectionProps {
  from: Date;
  to: Date;
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-gray-100 rounded-xl" />
      <div className="h-24 bg-gray-100 rounded-xl" />
    </div>
  );
}

export function CostTrackingSection({ from, to }: CostTrackingSectionProps) {
  const { data: costData, isLoading: costLoading } =
    trpc.analytics.getCostMetrics.useQuery({ from, to }, { staleTime: 60_000 });

  // Reuse ticket metrics (already fetched by TicketMetricsSection — TanStack Query deduplicates)
  const { data: ticketData, isLoading: ticketLoading } =
    trpc.analytics.getTicketMetrics.useQuery({ from, to }, { staleTime: 60_000 });

  const isLoading = costLoading || ticketLoading;

  if (isLoading || !costData || !ticketData) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">💰 Cost Tracking</h3>
        <SectionSkeleton />
      </section>
    );
  }

  const savedVsHuman =
    ticketData.total > 0
      ? Math.round(
          (HUMAN_AGENT_COST_PER_TICKET_USD * ticketData.total - costData.totalCostUsd) * 100,
        ) / 100
      : 0;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h3 className="text-base font-semibold text-gray-900">💰 Cost Tracking</h3>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TicketKpiCard
          label="Total Cost"
          value={`$${costData.totalCostUsd.toFixed(4)}`}
          sub="for period"
        />
        <TicketKpiCard
          label="Cost / Ticket"
          value={`$${costData.costPerTicketUsd.toFixed(5)}`}
          sub="avg per ticket"
          accent="green"
        />
        <TicketKpiCard
          label="API Calls"
          value={costData.classificationCallsCount + costData.embeddingCallsCount}
          sub="classification + embedding"
        />
        <TicketKpiCard
          label="Saved vs Human"
          value={`$${savedVsHuman.toFixed(2)}`}
          sub={`vs $${HUMAN_AGENT_COST_PER_TICKET_USD}/ticket human`}
          accent="green"
        />
      </div>

      {/* Daily cost trend chart */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">📈 Daily Cost Trend</p>
        {ticketData.byDay.length > 0 ? (
          <CostTrendChart
            byDay={ticketData.byDay}
            costPerTicketUsd={costData.costPerTicketUsd}
          />
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">
            No data for selected period
          </p>
        )}
      </div>

      {/* Cost breakdown */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">📊 Breakdown</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" />
              <span className="text-gray-700">{PRICING_LABELS.classification}</span>
            </div>
            <span className="font-mono text-gray-900">
              ${costData.breakdown.classificationUsd.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" />
              <span className="text-gray-700">{PRICING_LABELS.embedding}</span>
            </div>
            <span className="font-mono text-gray-900">
              ${costData.breakdown.embeddingUsd.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-green-300 inline-block" />
              <span className="text-gray-700">{PRICING_LABELS.sentiment}</span>
            </div>
            <span className="text-green-600 font-medium">FREE ✅</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-green-300 inline-block" />
              <span className="text-gray-700">{PRICING_LABELS.vectorSearch}</span>
            </div>
            <span className="text-green-600 font-medium">FREE ✅</span>
          </div>
        </div>
      </div>
    </section>
  );
}
