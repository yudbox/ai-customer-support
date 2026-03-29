import { openai } from "../clients/openai";

// Validate required environment variables at startup
if (!process.env.OPENAI_EMBEDDING_MODEL) {
  throw new Error("OPENAI_EMBEDDING_MODEL is not set in environment");
}

if (!process.env.OPENAI_EMBEDDING_DIMENSIONS) {
  throw new Error("OPENAI_EMBEDDING_DIMENSIONS is not set in environment");
}

// Export configuration constants
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;
export const EMBEDDING_DIMENSIONS = parseInt(
  process.env.OPENAI_EMBEDDING_DIMENSIONS,
);

/**
 * Create embedding vector from text using OpenAI
 * @param text - Text to embed (max ~8191 tokens for text-embedding-3-small)
 * @returns Embedding vector (1536 dimensions by default)
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Format ticket data into embedding text
 * Matches the format used in seed-tickets.ts for consistency
 */
export function formatTicketForEmbedding(
  subject: string,
  body: string,
  category?: string,
): string {
  return `${subject}. ${body}${category ? `. Category: ${category}` : ""}.`;
}
