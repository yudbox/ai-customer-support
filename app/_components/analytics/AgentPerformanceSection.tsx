"use client";

import { trpc } from "@/lib/trpc/client";

import { AutoResolveGauge } from "./AutoResolveGauge";
import { PriorityDistributionChart } from "./PriorityDistributionChart";
import { TicketKpiCard } from "./TicketKpiCard";

interface AgentPerformanceSectionProps {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export function AgentPerformanceSection({
  from,
  to,
}: AgentPerformanceSectionProps) {
  const { data: agentData, isLoading: agentLoading } =
    trpc.analytics.getAgentPerformance.useQuery(
      { from, to },
      { staleTime: 60_000 },
    );

  const { data: resolutionData, isLoading: resolutionLoading } =
    trpc.analytics.getResolutionStats.useQuery(
      { from, to },
      { staleTime: 60_000 },
    );

  const isLoading = agentLoading || resolutionLoading;

  if (isLoading || !agentData || !resolutionData) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          🤖 Agent Performance
        </h3>
        <SectionSkeleton />
      </section>
    );
  }

  const AUTO_RESOLVE_TARGET = 80;
  const AUTO_RESOLVE_WARNING = 60;
  const REJECTION_ALERT_THRESHOLD = 10;

  const autoResolveAccent =
    agentData.autoResolveRate >= AUTO_RESOLVE_TARGET
      ? ("green" as const)
      : agentData.autoResolveRate >= AUTO_RESOLVE_WARNING
        ? ("yellow" as const)
        : ("red" as const);

  const resolvedPlusRejected =
    resolutionData.resolvedTotal + resolutionData.rejectedTotal;
  const rejectionRate =
    resolvedPlusRejected > 0
      ? Math.round((resolutionData.rejectedTotal / resolvedPlusRejected) * 100)
      : 0;

  const avgScore =
    resolutionData.avgPriorityScore !== null
      ? resolutionData.avgPriorityScore.toFixed(1)
      : "—";

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h3 className="text-base font-semibold text-gray-900">
        🤖 Agent Performance
      </h3>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TicketKpiCard
          label="Auto-resolve Rate"
          value={`${agentData.autoResolveRate}%`}
          sub={`${agentData.totalTickets - agentData.hitlTickets} of ${agentData.totalTickets}`}
          accent={autoResolveAccent}
        />
        <TicketKpiCard
          label="HITL Escalations"
          value={agentData.hitlTickets}
          sub={`${agentData.hitlRate}% escalated`}
          accent={
            agentData.hitlRate > REJECTION_ALERT_THRESHOLD
              ? "yellow"
              : "default"
          }
        />
        <TicketKpiCard
          label="Resolved"
          value={resolutionData.resolvedTotal}
          sub="total resolved"
          accent="green"
        />
        <TicketKpiCard
          label="Rejection Rate"
          value={`${rejectionRate}%`}
          sub={`${resolutionData.rejectedTotal} rejected`}
          accent={
            rejectionRate > REJECTION_ALERT_THRESHOLD ? "yellow" : "default"
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">
            🎯 Auto-resolve vs HITL
          </p>
          <AutoResolveGauge
            autoResolveRate={agentData.autoResolveRate}
            hitlRate={agentData.hitlRate}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">
            ⚡ Priority Distribution{" "}
            {resolutionData.avgPriorityScore !== null && (
              <span className="text-gray-400 font-normal">
                (avg score: {avgScore})
              </span>
            )}
          </p>
          <PriorityDistributionChart data={resolutionData.byPriorityLevel} />
        </div>
      </div>
    </section>
  );
}
