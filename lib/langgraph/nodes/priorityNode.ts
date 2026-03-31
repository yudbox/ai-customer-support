/**
 * Agent 6: Priority Agent
 *
 * Calculates ticket priority score based on:
 * - Customer tier (VIP/Regular/New)
 * - Sentiment (ANGRY/NEUTRAL/POSITIVE)
 * - Category urgency
 * - RAG confidence (similar tickets found)
 *
 * Formula:
 * score = BASE (50)
 *       + TIER_BOOST (VIP: +40, Regular: +20, New: 0)
 *       + SENTIMENT_PENALTY (ANGRY: -30)
 *       + CATEGORY_URGENCY (Technical: +15, Payment: +20, Shipping: +10)
 *       + RAG_MODIFIER (based on similarity and consistency)
 *
 * Override rules:
 * - ANGRY sentiment → minimum 60 (MEDIUM)
 * - Technical + ANGRY → minimum 75 (HIGH)
 * - VIP + ANGRY → minimum 75 (HIGH)
 * - Revenue-blocking categories (Payment, Checkout) → +10
 */

import type { WorkflowStateType } from "@/lib/langgraph/state/WorkflowState";
import type { PriorityOutput } from "@/lib/types/agents";
import {
  SentimentLabel,
  TicketSubcategory,
  TicketCategory,
  CustomerTier,
  PriorityLevel,
  AgentExecutionStatus,
} from "@/lib/types/common";

// ===========================
// SCORING CONSTANTS
// ===========================

// Base score
const BASE_SCORE = 50;

// Customer tier boosts
const TIER_BOOST_VIP = 40;
const TIER_BOOST_REGULAR = 20;
const TIER_BOOST_NEW = 0;

// Sentiment modifiers
const SENTIMENT_ANGRY_PENALTY = -30;
const SENTIMENT_POSITIVE_BONUS = 10;
const SENTIMENT_NEUTRAL_MODIFIER = 0;

// Category urgency points
const URGENCY_PAYMENT = 20;
const URGENCY_TECHNICAL = 15;
const URGENCY_SHIPPING = 10;
const URGENCY_REFUND = 5;

// RAG confidence modifiers
const RAG_SELF_SERVICE_AVAILABLE = -20;
const RAG_HIGH_SIMILARITY = -10;
const RAG_MEDIUM_SIMILARITY = 0;
const RAG_LOW_SIMILARITY = 10;
const RAG_NO_TICKETS = 10;
const RAG_CATEGORY_CONSISTENCY_BONUS = -5;

// RAG similarity thresholds
const SIMILARITY_THRESHOLD_HIGH = 0.7;
const SIMILARITY_THRESHOLD_MEDIUM = 0.5;

// Override rules
const OVERRIDE_ANGRY_MINIMUM = 60;
const OVERRIDE_TECHNICAL_ANGRY_MINIMUM = 75;
const OVERRIDE_REVENUE_BLOCKING_BONUS = 10;
const MAX_SCORE = 100;

// Priority level thresholds
const THRESHOLD_CRITICAL = 90;
const THRESHOLD_HIGH = 70;
const THRESHOLD_MEDIUM = 40;

// SLA times (minutes)
const SLA_CRITICAL = 15;
const SLA_HIGH = 60;
const SLA_MEDIUM = 240;
const SLA_LOW = 1440;

