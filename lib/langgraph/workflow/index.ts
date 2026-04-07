/**
 * Workflow Module - Public API
 *
 * This module provides the main interface for ticket workflow execution:
 * - streamWorkflow: Real-time SSE streaming for new tickets
 * - resumeWorkflow: HITL resumption after manager approval
 * - createWorkflow: Factory for creating workflow graph (for testing)
 */

import type { CustomerLookupOutput } from "@/lib/types/agents";
import { TicketStatus } from "@/lib/types/common";
import type { CustomerTicketInput } from "@/lib/types/common";

import { createWorkflow as createWorkflowGraph } from "./workflow-create";
import { resumeWorkflow as resumeWorkflowExecution } from "./workflow-resume";
import { streamWorkflowEvents } from "./workflow-streaming";

import type {
  WorkflowFactoryOptions,
  ManagerApprovalInput,
  WorkflowInitialState,
} from "./types";

/**
 * Stream workflow execution for a new ticket
 *
 * @param input - Customer ticket input data
 * @param ticketId - Ticket ID for database updates
 * @param customerData - Optional pre-fetched customer data (optimization)
 * @param threadId - Optional thread ID for resume scenarios
 * @param options - Optional workflow configuration
 * @returns AsyncGenerator yielding workflow events for SSE
 *
 * @example
 * ```typescript
 * for await (const event of streamWorkflow(input, ticketId)) {
 *   console.log(event.step, event.status);
 * }
 * ```
 */
export async function streamWorkflow(
  input: CustomerTicketInput,
  ticketId: string,
  customerData?: CustomerLookupOutput,
  threadId?: string,
  options?: WorkflowFactoryOptions,
) {
  // Create workflow graph
  const app = createWorkflowGraph(options);

  // Build initial state
  const initialState: WorkflowInitialState = {
    input,
    ticket_id: ticketId,
    created_at: new Date().toISOString(),
    status: TicketStatus.OPEN,
    needs_approval: false,
    errors: [],
    customer: customerData,
  };

  // Stream execution events
  return streamWorkflowEvents(app, initialState, { thread_id: threadId });
}

/**
 * Resume paused workflow after manager approval
 *
 * @param threadId - Thread ID from ticket
 * @param managerInput - Manager's approval decision
 * @param options - Optional workflow configuration
 * @returns Final workflow state
 *
 * @example
 * ```typescript
 * const result = await resumeWorkflow(threadId, {
 *   resolution: "Escalated to senior team",
 *   assigned_team: "technical_support",
 *   needs_approval: false,
 * });
 * ```
 */
export async function resumeWorkflow(
  threadId: string,
  managerInput: ManagerApprovalInput,
  options?: WorkflowFactoryOptions,
) {
  // Create workflow graph with same configuration
  const app = createWorkflowGraph(options);

  // Resume execution
  return resumeWorkflowExecution(app, threadId, managerInput);
}

/**
 * Create workflow graph (exported for testing and advanced usage)
 *
 * @param options - Workflow configuration options
 * @returns Compiled StateGraph
 */
export { createWorkflowGraph as createWorkflow };

/**
 * Re-export types for consumers
 */
export type {
  WorkflowFactoryOptions,
  ManagerApprovalInput,
  WorkflowInitialState,
  WorkflowExecutionConfig,
} from "./types";
