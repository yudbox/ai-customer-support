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
  console.log("🔵 Agent 5: Resolution Search Agent - Starting...");

  try {
    const { subject, body } = state.input;
    const category = state.classification?.category;

    console.log(
      `   - Subject: "${subject.substring(0, 50)}${subject.length > 50 ? "..." : ""}"`,
    );
    console.log(`   - Category: ${category || "N/A"}`);

    // 1. Создать embedding из subject + body + category (БЕЗ resolution!)
    const embeddingText = formatTicketForEmbedding(subject, body, category);

    console.log(`   - Creating embedding (${embeddingText.length} chars)...`);

    const embedding = await createEmbedding(embeddingText);

    // 2. Поиск похожих tickets в Pinecone namespace "support-tickets"
    console.log(`   - Querying Pinecone namespace: "${PINECONE_NAMESPACE}"...`);

    const queryResponse = await pineconeIndex
      .namespace(PINECONE_NAMESPACE)
      .query({
        vector: embedding,
        topK: 3,
        includeMetadata: true,
      });

    console.log(
      `   - Pinecone returned ${queryResponse.matches.length} matches`,
    );

    // 3. Извлечь similar tickets из результатов (фильтруем битые данные)
    const similar_tickets = queryResponse.matches
      .filter((match) => {
        if (!match.id || typeof match.id !== "string") {
          console.warn(`   ⚠️  Skipping match: invalid or missing ticket ID`);
          return false;
        }

        if (!match.metadata?.subject || !match.metadata?.resolution) {
          console.warn(`   ⚠️  Skipping ticket ${match.id}: missing metadata`);
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
      console.log("⚠️ Agent 5: No similar resolutions found");
      return {
        rag: {
          similar_tickets: [],
          suggested_solution: undefined,
        },
      };
    }

    console.log(
      `✅ Agent 5: Found ${similar_tickets.length} similar ticket(s)`,
    );

    // Логируем топ-3 результата
    similar_tickets.forEach((ticket, index) => {
      console.log(
        `   ${index + 1}. [${(ticket.similarity * 100).toFixed(1)}%] "${ticket.subject.substring(0, 40)}${ticket.subject.length > 40 ? "..." : ""}"`,
      );
    });

    // 4. Опционально: создать suggested_solution из топ-1 результата
    let suggested_solution: string | undefined;
    if (similar_tickets.length > 0 && similar_tickets[0].similarity > 0.8) {
      suggested_solution = similar_tickets[0].resolution;
      console.log(
        `   💡 High confidence match (${(similar_tickets[0].similarity * 100).toFixed(1)}%)`,
      );
      console.log(
        `   - Suggested: "${suggested_solution.substring(0, 60)}${suggested_solution.length > 60 ? "..." : ""}"`,
      );
    }

    return {
      rag: {
        similar_tickets,
        suggested_solution,
      },
    };
  } catch (error) {
    console.error("❌ Agent 5: Resolution search failed:", error);

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
