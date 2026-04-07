/**
 * API Response Factories
 *
 * Централизованный экспорт всех фабрик для генерации реалистичных ответов от внешних API
 * используя Fishery + Faker для чистоты и поддерживаемости тестов.
 */

// OpenAI
export * from "./openai-chat.factory";
export * from "./openai-embedding.factory";
export * from "./openai-error.factory";

// Pinecone
export * from "./pinecone-upsert.factory";
export * from "./pinecone-match.factory";
export * from "./pinecone-query.factory";

// HuggingFace
export * from "./huggingface-sentiment.factory";

// Generic
export * from "./generic-error.factory";
