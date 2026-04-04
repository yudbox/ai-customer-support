/**
 * Workflow State Types
 *
 * Типы для LangGraph workflow и streaming
 */

import type {
  IntakeOutput,
  ClassificationOutput,
  SentimentOutput,
  CustomerLookupOutput,
  RAGOutput,
  PriorityOutput,
  AssignmentOutput,
} from "./agents";
import type { CustomerTicketInput, TicketStatus, AgentError } from "./common";

// ===========================
// WORKFLOW STATE
// ===========================

/**
 * Полный State, который проходит через весь workflow
 */
export interface TicketState {
  // Original input
  input: CustomerTicketInput;

  // Agent outputs
  intake?: IntakeOutput;
  classification?: ClassificationOutput;
  sentiment?: SentimentOutput;
  customer?: CustomerLookupOutput;
  rag?: RAGOutput;
  priority?: PriorityOutput;
  assignment?: AssignmentOutput;

  // Human-in-the-loop
  needs_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  manager_notes?: string;

  // Metadata
  ticket_id?: string; // UUID после сохранения в БД
  created_at: string;
  updated_at: string;
  status: TicketStatus;

  // Error handling
  errors?: AgentError[];
}

// ===========================
// STREAMING / EVENTS
// ===========================

/**
 * Для streaming progress (SSE)
 */
export interface AgentProgressEvent {
  agent: string;
  status: "started" | "completed" | "error";
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

/**
 * SSE Event для отправки клиенту
 */
export interface StreamEvent {
  event: string;
  data: string | Record<string, unknown>;
  id?: string;
}
