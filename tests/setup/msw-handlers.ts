/**
 * MSW (Mock Service Worker) handlers for integration tests
 *
 * These handlers intercept HTTP requests to external APIs and return mock responses.
 * This approach is more realistic than mocking at the client level.
 *
 * Uses Fishery + Faker factories for clean, maintainable test data.
 */

import { http, HttpResponse } from "msw";

import {
  openaiChatCompletionFactory,
  createEmbeddingsResponse,
  pineconeUpsertFactory,
  pineconeQueryFactory,
  openaiErrorFactory,
  genericApiErrorFactory,
} from "@/tests/factories";

/**
 * OpenAI API Handlers
 */
export const openaiHandlers = [
  // Chat Completions API
  http.post(
    "https://api.openai.com/v1/chat/completions",
    async ({ request }) => {
      const body = (await request.json()) as {
        messages: Array<{ role: string; content: string }>;
      };
      const lastMessage = body.messages[body.messages.length - 1].content;

      // Generate realistic response using factory
      const completion = openaiChatCompletionFactory.build({
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: `AI analysis of: "${lastMessage.substring(0, 50)}..."`,
            },
            finish_reason: "stop",
          },
        ],
      });

      return HttpResponse.json(completion);
    },
  ),

  // Embeddings API
  http.post("https://api.openai.com/v1/embeddings", async ({ request }) => {
    const body = (await request.json()) as { input: string | string[] };
    const inputs = Array.isArray(body.input) ? body.input : [body.input];

    // Generate embeddings using factory
    const response = createEmbeddingsResponse(inputs.length);

    return HttpResponse.json(response);
  }),
];

/**
 * Pinecone API Handlers
 */
export const pineconeHandlers = [
  // Upsert vectors
  http.post("https://*.pinecone.io/vectors/upsert", async ({ request }) => {
    const body = (await request.json()) as { vectors: unknown[] };

    // Generate upsert response using factory
    const response = pineconeUpsertFactory.build({
      upsertedCount: body.vectors.length,
    });

    return HttpResponse.json(response);
  }),

  // Query vectors
  http.post("https://*.pinecone.io/query", async () => {
    // Generate realistic query results using factory
    const response = pineconeQueryFactory.build();

    return HttpResponse.json(response);
  }),

  // Delete vectors
  http.post("https://*.pinecone.io/vectors/delete", async () => {
    return HttpResponse.json({});
  }),

  // Describe index stats
  http.post("https://*.pinecone.io/describe_index_stats", async () => {
    // Generate stats using factory
    const response = pineconeQueryFactory.build();

    return HttpResponse.json(response);
  }),
];

/**
 * HuggingFace API Handlers
 */
export const huggingfaceHandlers = [
  // Sentiment Analysis
  http.post("https://api-inference.huggingface.co/models/*", async () => {
    // Use factory for realistic sentiment results
    const sentiments = [
      {
        label: "POSITIVE",
        score: 0.85,
      },
      {
        label: "NEGATIVE",
        score: 0.1,
      },
      {
        label: "NEUTRAL",
        score: 0.05,
      },
    ];

    return HttpResponse.json(sentiments);
  }),
];

/**
 * Error Handlers for testing error scenarios
 * Uses factories to generate realistic error responses
 */
export const errorHandlers = {
  openaiError: http.post("https://api.openai.com/v1/chat/completions", () => {
    const error = openaiErrorFactory.build();
    return HttpResponse.json(error, { status: 429 });
  }),

  pineconeError: http.post("https://*.pinecone.io/vectors/upsert", () => {
    const error = genericApiErrorFactory.build();
    return HttpResponse.json(error, { status: 500 });
  }),

  huggingfaceError: http.post(
    "https://api-inference.huggingface.co/models/*",
    () => {
      const error = genericApiErrorFactory.build({
        error: "Model is loading",
        statusCode: 503,
      });
      return HttpResponse.json(error, { status: 503 });
    },
  ),

  networkError: http.post("https://api.openai.com/v1/chat/completions", () => {
    return HttpResponse.error();
  }),
};

/**
 * All default handlers
 */
export const handlers = [
  ...openaiHandlers,
  ...pineconeHandlers,
  ...huggingfaceHandlers,
];
