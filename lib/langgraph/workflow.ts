import { getDataSource } from "@/lib/database/connection";
import { Ticket } from "@/lib/database/entities/Ticket";
import { StateGraph, START, END } from "@langchain/langgraph";
import { WorkflowState, WorkflowStateType } from "./state/WorkflowState";
import type { CustomerTicketInput } from "@/lib/types/common";
import type { CustomerLookupOutput } from "@/lib/types/agents";
import { intakeNode } from "./agentNodes/intakeNode";
import { classificationNode } from "./agentNodes/classificationNode";
import { sentimentNode } from "./agentNodes/sentimentNode";
import { customerLookupNode } from "./agentNodes/customerLookupNode";
import { resolutionSearchNode } from "./agentNodes/resolutionSearchNode";
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
    .addNode("sentimentAgent", sentimentNode)
    .addNode("customerAgent", customerLookupNode)
    .addNode("resolutionSearchAgent", resolutionSearchNode)
    .addEdge(START, "intakeAgent")
    .addEdge("intakeAgent", "classificationAgent")
    .addEdge("classificationAgent", "sentimentAgent")
    .addEdge("sentimentAgent", "customerAgent")
    .addEdge("customerAgent", "resolutionSearchAgent")
    .addEdge("resolutionSearchAgent", END);
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
 * @param input - данные тикета
 * @param customerData - опциональные данные клиента (для оптимизации)
 */

export async function streamWorkflow(
  input: CustomerTicketInput,
  customerData?: CustomerLookupOutput,
) {
  console.log("🔄 Starting workflow with streaming...");

  const app = createWorkflow();

  const initialState = {
    input,
    created_at: new Date().toISOString(),
    status: TicketStatus.OPEN,
    needs_approval: false,
    errors: [],
    // ✅ Передаем customer data если есть (оптимизация)
    customer: customerData,
  };

  // Мапа для человекочитаемых названий агентов
  const agentNames: Record<string, string> = {
    intakeAgent: "Intake Agent",
    classificationAgent: "Classification Agent",
    sentimentAgent: "Sentiment Agent",
    customerAgent: "Customer Lookup Agent",
    resolutionSearchAgent: "Resolution Search Agent",
  };

  // Helper для задержки, чтобы UI успел показать спиннер
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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

        // Даём UI время показать спиннер (300ms)
        await sleep(1000);

        // Затем отправляем resolved (агент завершил работу)
        // Добавляем детальную информацию о результатах каждого агента
        let detailMessage = "Analysis complete";

        if (nodeName === "intakeAgent" && nodeData && "intake" in nodeData) {
          const intake = (nodeData as any).intake;
          if (intake) {
            const parts = [];
            if (intake.extracted_order_number) {
              parts.push(`Order #${intake.extracted_order_number}`);
            }
            if (intake.keywords && intake.keywords.length > 0) {
              parts.push(`Keywords: ${intake.keywords.slice(0, 3).join(", ")}`);
            }
            if (parts.length > 0) {
              detailMessage = parts.join(" | ");
            }
          }
        } else if (
          nodeName === "classificationAgent" &&
          nodeData &&
          "classification" in nodeData
        ) {
          const classification = (nodeData as any).classification;
          if (classification) {
            detailMessage = `Category: ${classification.category} → ${classification.subcategory}`;
            if (classification.confidence) {
              detailMessage += ` (${(classification.confidence * 100).toFixed(0)}%)`;
            }
          }
        } else if (
          nodeName === "sentimentAgent" &&
          nodeData &&
          "sentiment" in nodeData
        ) {
          const sentiment = (nodeData as any).sentiment;
          if (sentiment) {
            detailMessage = `Sentiment: ${sentiment.emoji} ${sentiment.label} (${(sentiment.score * 100).toFixed(0)}%)`;
          }
        } else if (
          nodeName === "customerAgent" &&
          nodeData &&
          "customer" in nodeData
        ) {
          const customer = (nodeData as any).customer;
          if (customer && customer.found) {
            const parts = [];
            parts.push(`Tier: ${customer.tier}`);
            if (customer.total_orders !== undefined) {
              parts.push(`Orders: ${customer.total_orders}`);
            }
            if (customer.lifetime_value !== undefined) {
              parts.push(`LTV: $${customer.lifetime_value.toFixed(2)}`);
            }
            detailMessage = parts.join(" | ");
          } else {
            detailMessage = "New customer - no history found";
          }
        }

        yield {
          step: nodeName,
          status: TicketStatus.RESOLVED,
          message: `${agentName} completed`,
          detail: detailMessage,
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
