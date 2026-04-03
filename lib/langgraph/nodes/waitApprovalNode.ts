import type { WorkflowStateType } from "../state/WorkflowState";

/**
 * Special node for HITL (Human-in-the-Loop) workflow interruption
 *
 * This node does nothing except save state and trigger interrupt.
 * Used when HIGH/CRITICAL priority tickets need manager approval.
 *
 * Workflow will PAUSE after this node due to `interruptAfter` config.
 * Manager can resume workflow from Manager Dashboard by calling approve endpoint.
 */
export async function waitApprovalNode(
  state: WorkflowStateType,
): Promise<Partial<WorkflowStateType>> {
  console.log("⏸️  WAIT_APPROVAL node - preparing to pause workflow");
  console.log("   → State will be saved in checkpointer");
  console.log("   → Manager can resume from Manager Dashboard");

  // Simply return state unchanged - interrupt happens automatically after this node
  return state;
}
