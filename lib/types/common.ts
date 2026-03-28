/**
 * Common Shared Types
 *
 * Общие типы, используемые во всем приложении
 */

// ===========================
// INPUT TYPES
// ===========================

/**
 * Начальный input от клиента (из формы)
 */
export interface CustomerTicketInput {
  email: string;
  subject: string;
  body: string;
  attachments?: string[]; // URLs или file paths (опционально)
}

// ===========================
// ENUMS & CONSTANTS
// ===========================

/**
 * Статус тикета в workflow (enum)
 */
export enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  PENDING_APPROVAL = "pending_approval",
  RESOLVED = "resolved",
  CLOSED = "closed",
  REJECTED = "rejected",
}

/**
 * Категории тикетов
 */
export type TicketCategory =
  | "Account Issues"
  | "Payment Problems"
  | "Product Quality"
  | "Refund Requests"
  | "Shipping Delays"
  | "Technical Issues";

/**
 * Уровень приоритета
 */
export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

/**
 * Sentiment labels enum
 */
export enum SentimentLabel {
  POSITIVE = "POSITIVE",
  NEUTRAL = "NEUTRAL",
  ANGRY = "ANGRY", // Maps from HuggingFace NEGATIVE
}

/**
 * Customer tiers
 */
export type CustomerTier = "VIP" | "Regular" | "New";

/**
 * Support teams
 */
export type SupportTeam = "Logistics" | "Returns" | "Support" | "Technical";

// ===========================
// UTILITY TYPES
// ===========================

/**
 * Error object для tracking
 */
export interface AgentError {
  agent: string;
  message: string;
  timestamp: string;
}
