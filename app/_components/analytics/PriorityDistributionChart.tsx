"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PriorityDistributionChartProps {
  data: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    unset: number;
  };
}

const PRIORITY_CONFIG = [
  { key: "critical", label: "Critical", color: "#ef4444" },
  { key: "high", label: "High", color: "#f97316" },
  { key: "medium", label: "Medium", color: "#f59e0b" },
  { key: "low", label: "Low", color: "#22c55e" },
  { key: "unset", label: "Unset", color: "#d1d5db" },
] as const;

type PriorityKey = (typeof PRIORITY_CONFIG)[number]["key"];

export function PriorityDistributionChart({
  data,
}: PriorityDistributionChartProps) {
  const chartData = PRIORITY_CONFIG.map(({ key, label, color }) => ({
    name: label,
    value: data[key as PriorityKey],
    color,
  }));

  const isEmpty = chartData.every((d) => d.value === 0);

  if (isEmpty) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
        No data for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
      >
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={56}
          tick={{ fontSize: 11 }}
        />
        <Tooltip formatter={(value) => [value, "Tickets"]} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
