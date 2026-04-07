/**
 * Workflow Resume (HITL)
 *
 * Handles Human-in-the-Loop workflow resumption after manager approval
 */

import type { ManagerApprovalInput } from "./types";

/**
 * Resume paused workflow after manager approval
 *
 * This function:
 * 1. Updates the checkpoint state with manager's decision
 * 2. Resumes workflow execution from the paused point
 *
 * @param app - Compiled workflow graph
 * @param threadId - Thread ID from ticket (checkpointer key)
 * @param managerInput - Manager's approval decision and metadata
 * @returns Final workflow state after resumption
 */
export async function resumeWorkflow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any, // CompiledStateGraph has complex generics, use any for flexibility
  threadId: string,
  managerInput: ManagerApprovalInput,
) {
  const config = { configurable: { thread_id: threadId } };

  try {
    // Step 1: Update checkpoint state with manager's input
    // This modifies the paused state to include resolution/team assignment
    await app.updateState(config, managerInput);

    // Step 2: Resume workflow execution from paused checkpoint
    // Pass null as input since we're continuing from saved state
    const result = await app.invoke(null, config);

    return result;
  } catch (error) {
    // Re-throw with context for better error handling
    throw new Error(
      `Failed to resume workflow for thread ${threadId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
