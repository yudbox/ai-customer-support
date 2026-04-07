import { PRIORITY_SCORE } from "@/lib/types/common";

interface TicketHeaderProps {
  ticketNumber: string;
  priority: string | undefined;
  priorityScore: number | undefined | null;
}

export function TicketHeader({
  ticketNumber,
  priority,
  priorityScore,
}: TicketHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {(priorityScore ?? 0) >= PRIORITY_SCORE.URGENT ? "🚨" : "🔴"} Ticket
            #{ticketNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Priority: {priority} ({priorityScore ?? "N/A"}/100)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            Pending Approval
          </span>
        </div>
      </div>
    </div>
  );
}
