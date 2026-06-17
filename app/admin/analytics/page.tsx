import { Suspense } from "react";

import { AgentPerformanceSection } from "@/app/_components/analytics/AgentPerformanceSection";
import { CostTrackingSection } from "@/app/_components/analytics/CostTrackingSection";
import { TicketMetricsSection } from "@/app/_components/analytics/TicketMetricsSection";

function SectionSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-5 w-40 bg-gray-200 rounded mb-6" aria-hidden="true" />
      <p className="sr-only">Loading {title}...</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="h-48 bg-gray-100 rounded-lg" />
    </div>
  );
}

export default function AnalyticsPage() {
  const DAYS_DEFAULT_RANGE = 7;
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - DAYS_DEFAULT_RANGE);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          📊 Analytics Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Real-time metrics from your AI support system
        </p>
      </div>

      {/* Ticket Metrics section — PR 3 ✅ */}
      <Suspense fallback={<SectionSkeleton title="Ticket Metrics" />}>
        <TicketMetricsSection from={from} to={to} />
      </Suspense>

      {/* Agent Performance section — PR 4 ✅ */}
      <Suspense fallback={<SectionSkeleton title="Agent Performance" />}>
        <AgentPerformanceSection from={from} to={to} />
      </Suspense>

      {/* Cost Tracking section — PR 5 ✅ */}
      <Suspense fallback={<SectionSkeleton title="Cost Tracking" />}>
        <CostTrackingSection from={from} to={to} />
      </Suspense>
    </div>
  );
}