export async function priorityNode(state: WorkflowStateType): Promise<{
  priority: PriorityOutput;
  needs_approval: boolean;
  status: AgentExecutionStatus;
}> {
  console.log("🔵 Agent 6: Priority Agent - Starting...");

  const { customer, sentiment, classification, rag } = state;

  // ===========================
  // 1. BASE SCORE
  // ===========================
  let score = BASE_SCORE;
  const reasoning: string[] = [];

  // ===========================
  // 2. CUSTOMER TIER BOOST
  // ===========================
  let tierBoost = 0;
  if (customer?.tier === CustomerTier.VIP) {
    tierBoost = TIER_BOOST_VIP;
    reasoning.push("VIP customer");
  } else if (customer?.tier === CustomerTier.REGULAR) {
    tierBoost = TIER_BOOST_REGULAR;
    reasoning.push("Regular customer");
  } else {
    tierBoost = TIER_BOOST_NEW;
    reasoning.push("New customer");
  }
  score += tierBoost;

  // ===========================
  // 3. SENTIMENT PENALTY/BONUS
  // ===========================
  let sentimentModifier = 0;
  if (sentiment?.label === SentimentLabel.ANGRY) {
    sentimentModifier = SENTIMENT_ANGRY_PENALTY;
    reasoning.push("ANGRY sentiment");
  } else if (sentiment?.label === SentimentLabel.POSITIVE) {
    sentimentModifier = SENTIMENT_POSITIVE_BONUS;
    reasoning.push("Positive sentiment");
  }
  // NEUTRAL = 0 (no change)
  score += sentimentModifier;

  // ===========================
  // 4. CATEGORY URGENCY
  // ===========================
  let categoryUrgency = 0;
  const category = classification?.category;
  const subcategory = classification?.subcategory;

  if (category === TicketCategory.PAYMENT_PROBLEMS) {
    categoryUrgency = URGENCY_PAYMENT;
    reasoning.push("Payment issue (high urgency)");
  } else if (category === TicketCategory.TECHNICAL_ISSUES) {
    categoryUrgency = URGENCY_TECHNICAL;
    reasoning.push("Technical issue");
  } else if (category === TicketCategory.SHIPPING_DELAYS) {
    categoryUrgency = URGENCY_SHIPPING;
    reasoning.push("Shipping concern");
  } else if (category === TicketCategory.REFUND_REQUESTS) {
    categoryUrgency = URGENCY_REFUND;
    reasoning.push("Refund/Return request");
  }

  score += categoryUrgency;

  // ===========================
  // 5. RAG CONFIDENCE MODIFIER
  // ===========================
  let ragModifier = 0;

  if (rag?.suggested_solution) {
    // Self-service solution available (similarity > 80%)
    ragModifier = RAG_SELF_SERVICE_AVAILABLE;
    reasoning.push("Self-service solution available");
  } else if (rag?.similar_tickets && rag.similar_tickets.length > 0) {
    const topSimilarity = rag.similar_tickets[0].similarity;

    if (topSimilarity >= SIMILARITY_THRESHOLD_HIGH) {
      // 70-79% - good match
      ragModifier = RAG_HIGH_SIMILARITY;
      reasoning.push(
        `Similar tickets found (${(topSimilarity * 100).toFixed(0)}% match)`,
      );
    } else if (topSimilarity >= SIMILARITY_THRESHOLD_MEDIUM) {
      // 50-69% - medium match (neutral)
      ragModifier = RAG_MEDIUM_SIMILARITY;
      reasoning.push(
        `Related tickets available (${(topSimilarity * 100).toFixed(0)}% match)`,
      );
    } else {
      // <50% - new problem
      ragModifier = RAG_LOW_SIMILARITY;
      reasoning.push("Unique issue, needs expert review");
    }

    // Consistency bonus: all tickets from same category
    const categories = rag.similar_tickets
      .map((t: { category?: string }) => t.category)
      .filter(Boolean);
    const allSameCategory =
      categories.length > 0 &&
      categories.every((c: string | undefined) => c === categories[0]);

    if (allSameCategory) {
      ragModifier += RAG_CATEGORY_CONSISTENCY_BONUS;
      reasoning.push(`consistent category: ${categories[0]}`);
    }
  } else {
    // No similar tickets in database
    ragModifier = RAG_NO_TICKETS;
    reasoning.push("No similar tickets found");
  }

  score += ragModifier;

  // ===========================
  // 6. OVERRIDE RULES
  // ===========================

  // Rule 1: ANGRY sentiment → minimum 60 (MEDIUM)
  if (sentiment?.label === SentimentLabel.ANGRY) {
    score = Math.max(score, OVERRIDE_ANGRY_MINIMUM);
  }

  // Rule 2: Technical + ANGRY → minimum 75 (HIGH)
  if (
    category === TicketCategory.TECHNICAL_ISSUES &&
    sentiment?.label === SentimentLabel.ANGRY
  ) {
    score = Math.max(score, OVERRIDE_TECHNICAL_ANGRY_MINIMUM);
  }

  // Rule 3: VIP + ANGRY → minimum 75 (HIGH)
  if (
    customer?.tier === CustomerTier.VIP &&
    sentiment?.label === SentimentLabel.ANGRY
  ) {
    score = Math.max(score, OVERRIDE_TECHNICAL_ANGRY_MINIMUM); // 75
    reasoning.push("VIP customer with ANGRY sentiment - priority escalated");
  }

  // Rule 4: Revenue-blocking issues → +10
  if (
    category === TicketCategory.PAYMENT_PROBLEMS ||
    subcategory === TicketSubcategory.CHECKOUT_ISSUE ||
    subcategory === TicketSubcategory.PAYMENT_FAILED
  ) {
    score += OVERRIDE_REVENUE_BLOCKING_BONUS;
    reasoning.push("Revenue-blocking issue");
  }

  // Cap score at 100
  score = Math.min(score, MAX_SCORE);

  // ===========================
  // 7. MAP SCORE TO PRIORITY LEVEL
  // ===========================

  let level: PriorityLevel;
  let emoji: "🚨" | "🔴" | "🟡" | "🟢";
  let sla_minutes: number;

  if (score >= THRESHOLD_CRITICAL) {
    level = PriorityLevel.CRITICAL;
    emoji = "🚨";
    sla_minutes = SLA_CRITICAL;
  } else if (score >= THRESHOLD_HIGH) {
    level = PriorityLevel.HIGH;
    emoji = "🔴";
    sla_minutes = SLA_HIGH;
  } else if (score >= THRESHOLD_MEDIUM) {
    level = PriorityLevel.MEDIUM;
    emoji = "🟡";
    sla_minutes = SLA_MEDIUM;
  } else {
    level = PriorityLevel.LOW;
    emoji = "🟢";
    sla_minutes = SLA_LOW;
  }

  const reasoningText = reasoning.join(", ");

  console.log(
    `✅ Agent 6: Priority calculated - ${level} ${emoji} (${score}/100)`,
  );
  console.log(`   - Reasoning: ${reasoningText}`);
  console.log(`   - SLA: ${sla_minutes} minutes`);
  console.log(
    `   - Breakdown: Base(${BASE_SCORE}) + Tier(${tierBoost}) + Sentiment(${sentimentModifier}) + Category(${categoryUrgency}) + RAG(${ragModifier})`,
  );

  // Check if human approval is needed
  const needsApproval = score >= THRESHOLD_HIGH; // Score >= 70 (HIGH or CRITICAL)

  if (needsApproval) {
    console.log("⚠️  HIGH/CRITICAL priority - requires manager approval");
  }

  return {
    priority: {
      score,
      level,
      emoji,
      sla_minutes,
      reasoning: reasoningText,
    },
    needs_approval: needsApproval,
    status: AgentExecutionStatus.COMPLETED,
  };
}
