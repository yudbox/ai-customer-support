/**
 * Agent Message Formatters
 *
 * Форматирование результатов каждого агента для отображения в UI
 * Использует mapper pattern вместо длинных if-else блоков
 */

import { WorkflowStep, TicketStatus } from "@/lib/types/common";

// ===========================
// TYPES
// ===========================

/**
 * Type для функций-форматтеров
 * Принимает nodeData от агента, возвращает строку для UI
 */
type AgentFormatter = (nodeData: any, initialState?: any) => string;

// ===========================
// FORMATTERS
// ===========================

/**
 * Intake Agent formatter
 */
function formatIntakeMessage(nodeData: any): string {
  if (!nodeData || !("intake" in nodeData)) {
    return "Analysis complete";
  }

  const intake = nodeData.intake;
  if (!intake) return "Analysis complete";

  const parts: string[] = [];

  if (intake.extracted_order_number) {
    parts.push(`Order #${intake.extracted_order_number}`);
  }

  if (intake.keywords && intake.keywords.length > 0) {
    parts.push(`Keywords: ${intake.keywords.slice(0, 3).join(", ")}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "Analysis complete";
}

/**
 * Classification Agent formatter
 */
function formatClassificationMessage(nodeData: any): string {
  if (!nodeData || !("classification" in nodeData)) {
    return "Analysis complete";
  }

  const classification = nodeData.classification;
  if (!classification) return "Analysis complete";

  let message = `Category: ${classification.category} → ${classification.subcategory}`;

  if (classification.confidence) {
    message += ` (${(classification.confidence * 100).toFixed(0)}%)`;
  }

  return message;
}

/**
 * Sentiment Agent formatter
 */
function formatSentimentMessage(nodeData: any): string {
  if (!nodeData || !("sentiment" in nodeData)) {
    return "Analysis complete";
  }

  const sentiment = nodeData.sentiment;
  if (!sentiment) return "Analysis complete";

  return `Sentiment: ${sentiment.emoji} ${sentiment.label} (${(sentiment.score * 100).toFixed(0)}%)`;
}

/**
 * Customer Lookup Agent formatter
 */
function formatCustomerMessage(nodeData: any): string {
  if (!nodeData || !("customer" in nodeData)) {
    return "Analysis complete";
  }

  const customer = nodeData.customer;

  if (!customer || !customer.found) {
    return "New customer - no history found";
  }

  const parts: string[] = [];
  parts.push(`Tier: ${customer.tier}`);

  if (customer.total_orders !== undefined) {
    parts.push(`Orders: ${customer.total_orders}`);
  }

  if (customer.lifetime_value !== undefined) {
    parts.push(`LTV: $${customer.lifetime_value.toFixed(2)}`);
  }

  return parts.join(" | ");
}

/**
 * Resolution Search (RAG) Agent formatter
 */
function formatRAGMessage(nodeData: any): string {
  if (!nodeData || !("rag" in nodeData)) {
    return "Analysis complete";
  }

  const rag = nodeData.rag;

  if (!rag || !rag.similar_tickets || rag.similar_tickets.length === 0) {
    return "No similar tickets found";
  }

  let message = `Found ${rag.similar_tickets.length} similar ticket(s)`;

  if (rag.suggested_solution) {
    message += " | Solution suggested";
  }

  return message;
}

/**
 * Priority Agent formatter
 */
function formatPriorityMessage(nodeData: any): string {
  if (!nodeData || !("priority" in nodeData)) {
    return "Analysis complete";
  }

  const priority = nodeData.priority;
  if (!priority) return "Analysis complete";

  return `${priority.emoji} ${priority.level} (${priority.score}/100) | SLA: ${priority.sla_minutes} min`;
}

/**
 * Finalize Ticket formatter
 */
function formatFinalizeMessage(nodeData: any): string {
  const needsApproval = nodeData?.needs_approval;

  return needsApproval
    ? "⏸️  Pending manager approval"
    : "✅ Auto-assigned to support team";
}

/**
 * Save to Database formatter
 */
function formatSaveMessage(nodeData: any, initialState?: any): string {
  const status = nodeData?.status || initialState?.status;

  return status === TicketStatus.PENDING_APPROVAL
    ? "💾 Saved - awaiting manager review"
    : "💾 Saved - ticket ready for team assignment";
}

// ===========================
// MAPPER
// ===========================

/**
 * Mapper: каждый workflow step → своя функция форматирования
 * Type-safe с WorkflowStep enum
 */
const AGENT_MESSAGE_FORMATTERS: Partial<Record<WorkflowStep, AgentFormatter>> =
  {
    [WorkflowStep.INTAKE_AGENT]: formatIntakeMessage,
    [WorkflowStep.CLASSIFICATION_AGENT]: formatClassificationMessage,
    [WorkflowStep.SENTIMENT_AGENT]: formatSentimentMessage,
    [WorkflowStep.CUSTOMER_AGENT]: formatCustomerMessage,
    [WorkflowStep.RESOLUTION_SEARCH_AGENT]: formatRAGMessage,
    [WorkflowStep.PRIORITY_AGENT]: formatPriorityMessage,
    [WorkflowStep.FINALIZE_TICKET]: formatFinalizeMessage,
    [WorkflowStep.SAVE_TO_DATABASE]: formatSaveMessage,
  };

// ===========================
// PUBLIC API
// ===========================

/**
 * Главная функция - форматирует сообщение для любого агента
 *
 * @param nodeName - название node (intakeAgent, classificationAgent, etc.)
 * @param nodeData - данные от агента
 * @param initialState - начальный state (optional, нужен для saveToDatabase)
 * @returns Отформатированное сообщение для UI
 *
 * @example
 * const message = formatAgentMessage("intakeAgent", { intake: { ... } })
 * // "Order #12345 | Keywords: refund, urgent"
 */
export function formatAgentMessage(
  nodeName: string,
  nodeData: any,
  initialState?: any,
): string {
  const formatter = AGENT_MESSAGE_FORMATTERS[nodeName as WorkflowStep];

  if (!formatter) {
    return "Analysis complete"; // Default fallback
  }

  return formatter(nodeData, initialState);
}
