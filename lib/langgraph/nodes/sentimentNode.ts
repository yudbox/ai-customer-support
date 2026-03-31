import type { WorkflowStateType } from "../state/WorkflowState";
import { SentimentLabel } from "@/lib/types/common";
import { hf } from "@/lib/clients/huggingface";

/**
 * Маппинг HuggingFace labels на наши SentimentLabel
 * HuggingFace возвращает: positive, neutral, negative (3 класса)
 * Мы мапим на: POSITIVE, NEUTRAL, ANGRY
 */
const SENTIMENT_MAP: Record<string, SentimentLabel> = {
  POSITIVE: SentimentLabel.POSITIVE,
  NEUTRAL: SentimentLabel.NEUTRAL,
  NEGATIVE: SentimentLabel.ANGRY, // NEGATIVE -> ANGRY для customer support
};

/**
 * Emoji для каждого sentiment
 */
const SENTIMENT_EMOJI = {
  [SentimentLabel.POSITIVE]: "😊",
  [SentimentLabel.NEUTRAL]: "😐",
  [SentimentLabel.ANGRY]: "😡",
} as const;

/**
 * Node 3: Sentiment Agent
 * Использует HuggingFace Inference SDK для анализа эмоций
 */
export async function sentimentNode(
  state: WorkflowStateType,
): Promise<Partial<WorkflowStateType>> {
  console.log("🔵 Agent 3: Sentiment Agent - Starting...");

  const ticketText = `${state.input.subject}\n${state.input.body}`;

  // Validate required environment variable
  const model = process.env.HUGGINGFACE_MODEL;

  if (!model) {
    throw new Error("HUGGINGFACE_MODEL is not set in environment variables");
  }

  try {
    // Call HuggingFace classification API using SDK
    const result = await hf.textClassification({
      model,
      inputs: ticketText,
    });

    if (!result || result.length === 0) {
      throw new Error("Invalid response from HuggingFace API");
    }

    // HuggingFace возвращает POSITIVE/NEGATIVE
    // Мапим на наши labels: POSITIVE, NEUTRAL, ANGRY
    const topSentiment = result[0];
    const rawLabel = topSentiment.label.toUpperCase();
    const score = topSentiment.score;

    // Мапим HuggingFace label на SentimentLabel enum
    const label = SENTIMENT_MAP[rawLabel] ?? SentimentLabel.NEUTRAL;
    const emoji = SENTIMENT_EMOJI[label];

    console.log(
      `✅ Agent 3: Sentiment detected - ${label} (${score.toFixed(2)})`,
    );

    return {
      sentiment: {
        label,
        score,
        emoji,
      },
    };
  } catch (error) {
    console.error("❌ Agent 3: Sentiment analysis failed:", error);

    // Fallback на NEUTRAL при ошибке
    return {
      sentiment: {
        label: SentimentLabel.NEUTRAL,
        score: 0.5,
        emoji: SENTIMENT_EMOJI[SentimentLabel.NEUTRAL],
      },
    };
  }
}
