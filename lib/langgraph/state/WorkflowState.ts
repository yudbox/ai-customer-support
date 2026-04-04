import { Annotation } from "@langchain/langgraph";

import type {
  IntakeOutput,
  ClassificationOutput,
  SentimentOutput,
  CustomerLookupOutput,
  RAGOutput,
  PriorityOutput,
  AssignmentOutput,
} from "../../types/agents";
import type { CustomerTicketInput, TicketStatus } from "../../types/common";

/**
 * State для всего workflow
 * Каждый агент добавляет свои данные в этот state
 */
export const WorkflowState = Annotation.Root({
  // Original input
  input: Annotation<CustomerTicketInput>,

  // Agent outputs
  intake: Annotation<IntakeOutput | undefined>,
  classification: Annotation<ClassificationOutput | undefined>,
  sentiment: Annotation<SentimentOutput | undefined>,
  customer: Annotation<CustomerLookupOutput | undefined>,
  rag: Annotation<RAGOutput | undefined>,
  priority: Annotation<PriorityOutput | undefined>,
  assignment: Annotation<AssignmentOutput | undefined>,

  // Metadata
  ticket_id: Annotation<string | undefined>,
  created_at: Annotation<string>,
  status: Annotation<TicketStatus>(),

  // Automation (for LOW/MEDIUM priority tickets)
  assigned_team: Annotation<string | null | undefined>,
  assigned_to: Annotation<string | null | undefined>, // Specific team member
  resolution: Annotation<string | null | undefined>,

  // Human-in-the-loop
  needs_approval: Annotation<boolean>(),
  approved_by: Annotation<string | undefined>(),

  // Errors (используем reducer для append)
  errors: Annotation<
    Array<{ agent: string; message: string; timestamp: string }>
  >({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
});

export type WorkflowStateType = typeof WorkflowState.State;
