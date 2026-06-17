"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DayCount {
  date: string;
  count: number;
}

interface CostTrendChartProps {
  byDay: DayCount[];
  costPerTicketUsd: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CostTrendChart({ byDay, costPerTicketUsd }: CostTrendChartProps) {
  const data = byDay.map((d) => ({
    date: d.date,
    label: formatShortDate(d.date),
    cost: Math.round(d.count * costPerTicketUsd * 10000) / 10000,
    tickets: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v.toFixed(2)}`}
          width={48}
        />
        <Tooltip
          formatter={(value, _name, props) => {
            const v = typeof value === "number" ? value : 0;
            const tickets = (props.payload as { tickets?: number } | undefined)?.tickets ?? 0;
            return [`$${v.toFixed(4)} (${tickets} tickets)`, "Cost"] as [string, string];
          }}
          labelFormatter={(label, payload) => {
            const date = (payload as unknown as Array<{ payload: { date: string } }> | undefined)?.[0]?.payload?.date;
            return date ? formatDate(date) : String(label);
          }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#costGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#10b981" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
