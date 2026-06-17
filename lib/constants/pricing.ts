/**
 * API pricing constants used for cost estimation.
 * Costs are calculated per-ticket (not per actual token log).
 */

// gpt-3.5-turbo: ~800 tokens × ($0.0005 input + $0.0015 output) / 1K
export const CLASSIFICATION_COST_PER_TICKET = 0.0008;

// text-embedding-3-small: ~150 tokens × $0.00002 / 1K
export const EMBEDDING_COST_PER_TICKET = 0.000003;

// Derived: total cost per ticket
export const COST_PER_TICKET =
  CLASSIFICATION_COST_PER_TICKET + EMBEDDING_COST_PER_TICKET;

// Approximate cost of a human agent handling one support ticket
export const HUMAN_AGENT_COST_PER_TICKET_USD = 7.5;

export const PRICING_LABELS = {
  classification: "GPT-3.5 Classification",
  embedding: "Embeddings (text-embedding-3-small)",
  sentiment: "HuggingFace Sentiment",
  vectorSearch: "Pinecone Vector Search",
} as const;
