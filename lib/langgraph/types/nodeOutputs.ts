/**
 * Node Output Types
 *
 * Типы возвращаемых значений для workflow nodes
 */

import type { PriorityOutput } from "@/lib/types/agents";
import type { AgentExecutionStatus, TicketStatus } from "@/lib/types/common";

// ===========================
// PRIORITY NODE OUTPUT
// ===========================

export interface PriorityNodeOutput {
  priority: PriorityOutput;
  needs_approval: boolean;
  status: AgentExecutionStatus;
}

// ===========================
// FINALIZE TICKET NODE OUTPUT
// ===========================

export interface FinalizeTicketNodeOutput {
  status: TicketStatus;
  resolution?: string;
  assigned_team?: string | null;
}
