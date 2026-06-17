import { Suspense } from "react";

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

      {/* Ticket Metrics section — PR 3 */}
      <Suspense fallback={<SectionSkeleton title="Ticket Metrics" />}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-400 text-sm">
            🎫 Ticket Metrics — coming in PR 3
          </p>
        </div>
      </Suspense>

      {/* Agent Performance section — PR 4 */}
      <Suspense fallback={<SectionSkeleton title="Agent Performance" />}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-400 text-sm">
            🤖 Agent Performance — coming in PR 4
          </p>
        </div>
      </Suspense>

      {/* Cost Tracking section — PR 5 */}
      <Suspense fallback={<SectionSkeleton title="Cost Tracking" />}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-400 text-sm">
            💰 Cost Tracking — coming in PR 5
          </p>
        </div>
      </Suspense>
    </div>
  );
}
