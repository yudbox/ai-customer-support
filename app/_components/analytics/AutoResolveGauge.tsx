"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface AutoResolveGaugeProps {
  autoResolveRate: number;
  hitlRate: number;
}

const GAUGE_COLORS = ["#22c55e", "#f59e0b"] as const;

const GAUGE_LABELS = ["Auto-resolved", "HITL Escalated"] as const;

export function AutoResolveGauge({
  autoResolveRate,
  hitlRate,
}: AutoResolveGaugeProps) {
  const data = [
    { name: GAUGE_LABELS[0], value: autoResolveRate },
    { name: GAUGE_LABELS[1], value: hitlRate },
  ];

  const isEmpty = autoResolveRate === 0 && hitlRate === 0;

  if (isEmpty) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
        No data for this period
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={GAUGE_COLORS[index % GAUGE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs text-gray-600">
        {data.map((entry, index) => (
          <span key={entry.name} className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                backgroundColor: GAUGE_COLORS[index % GAUGE_COLORS.length],
              }}
              aria-hidden="true"
            />
            {entry.name}: {entry.value}%
          </span>
        ))}
      </div>
    </div>
  );
}
