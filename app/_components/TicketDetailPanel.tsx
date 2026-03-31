"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { SentimentLabel } from "@/lib/types/common";

interface TicketDetailPanelProps {
  ticketId: string | null;
}

export function TicketDetailPanel({ ticketId }: TicketDetailPanelProps) {
  const [isModifying, setIsModifying] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("technical_support");

  const { data: ticket, isLoading } = trpc.tickets.getById.useQuery(
    { id: ticketId! },
    { enabled: !!ticketId },
  );

  // Separate query for AI recommendations (from Pinecone)
  const { data: aiRecommendations, isLoading: isLoadingRecommendations } =
    trpc.tickets.getAIRecommendations.useQuery(
      { ticketId: ticketId! },
      { enabled: !!ticketId },
    );

  const utils = trpc.useUtils();

  const approveMutation = trpc.tickets.approve.useMutation({
    onSuccess: () => {
      alert("Ticket approved successfully!");
      utils.tickets.getPendingApproval.invalidate();
    },
  });

  const rejectMutation = trpc.tickets.reject.useMutation({
    onSuccess: () => {
      alert("Ticket rejected successfully!");
    },
  });

  // No ticket selected
  if (!ticketId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Select a ticket</p>
          <p className="text-sm mt-1">
            Choose a ticket from the left panel to review
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-32 bg-white rounded-lg shadow animate-pulse" />
          <div className="h-48 bg-white rounded-lg shadow animate-pulse" />
          <div className="h-64 bg-white rounded-lg shadow animate-pulse" />
        </div>
      </div>
    );
  }

  // Ticket not found
  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Ticket not found</p>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    const hasAIRecommendations = aiRecommendations?.suggested_solution;

    const message = hasAIRecommendations
      ? `Approve this ticket with AI recommended solution?\n\nTeam: ${selectedTeam}\nSolution: ${aiRecommendations?.suggested_solution?.substring(0, 100)}...`
      : `Approve and assign this ticket to ${selectedTeam}?\n\nNo AI recommendations available - team will investigate manually.`;

    if (confirm(message)) {
      approveMutation.mutate({
        id: ticket.id,
        assigned_team: selectedTeam,
        resolution: aiRecommendations?.suggested_solution,
      });
    }
  };

  const handleReject = () => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectMutation.mutate({
        id: ticket.id,
        reason,
      });
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {(ticket.priority_score ?? 0) >= 80 ? "🚨" : "🔴"} Ticket #
                {ticket.ticket_number}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Priority: {ticket.priority} ({ticket.priority_score ?? "N/A"}
                /100)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                Pending Approval
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {ticket.customer && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              📋 Customer Info
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{ticket.customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-sm text-gray-900">{ticket.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tier</p>
                <p className="text-sm text-gray-900">
                  {ticket.customer.tier === "VIP"
                    ? "⭐ VIP"
                    : ticket.customer.tier}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-sm text-gray-900">
                  {ticket.customer.total_orders}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Lifetime Value
                </p>
                <p className="text-sm text-gray-900">
                  ${ticket.customer.lifetime_value.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Message */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📧 Ticket Message
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Subject</p>
              <p className="text-gray-900 font-medium">{ticket.subject}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Message</p>
              <p className="text-gray-900 whitespace-pre-wrap">{ticket.body}</p>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            🤖 AI Analysis
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="text-sm text-gray-900">
                {ticket.category || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sentiment</p>
              <p className="text-sm text-gray-900">
                {ticket.sentiment_label === SentimentLabel.ANGRY
                  ? "😡 ANGRY"
                  : ticket.sentiment_label === SentimentLabel.NEUTRAL
                    ? "😐 NEUTRAL"
                    : "😊 POSITIVE"}{" "}
                (
                {ticket.sentiment_score
                  ? (ticket.sentiment_score * 100).toFixed(0)
                  : "N/A"}
                %)
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Priority Score
              </p>
              <p className="text-sm text-gray-900">
                {ticket.priority_score ?? "N/A"}/100
              </p>
            </div>
            {ticket.order && (
              <div>
                <p className="text-sm font-medium text-gray-500">Order</p>
                <p className="text-sm text-gray-900">
                  #{ticket.order.order_number} (${ticket.order.total_price})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Tickets (AI Recommendations) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            🔍 Similar Resolved Tickets
          </h2>

          {isLoadingRecommendations ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">
                Searching Pinecone for similar tickets...
              </p>
            </div>
          ) : aiRecommendations?.similar_tickets &&
            aiRecommendations.similar_tickets.length > 0 ? (
            <div className="space-y-4">
              {aiRecommendations.similar_tickets.map((similar, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-blue-700">
                          [{(similar.similarity * 100).toFixed(0)}% match]
                        </span>
                        <span className="text-sm text-gray-600">
                          {similar.subject}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Resolution:
                        </span>
                        <p className="mt-1 text-gray-600">
                          {similar.resolution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {aiRecommendations.suggested_solution && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="text-sm font-bold text-green-800 mb-2">
                    💡 AI Recommended Solution (Best Match)
                  </h3>
                  <p className="text-sm text-gray-700">
                    {aiRecommendations.suggested_solution}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm font-medium">❌ No similar tickets found</p>
              <p className="text-xs mt-2">
                This appears to be the first ticket of this type.
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Manual investigation required by support team.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label
              htmlFor="team-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Assign to Team:
            </label>
            <select
              id="team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="technical_support">
                Technical Support (Tier 2)
              </option>
              <option value="customer_service">
                Customer Service (Tier 1)
              </option>
              <option value="billing">Billing Team</option>
              <option value="escalation">Escalation Team (Tier 3)</option>
            </select>
          </div>

          <div className="flex gap-4">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              ❌ Reject
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsModifying(!isModifying)}
            >
              ✏️ Modify
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="ml-auto"
            >
              ✅ Approve & Assign to {selectedTeam.replace("_", " ")}
            </Button>
          </div>

          {isModifying && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                Modify functionality coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
