import { getDataSource } from "@/lib/database/connection";
import { Ticket } from "@/lib/database/entities/Ticket";
import { TicketStatus } from "@/lib/types/common";

import type { WorkflowStateType } from "../state/WorkflowState";

/**
 * Special node for HITL (Human-in-the-Loop) workflow interruption
 *
 * This node saves PENDING_APPROVAL status and triggers interrupt.
 * Used when HIGH/CRITICAL priority tickets need manager approval.
 *
 * Workflow will PAUSE after this node due to `interruptAfter` config.
 * Manager can resume workflow from Manager Dashboard by calling approve endpoint.
 */
export async function waitApprovalNode(
  state: WorkflowStateType,
): Promise<Partial<WorkflowStateType>> {
  // Update ticket status to PENDING_APPROVAL in database
  // This ensures the status is correct even before workflow resumes
  if (state.ticket_id) {
    try {
      const connection = await getDataSource();
      const ticketRepo = connection.getRepository(Ticket);
      await ticketRepo.update(state.ticket_id, {
        status: TicketStatus.PENDING_APPROVAL,
      });
    } catch (error) {
      console.error("❌ [WaitApproval] Failed to update status:", error);
    }
  }

  // Return state with updated status
  return {
    status: TicketStatus.PENDING_APPROVAL,
  };
}
