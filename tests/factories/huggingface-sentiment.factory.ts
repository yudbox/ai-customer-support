/**
 * HuggingFace Sentiment Factory
 *
 * Фабрика для генерации реалистичных ответов от HuggingFace Sentiment Analysis API
 */

import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

/**
 * Types
 */
export interface HuggingFaceSentimentLabel {
  label: string;
  score: number;
}

/**
 * Factory
 */
export const huggingfaceSentimentFactory = Factory.define<
  HuggingFaceSentimentLabel[]
>(() => {
  const sentiments = ["POSITIVE", "NEGATIVE", "NEUTRAL"];
  const scores = faker.helpers.arrayElements(
    sentiments.map(() =>
      faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
    ),
    3,
  );

  // Normalize scores to sum to 1
  const total = scores.reduce((a, b) => a + b, 0);
  const normalizedScores = scores.map((s) =>
    parseFloat((s / total).toFixed(2)),
  );

  return sentiments
    .map((label, index) => ({
      label,
      score: normalizedScores[index],
    }))
    .sort((a, b) => b.score - a.score); // Sort by score descending
});

/**
 * Helper функция для создания сентимент анализа с доминирующим сентиментом
 */
export function createSentimentResponse(
  dominantSentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL",
): HuggingFaceSentimentLabel[] {
  const sentiments = ["POSITIVE", "NEGATIVE", "NEUTRAL"];
  const dominantScore = faker.number.float({
    min: 0.7,
    max: 0.95,
    fractionDigits: 2,
  });
  const remainingScore = 1 - dominantScore;

  return sentiments
    .map((label) => ({
      label,
      score:
        label === dominantSentiment
          ? dominantScore
          : faker.number.float({
              min: 0,
              max: remainingScore / 2,
              fractionDigits: 2,
            }),
    }))
    .sort((a, b) => b.score - a.score);
}
