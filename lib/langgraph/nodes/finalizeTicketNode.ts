/**
 * Finalize Ticket Node
 *
 * Last decision point before saving to database
 * Determines ticket status and assignment strategy
 */

import { TicketStatus } from "@/lib/types/common";

import { RAG_AUTO_RESOLVE_THRESHOLD } from "../constants";

import type { WorkflowStateType } from "../state/WorkflowState";

/**
 * Finalize ticket - last step before workflow ends
 *
 * Implements automation strategy:
 * 1. HIGH/CRITICAL priority → Always requires manager approval
 * 2. LOW/MEDIUM + high RAG confidence → Auto-resolve
 * 3. LOW/MEDIUM + low RAG confidence → Send to manager
 *
 * @param state - Current workflow state
 * @returns Status update (PENDING_APPROVAL or RESOLVED)
 */
export async function finalizeTicketNode(state: WorkflowStateType) {
  // HIGH/CRITICAL - requires manager approval (first pass)
  if (state.needs_approval === true) {
    return {
      status: TicketStatus.PENDING_APPROVAL,
    };
  }

  // ✅ MANAGER APPROVED - after HITL resume (needs_approval set to false by manager)
  // If assigned_team is set, it means manager reviewed and approved
  if (state.needs_approval === false && state.assigned_team) {
    return {
      status: TicketStatus.RESOLVED,
      resolution: state.resolution || state.rag?.suggested_solution || null,
    };
  }

  // LOW/MEDIUM - check if we can auto-resolve

  // Check if we have a high-confidence RAG solution
  const hasHighConfidenceSolution =
    state.rag?.suggested_solution &&
    state.rag.similar_tickets &&
    state.rag.similar_tickets.length > 0 &&
    state.rag.similar_tickets[0].similarity > RAG_AUTO_RESOLVE_THRESHOLD;

  if (hasHighConfidenceSolution) {
    // Full automation - AI can resolve this ticket
    return {
      status: TicketStatus.RESOLVED,
      resolution: state.rag!.suggested_solution,
      assigned_team: null, // No human needed
    };
  } else {
    // No confident solution - assign to team for manual review
    // This is LOW/MEDIUM priority, so it doesn't need manager approval
    // Just assign to appropriate team based on classification
    const assignedTeam = state.classification?.category || "general_support";
    return {
      status: TicketStatus.OPEN, // Keep as OPEN, not PENDING_APPROVAL
      assigned_team: assignedTeam,
      resolution: null,
    };
  }
}
