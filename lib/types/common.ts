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
 * Agent execution status (node completion status)
 */
export enum AgentExecutionStatus {
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped",
}

/**
 * Workflow step names (for SSE streaming)
 */
export enum WorkflowStep {
  INTAKE_AGENT = "intakeAgent",
  CLASSIFICATION_AGENT = "classificationAgent",
  SENTIMENT_AGENT = "sentimentAgent",
  CUSTOMER_AGENT = "customerAgent",
  RESOLUTION_SEARCH_AGENT = "resolutionSearchAgent",
  PRIORITY_AGENT = "priorityAgent",
  WAIT_APPROVAL = "waitApproval", // ⏸️ Special node for HITL interrupt
  FINALIZE_TICKET = "finalizeTicket",
  SAVE_TO_DATABASE = "saveToDatabase",
  COMPLETE = "complete",
}

/**
 * Категории тикетов
 */
export enum TicketCategory {
  ACCOUNT_ISSUES = "Account Issues",
  PAYMENT_PROBLEMS = "Payment Problems",
  PRODUCT_QUALITY = "Product Quality",
  REFUND_REQUESTS = "Refund Requests",
  SHIPPING_DELAYS = "Shipping Delays",
  TECHNICAL_ISSUES = "Technical Issues",
}

/**
 * Подкатегории тикетов (subcategories)
 */
export enum TicketSubcategory {
  // Account Issues
  CANNOT_LOGIN = "Cannot Login",
  EMAIL_CHANGE_REQUEST = "Email Change Request",
  PASSWORD_RESET = "Password Reset",

  // Payment Problems
  CARD_DECLINED = "Card Declined",
  DOUBLE_CHARGE = "Double Charge",
  PAYMENT_FAILED = "Payment Failed",
  BILLING_ISSUE = "Billing Issue",

  // Product Quality
  MISSING_PARTS = "Missing Parts",
  PRODUCT_DAMAGED = "Product Damaged on Arrival",
  DEFECTIVE_PRODUCT = "Defective Product",

  // Refund Requests
  CHANGED_MIND = "Changed Mind",
  DEFECTIVE_PRODUCT_RETURN = "Defective Product Return",
  ORDER_CANCELLATION = "Order Cancellation",

  // Shipping Delays
  PACKAGE_LOST = "Package Lost",
  WRONG_ADDRESS = "Wrong Address",
  DELAYED_DELIVERY = "Delayed Delivery",
  NOT_RECEIVED = "Not Received",

  // Technical Issues
  APP_NOT_LOADING = "App Not Loading",
  FEATURE_NOT_WORKING = "Feature Not Working",
  CHECKOUT_ISSUE = "Checkout Issue",
  WEBSITE_BUG = "Website Bug",
}

/**
 * Уровень приоритета
 */
export enum PriorityLevel {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

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
export enum CustomerTier {
  VIP = "VIP",
  REGULAR = "Regular",
  NEW = "New",
}

/**
 * Support team names (from database)
 */
export enum TeamName {
  TECHNICAL_SUPPORT = "Technical Support",
  BILLING_PAYMENTS = "Billing & Payments",
  RETURNS_REFUNDS = "Returns & Refunds",
  PRODUCT_ISSUES = "Product Issues",
  SHIPPING_DELIVERY = "Shipping & Delivery",
  ACCOUNT_MANAGEMENT = "Account Management",
}

/**
 * Support team codes (for UI dropdowns and API)
 */
export enum TeamCode {
  TECHNICAL_SUPPORT = "technical_support",
  BILLING_TEAM = "billing_team",
  RETURNS_TEAM = "returns_team",
  PRODUCT_ISSUES = "product_issues",
  SHIPPING_TEAM = "shipping_team",
  ACCOUNT_MANAGEMENT = "account_management",
  // Legacy codes
  CUSTOMER_SERVICE = "customer_service", // Fallback to Technical Support
  LOGISTICS_TEAM = "logistics_team", // Alias for Shipping & Delivery
  BILLING = "billing", // Alias for Billing & Payments
  ESCALATION = "escalation", // Escalation goes to Technical Support
}

/**
 * Query parameter names for ticket workflow redirects
 */
export const QUERY_PARAMS = {
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

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
