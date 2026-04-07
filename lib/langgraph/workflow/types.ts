/**
 * Workflow module types and interfaces
 */

import type { CustomerLookupOutput } from "@/lib/types/agents";
import type { AgentError, CustomerTicketInput } from "@/lib/types/common";

import type { BaseCheckpointSaver } from "@langchain/langgraph";

/**
 * Options for creating workflow
 */
export interface WorkflowFactoryOptions {
  /**
   * Checkpointer instance for state persistence
   * @default PostgresCheckpointSaver instance
   */
  checkpointer?: BaseCheckpointSaver;

  /**
   * Enable/disable checkpoint interruption after WAIT_APPROVAL node
   * @default true
   */
  enableInterrupts?: boolean;
}

/**
 * Initial state for workflow execution
 */
export interface WorkflowInitialState {
  input: CustomerTicketInput;
  ticket_id: string;
  created_at: string;
  status: string;
  needs_approval: boolean;
  errors: AgentError[];
  customer?: CustomerLookupOutput;
}

/**
 * Configuration for workflow execution
 */
export interface WorkflowExecutionConfig {
  /**
   * Thread ID for checkpointer (for resume scenarios)
   */
  thread_id?: string;
}

/**
 * Manager input for resuming paused workflow
 */
export interface ManagerApprovalInput {
  resolution?: string;
  assigned_team?: string;
  needs_approval: false; // Must be false to unblock workflow
}
