"use client";

import { formatDistanceToNow } from "date-fns";

import { trpc } from "@/lib/trpc/client";
import { PRIORITY_SCORE, SentimentLabel } from "@/lib/types/common";

interface ManagerSidebarProps {
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
}

export function ManagerSidebar({
  selectedTicketId,
  onSelectTicket,
}: ManagerSidebarProps) {
  // Removed refetchInterval - будет добавлен позже для production
  const { data: tickets, isLoading } =
    trpc.tickets.getPendingApproval.useQuery();

  if (isLoading) {
    return (
      <div className="w-full lg:w-96 bg-white border-r border-gray-200 p-4">
        <div className="space-y-4">
          <div
            className="h-16 bg-gray-100 rounded animate-pulse"
            data-testid="loading-skeleton"
          />
          <div
            className="h-16 bg-gray-100 rounded animate-pulse"
            data-testid="loading-skeleton"
          />
          <div
            className="h-16 bg-gray-100 rounded animate-pulse"
            data-testid="loading-skeleton"
          />
        </div>
      </div>
    );
  }

  const pendingCount = tickets?.length || 0;

  return (
    <div className="w-full lg:w-96 bg-white lg:border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">PENDING APPROVAL</h2>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {pendingCount}
          </span>
          <span className="text-sm text-gray-600">tickets</span>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto">
        {!tickets || tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No pending tickets</p>
            <p className="text-xs mt-1">All caught up! 🎉</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket: NonNullable<typeof tickets>[number]) => (
              <button
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                  selectedTicketId === ticket.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                {/* Priority Badge */}
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 text-lg ${
                      (ticket.priority_score ?? 0) >= PRIORITY_SCORE.URGENT
                        ? "animate-pulse"
                        : ""
                    }`}
                  >
                    {(ticket.priority_score ?? 0) >= PRIORITY_SCORE.URGENT
                      ? "🚨"
                      : (ticket.priority_score ?? 0) >= PRIORITY_SCORE.MEDIUM
                        ? "🔴"
                        : "🟡"}
                  </span>
                  <div className="flex-1 min-w-0">
                    {/* Ticket Number */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        #{ticket.ticket_number}
                      </span>
                      {ticket.customer_tier === "VIP" && (
                        <span className="text-xs">⭐</span>
                      )}
                    </div>

                    {/* Subject - truncated */}
                    <p className="mt-1 text-sm text-gray-900 font-medium truncate">
                      {ticket.subject}
                    </p>

                    {/* Meta info */}
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      {ticket.sentiment_label && (
                        <span>
                          {ticket.sentiment_label === SentimentLabel.ANGRY
                            ? "😡"
                            : ticket.sentiment_label === SentimentLabel.NEUTRAL
                              ? "😐"
                              : "😊"}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(ticket.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
