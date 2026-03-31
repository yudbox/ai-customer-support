/**
 * LangGraph Workflow Constants
 * Централизованное хранение всех констант для workflow
 */

import { WorkflowStep } from "@/lib/types/common";

// ===========================
// AGENT DISPLAY NAMES
// ===========================

/**
 * Type-safe mapping of workflow steps to human-readable display names
 * Uses WorkflowStep enum for compile-time safety
 * Used in UI for showing progress and in logs
 */
export const AGENT_DISPLAY_NAMES: Record<WorkflowStep, string> = {
  [WorkflowStep.INTAKE_AGENT]: "Intake Agent",
  [WorkflowStep.CLASSIFICATION_AGENT]: "Classification Agent",
  [WorkflowStep.SENTIMENT_AGENT]: "Sentiment Agent",
  [WorkflowStep.CUSTOMER_AGENT]: "Customer Lookup Agent",
  [WorkflowStep.RESOLUTION_SEARCH_AGENT]: "Resolution Search Agent",
  [WorkflowStep.PRIORITY_AGENT]: "Priority Agent",
  [WorkflowStep.FINALIZE_TICKET]: "Finalize Ticket",
  [WorkflowStep.SAVE_TO_DATABASE]: "Save to Database",
  [WorkflowStep.COMPLETE]: "Workflow Complete",
};

// ===========================
// STREAMING CONFIGURATION
// ===========================

/**
 * Delay between streaming events (milliseconds)
 * Gives UI time to show spinner and smooth transitions
 */
export const STREAM_DELAY_MS = 1000;

// ===========================
// RAG THRESHOLDS
// ===========================

/**
 * Similarity threshold for auto-resolution
 * Tickets with RAG similarity > this value get auto-resolved
 */
export const RAG_AUTO_RESOLVE_THRESHOLD = 0.7;
