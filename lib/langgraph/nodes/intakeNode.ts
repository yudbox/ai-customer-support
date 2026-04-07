import { TicketStatus } from "@/lib/types/common";

import { intakeAgent } from "../agents/intake";

import type { WorkflowStateType } from "../state/WorkflowState";

/**
 * Node 1: Intake Agent
 * Парсит входящий email и извлекает данные
 */
export async function intakeNode(
  state: WorkflowStateType,
): Promise<Partial<WorkflowStateType>> {
  try {
    const result = await intakeAgent(state.input);

    return {
      intake: result,
      status: TicketStatus.IN_PROGRESS,
    };
  } catch (error) {
    return {
      errors: [
        {
          agent: "intake",
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      ],
      status: TicketStatus.REJECTED,
    };
  }
}
