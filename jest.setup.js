/**
 * Jest Global Setup
 * Runs before all test suites (unit & integration)
 *
 * Purpose:
 * - Add @testing-library/jest-dom matchers
 * - Add jest-axe accessibility matchers (EU Directive 2019/882 compliance)
 * - Polyfills for Web APIs (ReadableStream for SSE)
 * - Mock environment variables
 */

import "@testing-library/jest-dom";
import { ReadableStream } from "stream/web";

import { toHaveNoViolations } from "jest-axe";

// Add jest-axe matchers for accessibility testing
expect.extend(toHaveNoViolations);

// ===========================
// Polyfills for Node.js
// ===========================

// ReadableStream for SSE (Server-Sent Events) testing
// Required for /api/tickets/stream route tests
global.ReadableStream = ReadableStream;

// Response, Request, Headers polyfills for JSDOM test environment
// Even though Node.js 18+ has these natively, JSDOM needs explicit polyfills
if (typeof global.Headers === "undefined") {
  global.Headers = class Headers extends Map {
    constructor(init) {
      super();
      if (init) {
        if (init instanceof Headers || init instanceof Map) {
          for (const [key, value] of init.entries()) {
            this.set(key, value);
          }
        } else if (typeof init === "object") {
          for (const [key, value] of Object.entries(init)) {
            this.set(key, value);
          }
        }
      }
    }
    get(name) {
      return super.get(name.toLowerCase()) || null;
    }
    set(name, value) {
      super.set(name.toLowerCase(), value);
    }
    append(name, value) {
      this.set(name, value);
    }
    has(name) {
      return super.has(name.toLowerCase());
    }
    delete(name) {
      return super.delete(name.toLowerCase());
    }
  };
}

if (typeof global.Response === "undefined") {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || "";
      this.ok = this.status >= 200 && this.status < 300;
      this.headers = new global.Headers(init.headers || {});
    }
    async text() {
      return typeof this.body === "string"
        ? this.body
        : JSON.stringify(this.body);
    }
    async json() {
      const text = await this.text();
      return JSON.parse(text);
    }
  };
}

if (typeof global.Request === "undefined") {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === "string" ? input : input.url;
      this.method = init.method || "GET";
      this.headers = new global.Headers(init.headers || {});
      this.body = init.body;
    }
    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
      });
    }
  };
}

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
