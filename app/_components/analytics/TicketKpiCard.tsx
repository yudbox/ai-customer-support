interface TicketKpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "default" | "green" | "yellow" | "red";
}

const accentClasses = {
  default: "bg-white border-gray-200",
  green: "bg-green-50 border-green-200",
  yellow: "bg-yellow-50 border-yellow-200",
  red: "bg-red-50 border-red-200",
} as const;

const valueClasses = {
  default: "text-gray-900",
  green: "text-green-700",
  yellow: "text-yellow-700",
  red: "text-red-700",
} as const;

export function TicketKpiCard({
  label,
  value,
  sub,
  accent = "default",
}: TicketKpiCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-1 ${accentClasses[accent]}`}
    >
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-3xl font-bold ${valueClasses[accent]}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}
