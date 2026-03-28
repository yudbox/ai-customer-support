import { getDataSource } from "@/lib/database/connection";
import { Ticket } from "@/lib/database/entities/Ticket";
import { StateGraph, START, END } from "@langchain/langgraph";
import { WorkflowState, WorkflowStateType } from "./state/WorkflowState";
import type { CustomerTicketInput } from "@/lib/types/common";
import { intakeNode } from "./agentNodes/intakeNode";
import { classificationNode } from "./agentNodes/classificationNode";
// import { sentimentNode } from "./agentNodes/sentimentNode";
import { TicketStatus } from "@/lib/types/common";

// Запустить workflow для тикета по id
export async function runWorkflowForTicketId(ticketId: string) {
  const connection = await getDataSource();
  const ticketRepo = connection.getRepository(Ticket);
  const ticket = await ticketRepo.findOne({
    where: { id: ticketId },
    relations: ["customer"],
  });
  if (!ticket) throw new Error("Ticket not found");
  const input: CustomerTicketInput = {
    email: ticket.customer?.email || "",
    subject: ticket.subject,
    body: ticket.body,
    attachments: [],
  };
  await runWorkflow(input);
}

// ===========================
// WORKFLOW BUILDER
// ===========================

export function createWorkflow() {
  const workflow = new StateGraph(WorkflowState)
    .addNode("intakeAgent", intakeNode)
    .addNode("classificationAgent", classificationNode)
    // .addNode("sentimentAgent", sentimentNode)
    .addEdge(START, "intakeAgent")
    .addEdge("intakeAgent", "classificationAgent")
    // .addEdge("classificationAgent", "sentimentAgent")
    // .addEdge("sentimentAgent", END);
    .addEdge("classificationAgent", END);
  return workflow.compile();
}

// ===========================
// EXECUTION HELPERS
// ===========================

/**
 * Запустить workflow с input
 */

export async function runWorkflow(input: CustomerTicketInput) {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 STARTING WORKFLOW");
  console.log("=".repeat(80) + "\n");

  const app = createWorkflow();

  const initialState = {
    input,
    created_at: new Date().toISOString(),
    status: TicketStatus.OPEN,
    needs_approval: false,
    errors: [],
  };

  try {
    const result = await app.invoke(initialState);

    console.log("\n" + "=".repeat(80));
    console.log("✅ WORKFLOW COMPLETED");
    console.log("=".repeat(80));
    console.log("\nFinal State:");
    console.log(JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ WORKFLOW FAILED");
    console.error("=".repeat(80));
    console.error(error);
    throw error;
  }
}

/**
 * Экспортируемая функция для SSE стриминга
 */

export async function streamWorkflow(input: CustomerTicketInput) {
  console.log("🔄 Starting workflow with streaming...");

  const app = createWorkflow();

  const initialState = {
    input,
    created_at: new Date().toISOString(),
    status: TicketStatus.OPEN,
    needs_approval: false,
    errors: [],
  };

  // Мапа для человекочитаемых названий агентов
  const agentNames: Record<string, string> = {
    intakeAgent: "Intake Agent",
    classificationAgent: "Classification Agent",
    sentimentAgent: "Sentiment Agent",
  };

  // Реализуем генератор для стриминга событий
  async function* eventGenerator() {
    for await (const event of await app.stream(initialState)) {
      console.log("\n📡 Event:", event);

      // Преобразуем каждое событие от LangGraph в формат для фронтенда
      for (const [nodeName, nodeData] of Object.entries(event)) {
        const agentName = agentNames[nodeName] || nodeName;

        // Сначала отправляем in_progress
        yield {
          step: nodeName,
          status: TicketStatus.IN_PROGRESS,
          message: `${agentName} processing...`,
          detail: `Analyzing: ${input.subject}`,
        };

        // Затем сразу отправляем resolved (агент завершил работу)
        yield {
          step: nodeName,
          status: TicketStatus.RESOLVED,
          message: `${agentName} completed`,
          detail: `Analysis complete`,
        };
      }
    }

    // Финальный event для фронта
    yield {
      step: "complete",
      status: TicketStatus.RESOLVED,
      message: "Workflow completed successfully",
      detail: "All agents have processed your ticket",
    };
  }

  return eventGenerator();
}
