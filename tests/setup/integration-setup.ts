/**
 * Integration Tests Setup
 * Дополнительная конфигурация для интеграционных тестов
 * Настройка MSW, database mocking, и других интеграционных инструментов
 */

import { TextEncoder, TextDecoder } from "util";

// Add TextEncoder/TextDecoder polyfills for Node.js environment
global.TextEncoder = TextEncoder;
// @ts-expect-error - TextDecoder types mismatch
global.TextDecoder = TextDecoder;

/**
 * Constants for integration tests
 */
const INTEGRATION_TEST_TIMEOUT = 30000; // 30 seconds
const EMBEDDING_DIMENSIONS = 1536; // OpenAI embedding dimensions
const MOCK_EMBEDDING_VALUE = 0.1;

/**
 * Global test timeout для интеграционных тестов
 */
jest.setTimeout(INTEGRATION_TEST_TIMEOUT);

/**
 * Mock database connection для интеграционных тестов
 * В реальных интеграционных тестах можно использовать:
 * - Test database (PostgreSQL в Docker)
 * - In-memory database (SQLite)
 * - Database mocking
 */
jest.mock("@/lib/database/connection", () => ({
  getDataSource: jest.fn(),
  initializeDataSource: jest.fn(),
}));

/**
 * Mock LangGraph Workflow
 * Избегаем проблем с ESM модулями @langchain/langgraph
 */
jest.mock("@/lib/langgraph/workflow", () => ({
  resumeWorkflow: jest.fn(),
  workflow: {},
}));

/**
 * Mock OpenAI client
 * Мокируем наш клиент вместо библиотеки
 */
jest.mock("@/lib/clients/openai", () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: "Mocked AI response",
              },
            },
          ],
        }),
      },
    },
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [
          {
            embedding: Array(EMBEDDING_DIMENSIONS).fill(MOCK_EMBEDDING_VALUE),
          },
        ],
      }),
    },
  },
}));

/**
 * Mock Pinecone client
 */
jest.mock("@/lib/clients/pinecone", () => ({
  pineconeIndex: {
    namespace: jest.fn().mockReturnValue({
      query: jest.fn().mockResolvedValue({
        matches: [],
        namespace: "test-namespace",
      }),
      upsert: jest.fn().mockResolvedValue({}),
    }),
  },
  PINECONE_NAMESPACE: "test-namespace",
}));

/**
 * Mock Hugging Face client
 */
jest.mock("@/lib/clients/huggingface", () => ({
  hf: {
    textClassification: jest.fn().mockResolvedValue([
      {
        label: "NEUTRAL",
        score: 0.7,
      },
      {
        label: "NEGATIVE",
        score: 0.2,
      },
      {
        label: "POSITIVE",
        score: 0.1,
      },
    ]),
  },
}));

/**
 * Mock embeddings service
 */
jest.mock("@/lib/services/embeddings", () => ({
  createEmbedding: jest
    .fn()
    .mockResolvedValue(Array(EMBEDDING_DIMENSIONS).fill(MOCK_EMBEDDING_VALUE)),
  formatTicketForEmbedding: jest.fn().mockReturnValue("formatted text"),
}));

/**
 * Global cleanup после каждого теста
 */
afterEach(() => {
  // Очистка моков после каждого теста
  jest.clearAllMocks();
});

/**
 * Global cleanup после всех тестов
 */
afterAll(() => {
  // Закрытие соединений, очистка ресурсов
  jest.restoreAllMocks();
});

/**
 * Console error/warning suppression для известных предупреждений
 * Можно добавить фильтрацию известных warnings от библиотек
 */
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Игнорируем известные warnings от React Testing Library
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    // Игнорируем известные warnings
    if (
      typeof args[0] === "string" &&
      args[0].includes("componentWillReceiveProps")
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

export {};
