/**
 * Jest Global Setup
 * Runs before all test suites (unit & integration)
 *
 * Purpose:
 * - Add @testing-library/jest-dom matchers
 * - Polyfills for Web APIs (ReadableStream for SSE)
 * - Mock environment variables
 */

import "@testing-library/jest-dom";

// ===========================
// Polyfills for Node.js
// ===========================

// ReadableStream for SSE (Server-Sent Events) testing
// Required for /api/tickets/stream route tests
import { ReadableStream } from "stream/web";
global.ReadableStream = ReadableStream;

// Note: Headers, Response, Request are available in Node.js 18+
// If tests fail with "undefined", uncomment polyfills below

// ===========================
// Mock Environment Variables
// ===========================

// AI Services
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.OPENAI_MODEL = "gpt-3.5-turbo-0125";
process.env.OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
process.env.OPENAI_EMBEDDING_DIMENSIONS = "1536";

process.env.HUGGINGFACE_API_KEY = "test-hf-key";
process.env.HUGGINGFACE_MODEL =
  "cardiffnlp/twitter-roberta-base-sentiment-latest";

process.env.PINECONE_API_KEY = "test-pinecone-key";
process.env.PINECONE_INDEX_NAME = "test-index";
process.env.PINECONE_NAMESPACE = "test-namespace";

// Database (mocked in tests, not used for unit tests)
process.env.POSTGRES_HOST = "localhost";
process.env.POSTGRES_PORT = "5432";
process.env.POSTGRES_USER = "test";
process.env.POSTGRES_PASSWORD = "test";
process.env.POSTGRES_DATABASE = "test_db";

// Next.js
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";
