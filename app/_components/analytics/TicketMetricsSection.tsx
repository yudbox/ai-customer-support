"use client";

import { trpc } from "@/lib/trpc/client";

import { TicketKpiCard } from "./TicketKpiCard";
import { TicketsByCategoryChart } from "./TicketsByCategoryChart";
import { TicketVolumeChart } from "./TicketVolumeChart";

interface TicketMetricsSectionProps {
  from: Date;
  to: Date;
}

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-52 bg-gray-100 rounded-xl" />
        <div className="h-52 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export function TicketMetricsSection({ from, to }: TicketMetricsSectionProps) {
  const { data, isLoading } = trpc.analytics.getTicketMetrics.useQuery(
    { from, to },
    { staleTime: 60_000 },
  );

  if (isLoading || !data) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          🎫 Ticket Metrics
        </h3>
        <SectionSkeleton />
      </section>
    );
  }

  const PERCENT = 100;
  const RESOLVED_TARGET = 70;
  const RESOLVED_WARNING = 50;
  const PENDING_ALERT_THRESHOLD = 10;

  const resolvedRate =
    data.total > 0
      ? Math.round((data.byStatus.resolved / data.total) * PERCENT)
      : 0;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h3 className="text-base font-semibold text-gray-900">
        🎫 Ticket Metrics
      </h3>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TicketKpiCard label="Total Tickets" value={data.total} />
        <TicketKpiCard
          label="Resolved"
          value={`${data.byStatus.resolved} (${resolvedRate}%)`}
          accent={
            resolvedRate >= RESOLVED_TARGET ? "green" : resolvedRate >= RESOLVED_WARNING ? "yellow" : "red"
          }
        />
        <TicketKpiCard
          label="Pending Approval"
          value={data.byStatus.pending_approval}
          sub="awaiting manager"
          accent={data.byStatus.pending_approval > PENDING_ALERT_THRESHOLD ? "yellow" : "default"}
        />
        <TicketKpiCard
          label="Avg Resolution"
          value={formatMinutes(data.avgResolutionMinutes)}
          sub="per ticket"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">
            📈 Volume by Day
          </p>
          <TicketVolumeChart data={data.byDay} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">
            🥧 By Category
          </p>
          <TicketsByCategoryChart data={data.byCategory} />
        </div>
      </div>
    </section>
  );
}
