/**
 * Agent Output Types
 *
 * Типы выходных данных для каждого из 6 агентов
 */

import type {
  TicketCategory,
  SentimentLabel,
  CustomerTier,
  PriorityLevel,
  SupportTeam,
} from "./common";

// ===========================
// AGENT 1: INTAKE
// ===========================

/**
 * Intake Agent Output
 * Парсит и извлекает данные из сырого email
 */
export interface IntakeOutput {
  customer_email: string; // normalized (lowercase, trimmed)
  subject: string;
  body: string;
  extracted_order_number?: string; // "12345"
  extracted_tracking_number?: string; // "1Z999AA10123456784"
  keywords: string[]; // ["delayed", "angry", "refund"]
  message_length: number;
  has_attachments: boolean;
  parsed_at: string; // ISO timestamp
}

// ===========================
// AGENT 2: CLASSIFICATION
// ===========================

/**
 * Classification Agent Output
 * Определяет категорию проблемы через GPT-4
 */
export interface ClassificationOutput {
  category: TicketCategory;
  subcategory?: string; // "Delayed Delivery", "Wrong Item", etc.
  confidence: number; // 0-1 (от GPT-4)
}

// ===========================
// AGENT 3: SENTIMENT
// ===========================

/**
 * Sentiment Agent Output
 * Анализирует эмоцию клиента через HuggingFace
 */
export interface SentimentOutput {
  label: SentimentLabel;
  score: number; // 0-1
  emoji: "😊" | "😐" | "😡";
}

// ===========================
// AGENT 4: CUSTOMER LOOKUP
// ===========================

/**
 * Customer Lookup Agent Output
 * Ищет клиента в PostgreSQL
 */
export interface CustomerLookupOutput {
  found: boolean;
  customer_id?: string; // UUID
  tier?: CustomerTier;
  total_orders?: number;
  lifetime_value?: number;
  avg_sentiment?: number; // historical average
}

// ===========================
// AGENT 5: RAG
// ===========================

/**
 * RAG Agent Output
 * Ищет похожие тикеты в Pinecone
 */
export interface RAGOutput {
  similar_tickets: Array<{
    id: string; // UUID from PostgreSQL
    subject: string;
    category?: string;
    resolution: string;
    similarity: number; // 0-1
  }>;
  suggested_solution?: string;
}

// ===========================
// AGENT 6: PRIORITY
// ===========================

/**
 * Priority Agent Output
 * Вычисляет priority score
 */
export interface PriorityOutput {
  score: number; // 0-100
  level: PriorityLevel;
  emoji: "🚨" | "🔴" | "🟡" | "🟢";
  sla_minutes: number; // 15, 60, 240, 1440
  reasoning: string; // "VIP + angry + delayed 10 days"
}

// ===========================
// ROUTING / ASSIGNMENT
// ===========================

/**
 * Assignment Output
 * Роутинг тикета к команде
 */
export interface AssignmentOutput {
  team: SupportTeam;
  assignee?: string; // "@senior-logistics"
  slack_channel: string; // "#support-critical"
}
