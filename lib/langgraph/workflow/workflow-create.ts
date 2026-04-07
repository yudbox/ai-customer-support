/**
 * Workflow Factory
 *
 * Creates and configures the LangGraph StateGraph with all nodes and edges
 */

import { StateGraph, START, END } from "@langchain/langgraph";

import { WorkflowStep } from "@/lib/types/common";

import { PostgresCheckpointSaver } from "../checkpointer/PostgresCheckpointSaver";
import { classificationNode } from "../nodes/classificationNode";
import { customerLookupNode } from "../nodes/customerLookupNode";
import { finalizeTicketNode } from "../nodes/finalizeTicketNode";
import { intakeNode } from "../nodes/intakeNode";
import { priorityNode } from "../nodes/priorityNode";
import { resolutionSearchNode } from "../nodes/resolutionSearchNode";
import { routePriority } from "../nodes/routingNode";
import { saveToDatabaseNode } from "../nodes/saveToDatabaseNode";
import { sentimentNode } from "../nodes/sentimentNode";
import { waitApprovalNode } from "../nodes/waitApprovalNode";
import { WorkflowState } from "../state/WorkflowState";

import type { WorkflowFactoryOptions } from "./types";

/**
 * Create LangGraph workflow with all nodes and edges
 *
 * @param options - Configuration options
 * @returns Compiled StateGraph ready for execution
 */
export function createWorkflow(options?: WorkflowFactoryOptions) {
  // Use provided checkpointer or create default PostgresCheckpointSaver
  const checkpointer = options?.checkpointer ?? new PostgresCheckpointSaver();

  // Build the workflow graph
  const workflow = new StateGraph(WorkflowState)
    // Add all processing nodes
    .addNode(WorkflowStep.INTAKE_AGENT, intakeNode)
    .addNode(WorkflowStep.CLASSIFICATION_AGENT, classificationNode)
    .addNode(WorkflowStep.SENTIMENT_AGENT, sentimentNode)
    .addNode(WorkflowStep.CUSTOMER_AGENT, customerLookupNode)
    .addNode(WorkflowStep.RESOLUTION_SEARCH_AGENT, resolutionSearchNode)
    .addNode(WorkflowStep.PRIORITY_AGENT, priorityNode)
    .addNode(WorkflowStep.WAIT_APPROVAL, waitApprovalNode) // ⏸️ HITL pause node
    .addNode(WorkflowStep.FINALIZE_TICKET, finalizeTicketNode)
    .addNode(WorkflowStep.SAVE_TO_DATABASE, saveToDatabaseNode)

    // Define workflow edges (execution order)
    .addEdge(START, WorkflowStep.INTAKE_AGENT)
    .addEdge(WorkflowStep.INTAKE_AGENT, WorkflowStep.CLASSIFICATION_AGENT)
    .addEdge(WorkflowStep.CLASSIFICATION_AGENT, WorkflowStep.SENTIMENT_AGENT)
    .addEdge(WorkflowStep.SENTIMENT_AGENT, WorkflowStep.CUSTOMER_AGENT)
    .addEdge(WorkflowStep.CUSTOMER_AGENT, WorkflowStep.RESOLUTION_SEARCH_AGENT)
    .addEdge(WorkflowStep.RESOLUTION_SEARCH_AGENT, WorkflowStep.PRIORITY_AGENT)

    // Conditional routing: auto-resolve OR wait for approval
    .addConditionalEdges(WorkflowStep.PRIORITY_AGENT, routePriority, {
      [WorkflowStep.FINALIZE_TICKET]: WorkflowStep.FINALIZE_TICKET,
      [WorkflowStep.WAIT_APPROVAL]: WorkflowStep.WAIT_APPROVAL,
    })

    // After approval, continue to finalization
    .addEdge(WorkflowStep.WAIT_APPROVAL, WorkflowStep.FINALIZE_TICKET)
    .addEdge(WorkflowStep.FINALIZE_TICKET, WorkflowStep.SAVE_TO_DATABASE)
    .addEdge(WorkflowStep.SAVE_TO_DATABASE, END);

  // Compile with checkpointer and optional interrupt configuration
  const enableInterrupts = options?.enableInterrupts ?? true;

  return workflow.compile({
    checkpointer,
    // Pause workflow after WAIT_APPROVAL to allow manager intervention
    interruptAfter: enableInterrupts ? [WorkflowStep.WAIT_APPROVAL] : [],
  });
}
