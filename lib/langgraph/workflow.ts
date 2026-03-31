import { getDataSource } from "@/lib/database/connection";
import { Ticket } from "@/lib/database/entities/Ticket";
import { StateGraph, START, END } from "@langchain/langgraph";
import { WorkflowState } from "./state/WorkflowState";
import type { CustomerTicketInput } from "@/lib/types/common";
import { TicketStatus, WorkflowStep, TeamName } from "@/lib/types/common";
import type { CustomerLookupOutput } from "@/lib/types/agents";
import { intakeNode } from "./nodes/intakeNode";
import { classificationNode } from "./nodes/classificationNode";
import { sentimentNode } from "./nodes/sentimentNode";
import { customerLookupNode } from "./nodes/customerLookupNode";
import { resolutionSearchNode } from "./nodes/resolutionSearchNode";
import { priorityNode } from "./nodes/priorityNode";
import { AGENT_DISPLAY_NAMES, STREAM_DELAY_MS } from "./constants";
import { formatAgentMessage } from "./formatters";
import { routePriority } from "./nodes/routingNode";
import { finalizeTicketNode } from "./nodes/finalizeTicketNode";
import { saveToDatabaseNode } from "./nodes/saveToDatabaseNode";
import type {
  PriorityNodeOutput,
  FinalizeTicketNodeOutput,
} from "./types/nodeOutputs";

export function createWorkflow() {
  const workflow = new StateGraph(WorkflowState)
    .addNode(WorkflowStep.INTAKE_AGENT, intakeNode)
    .addNode(WorkflowStep.CLASSIFICATION_AGENT, classificationNode)
    .addNode(WorkflowStep.SENTIMENT_AGENT, sentimentNode)
    .addNode(WorkflowStep.CUSTOMER_AGENT, customerLookupNode)
    .addNode(WorkflowStep.RESOLUTION_SEARCH_AGENT, resolutionSearchNode)
    .addNode(WorkflowStep.PRIORITY_AGENT, priorityNode)
    .addNode(WorkflowStep.FINALIZE_TICKET, finalizeTicketNode)
    .addNode(WorkflowStep.SAVE_TO_DATABASE, saveToDatabaseNode)
    .addEdge(START, WorkflowStep.INTAKE_AGENT)
    .addEdge(WorkflowStep.INTAKE_AGENT, WorkflowStep.CLASSIFICATION_AGENT)
    .addEdge(WorkflowStep.CLASSIFICATION_AGENT, WorkflowStep.SENTIMENT_AGENT)
    .addEdge(WorkflowStep.SENTIMENT_AGENT, WorkflowStep.CUSTOMER_AGENT)
    .addEdge(WorkflowStep.CUSTOMER_AGENT, WorkflowStep.RESOLUTION_SEARCH_AGENT)
    .addEdge(WorkflowStep.RESOLUTION_SEARCH_AGENT, WorkflowStep.PRIORITY_AGENT)
    .addConditionalEdges(WorkflowStep.PRIORITY_AGENT, routePriority)
    .addEdge(WorkflowStep.FINALIZE_TICKET, WorkflowStep.SAVE_TO_DATABASE)
    .addEdge(WorkflowStep.SAVE_TO_DATABASE, END);

  return workflow.compile();
}

/**
 * Экспортируемая функция для SSE стриминга
 * @param input - данные тикета
 * @param ticketId - ID тикета для обновления в БД
 * @param customerData - опциональные данные клиента (для оптимизации)
 */

export async function streamWorkflow(
  input: CustomerTicketInput,
  ticketId: string,
  customerData?: CustomerLookupOutput,
) {
  console.log("🔄 Starting workflow with streaming...");

  const app = createWorkflow();

  const initialState = {
    input,
    ticket_id: ticketId,
    created_at: new Date().toISOString(),
    status: TicketStatus.OPEN,
    needs_approval: false,
    errors: [],
    customer: customerData,
  };

  // Helper для задержки, чтобы UI успел показать спиннер
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Реализуем генератор для стриминга событий
  async function* eventGenerator() {
    let needsApproval = false; // Track if ticket needs approval
    let finalResolution: string | null | undefined;
    let finalAssignedTeam: string | null | undefined;

    for await (const event of await app.stream(initialState)) {
      console.log("\n📡 Event:", event);

      // Преобразуем каждое событие от LangGraph в формат для фронтенда
      for (const [nodeName, nodeData] of Object.entries(event)) {
        const agentName =
          AGENT_DISPLAY_NAMES[nodeName as WorkflowStep] || nodeName;

        // Track needs_approval status from priority node
        if (nodeName === WorkflowStep.PRIORITY_AGENT) {
          const priorityData = nodeData as PriorityNodeOutput;
          needsApproval = priorityData.needs_approval || needsApproval;
        }

        // Capture automation data from finalizeTicket node
        if (nodeName === WorkflowStep.FINALIZE_TICKET) {
          const finalizeData = nodeData as FinalizeTicketNodeOutput;
          finalResolution = finalizeData.resolution;
          finalAssignedTeam = finalizeData.assigned_team;
        }

        // Сначала отправляем in_progress
        yield {
          step: nodeName,
          status: TicketStatus.IN_PROGRESS,
          message: `${agentName} processing...`,
          detail: `Analyzing: ${input.subject}`,
        };

        // Даём UI время показать спиннер
        await sleep(STREAM_DELAY_MS);

        // Затем отправляем resolved (агент завершил работу)
        // Используем форматтер для получения детального сообщения
        const detailMessage = formatAgentMessage(
          nodeName,
          nodeData,
          initialState,
        );

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
      step: WorkflowStep.COMPLETE,
      status: needsApproval
        ? TicketStatus.PENDING_APPROVAL
        : TicketStatus.RESOLVED,
      critical: needsApproval,
      message: needsApproval
        ? "Workflow paused - pending manager approval"
        : "Workflow completed successfully",
      detail: needsApproval
        ? "Your ticket requires senior team review"
        : "All agents have processed your ticket",
      resolution: finalResolution,
      assigned_team: finalAssignedTeam,
    };
  }

  return eventGenerator();
}
