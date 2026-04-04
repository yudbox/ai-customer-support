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
  console.log("🔵 Agent 1: Intake Agent - Starting...");

  try {
    const result = await intakeAgent(state.input);

    console.log("✅ Agent 1: Intake Agent - Completed");
    console.log(`   - Order #: ${result.extracted_order_number || "N/A"}`);
    console.log(`   - Tracking: ${result.extracted_tracking_number || "N/A"}`);
    console.log(`   - Keywords: ${result.keywords.join(", ")}`);

    return {
      intake: result,
      status: TicketStatus.IN_PROGRESS,
    };
  } catch (error) {
    console.error("❌ Agent 1: Intake Agent - Error:", error);

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
