import { pineconeIndex, PINECONE_NAMESPACE } from "../../clients/pinecone";
import {
  createEmbedding,
  formatTicketForEmbedding,
} from "../../services/embeddings";

import type { WorkflowStateType } from "../state/WorkflowState";

/**
 * Node 5: Resolution Search Agent
 * Searches for similar resolved tickets in Pinecone vector database
 * Returns top-3 matches with resolutions to avoid reinventing solutions
 */
export async function resolutionSearchNode(
  state: WorkflowStateType,
): Promise<Partial<WorkflowStateType>> {
  try {
    const { subject, body } = state.input;
    const category = state.classification?.category;

    // 1. Создать embedding из subject + body + category (БЕЗ resolution!)
    const embeddingText = formatTicketForEmbedding(subject, body, category);

    const embedding = await createEmbedding(embeddingText);

    // 2. Поиск похожих tickets в Pinecone namespace "support-tickets"
    const queryResponse = await pineconeIndex
      .namespace(PINECONE_NAMESPACE)
      .query({
        vector: embedding,
        topK: 3,
        includeMetadata: true,
      });

    // 3. Извлечь similar tickets из результатов (фильтруем битые данные)
    const similar_tickets = queryResponse.matches
      .filter((match) => {
        if (!match.id || typeof match.id !== "string") {
          return false;
        }

        if (!match.metadata?.subject || !match.metadata?.resolution) {
          return false;
        }

        return true;
      })
      .map((match) => ({
        id: match.id, // Keep as UUID string
        subject: match.metadata!.subject as string,
        category: match.metadata!.category as string | undefined,
        resolution: match.metadata!.resolution as string,
        similarity: match.score ?? 0,
      }));

    if (similar_tickets.length === 0) {
      return {
        rag: {
          similar_tickets: [],
          suggested_solution: undefined,
        },
      };
    }

    // 4. Опционально: создать suggested_solution из топ-1 результата
    let suggested_solution: string | undefined;
    if (similar_tickets.length > 0 && similar_tickets[0].similarity > 0.8) {
      suggested_solution = similar_tickets[0].resolution;
    }

    return {
      rag: {
        similar_tickets,
        suggested_solution,
      },
    };
  } catch (error) {
    return {
      errors: [
        {
          agent: "rag",
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}
