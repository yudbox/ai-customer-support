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
  console.log("\n🏁 Finalizing ticket workflow...");

  // HIGH/CRITICAL - requires manager approval
  if (state.needs_approval) {
    console.log(
      "   → Escalated to manager for approval (HIGH/CRITICAL priority)",
    );
    return {
      status: TicketStatus.PENDING_APPROVAL,
    };
  }

  // ✅ MANAGER APPROVED - resolution provided by manager (HITL resume)
  if (state.resolution && state.assigned_team) {
    console.log("   ✅ Manager approved - ticket assigned to team");
    console.log(`   → Team: ${state.assigned_team}`);
    console.log(`   → Resolution: ${state.resolution.substring(0, 60)}...`);

    return {
      status: TicketStatus.IN_PROGRESS,
    };
  }

  // LOW/MEDIUM - check if we can auto-resolve
  console.log("   → Attempting auto-resolution...");

  // Check if we have a high-confidence RAG solution
  const hasHighConfidenceSolution =
    state.rag?.suggested_solution &&
    state.rag.similar_tickets &&
    state.rag.similar_tickets.length > 0 &&
    state.rag.similar_tickets[0].similarity > RAG_AUTO_RESOLVE_THRESHOLD;

  if (hasHighConfidenceSolution) {
    // Full automation - AI can resolve this ticket
    console.log("   ✅ Auto-resolved with RAG solution");
    console.log(
      `   → Similarity: ${(state.rag!.similar_tickets[0].similarity * 100).toFixed(0)}%`,
    );
    console.log(
      `   → Solution: ${state.rag!.suggested_solution?.substring(0, 50)}...`,
    );

    return {
      status: TicketStatus.RESOLVED,
      resolution: state.rag!.suggested_solution,
      assigned_team: null, // No human needed
    };
  } else {
    // No confident solution - send to manager for review
    console.log("   ⚠️  No high-confidence solution found");
    console.log("   → Escalated to manager for manual review");

    return {
      status: TicketStatus.PENDING_APPROVAL,
    };
  }
}
