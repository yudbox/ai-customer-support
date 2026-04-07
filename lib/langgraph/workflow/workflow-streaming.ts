/**
 * Workflow Streaming
 *
 * Handles Server-Sent Events (SSE) streaming of workflow execution
 */

import { TicketStatus, WorkflowStep } from "@/lib/types/common";
import type { TicketState } from "@/lib/types/workflow";

import { AGENT_DISPLAY_NAMES, STREAM_DELAY_MS } from "../constants";
import { formatAgentMessage } from "../formatters";

import type { WorkflowExecutionConfig, WorkflowInitialState } from "./types";
import type { FinalizeTicketNodeOutput } from "../types/nodeOutputs";

/**
 * Stream workflow execution events for real-time UI updates
 *
 * @param app - Compiled workflow graph
 * @param initialState - Initial workflow state
 * @param config - Execution configuration (thread_id for resume)
 * @returns AsyncGenerator yielding workflow events
 */
export async function* streamWorkflowEvents(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any, // CompiledStateGraph has complex generics, use any for flexibility
  initialState: WorkflowInitialState,
  config?: WorkflowExecutionConfig,
) {
  let finalStatus: TicketStatus = TicketStatus.OPEN;
  let finalResolution: string | null | undefined;
  let finalAssignedTeam: string | null | undefined;

  // Helper: Wait for UI to render spinner
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Build LangGraph config with thread_id if provided
  const streamConfig = config?.thread_id
    ? { configurable: { thread_id: config.thread_id } }
    : undefined;

  // Stream events from LangGraph workflow
  for await (const event of await app.stream(initialState, streamConfig)) {
    // Process each node execution event
    for (const [nodeName, nodeData] of Object.entries(event)) {
      const agentName =
        AGENT_DISPLAY_NAMES[nodeName as WorkflowStep] || nodeName;

      // Capture final ticket status from finalize node
      if (nodeName === WorkflowStep.FINALIZE_TICKET) {
        const finalizeData = nodeData as unknown as FinalizeTicketNodeOutput;
        finalStatus = finalizeData.status || TicketStatus.OPEN;
        finalResolution = finalizeData.resolution;
        finalAssignedTeam = finalizeData.assigned_team;
      }

      // Detect __interrupt__ event when workflow pauses for HITL
      if (nodeName === "__interrupt__") {
        // When interrupted, finalize node doesn't run, so set status manually
        finalStatus = TicketStatus.PENDING_APPROVAL;
      }

      // Emit "in_progress" event
      yield {
        step: nodeName,
        status: TicketStatus.IN_PROGRESS,
        message: `${agentName} processing...`,
        detail: `Analyzing: ${initialState.input.subject}`,
      };

      // Allow UI time to show spinner
      await sleep(STREAM_DELAY_MS);

      // Format detailed message for completed node
      const detailMessage = formatAgentMessage(
        nodeName,
        nodeData as Partial<TicketState>,
        initialState as unknown as Partial<TicketState>,
      );

      // Emit "resolved" event
      yield {
        step: nodeName,
        status: TicketStatus.RESOLVED,
        message: `${agentName} completed`,
        detail: detailMessage,
      };
    }
  }

  // Emit final workflow completion event
  const isPendingApproval = finalStatus === TicketStatus.PENDING_APPROVAL;
  const isResolved = finalStatus === TicketStatus.RESOLVED;

  yield {
    step: WorkflowStep.COMPLETE,
    status: finalStatus,
    critical: isPendingApproval,
    message: isPendingApproval
      ? "Workflow paused - pending manager approval"
      : isResolved
        ? "Workflow completed successfully"
        : "Ticket assigned to support team",
    detail: isPendingApproval
      ? "Your ticket requires senior team review"
      : isResolved
        ? "All agents have processed your ticket"
        : "Our team will review and respond",
    resolution: finalResolution,
    assigned_team: finalAssignedTeam,
  };
}
