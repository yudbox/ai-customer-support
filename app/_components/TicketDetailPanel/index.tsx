"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { trpc } from "@/lib/trpc/client";
import { QUERY_PARAMS, TeamCode } from "@/lib/types/common";

import { ActionButtons } from "./ActionButtons";
import { AIAnalysis } from "./AIAnalysis";
import { ApproveModal } from "./ApproveModal";
import { CustomerInfo } from "./CustomerInfo";
import { RejectModal } from "./RejectModal";
import { ResolutionEditor } from "./ResolutionEditor";
import { SimilarTickets } from "./SimilarTickets";
import { TicketHeader } from "./TicketHeader";
import { TicketMessage } from "./TicketMessage";

interface TicketDetailPanelProps {
  ticketId: string | null;
}

export function TicketDetailPanel({ ticketId }: TicketDetailPanelProps) {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState(TeamCode.TECHNICAL_SUPPORT);
  const [resolutionText, setResolutionText] = useState("");
  const [selectedSimilarIndex, setSelectedSimilarIndex] = useState<
    number | null
  >(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
    onSuccess: (_, variables) => {
      utils.tickets.getPendingApproval.invalidate();
      router.push(`/?${QUERY_PARAMS.APPROVED}=${variables.id}`);
    },
  });

  const rejectMutation = trpc.tickets.reject.useMutation({
    onSuccess: (_, variables) => {
      utils.tickets.getPendingApproval.invalidate();
      router.push(`/?${QUERY_PARAMS.REJECTED}=${variables.id}`);
    },
  });

  // Handlers
  const handleApprove = () => {
    if (!resolutionText.trim()) {
      return;
    }
    setShowApproveModal(true);
  };

  const confirmApprove = () => {
    approveMutation.mutate({
      id: ticket!.id,
      assigned_team: selectedTeam,
      resolution: resolutionText,
    });
    setShowApproveModal(false);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      return;
    }
    rejectMutation.mutate({
      id: ticket!.id,
      reason: rejectReason.trim(),
    });
    setShowRejectModal(false);
    setRejectReason("");
  };

  const handleSelectSimilarTicket = (index: number, resolution: string) => {
    setResolutionText(resolution);
    setSelectedSimilarIndex(index);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason("");
  };

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
          <div
            className="h-32 bg-white rounded-lg shadow animate-pulse"
            data-testid="loading-skeleton"
          />
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

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <TicketHeader
          ticketNumber={ticket.ticket_number}
          priority={ticket.priority}
          priorityScore={ticket.priority_score}
        />

        {/* Customer Info */}
        {ticket.customer && <CustomerInfo customer={ticket.customer} />}

        {/* Ticket Message */}
        <TicketMessage subject={ticket.subject} body={ticket.body} />

        {/* AI Analysis */}
        <AIAnalysis
          category={ticket.category}
          sentimentLabel={ticket.sentiment_label}
          sentimentScore={ticket.sentiment_score}
          priorityScore={ticket.priority_score}
          order={ticket.order}
        />

        {/* Similar Tickets (AI Recommendations) */}
        <SimilarTickets
          isLoading={isLoadingRecommendations}
          similarTickets={aiRecommendations?.similar_tickets}
          suggestedSolution={aiRecommendations?.suggested_solution}
          selectedIndex={selectedSimilarIndex}
          onSelectTicket={handleSelectSimilarTicket}
        />

        {/* Resolution Editor */}
        <ResolutionEditor
          resolutionText={resolutionText}
          onResolutionChange={setResolutionText}
          suggestedSolution={aiRecommendations?.suggested_solution}
        />

        {/* Action Buttons */}
        <ActionButtons
          selectedTeam={selectedTeam}
          onTeamChange={(team) => setSelectedTeam(team as TeamCode)}
          onApprove={handleApprove}
          onReject={handleReject}
          isApproving={approveMutation.isPending}
          isRejecting={rejectMutation.isPending}
          isApproveDisabled={!resolutionText.trim()}
        />
      </div>

      {/* Approve Confirmation Modal */}
      <ApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={confirmApprove}
        selectedTeam={selectedTeam}
        resolutionText={resolutionText}
        isPending={approveMutation.isPending}
      />

      {/* Reject Reason Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={handleCloseRejectModal}
        onConfirm={confirmReject}
        rejectReason={rejectReason}
        onReasonChange={setRejectReason}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
}
