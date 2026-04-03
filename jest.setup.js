// Jest setup file for both unit and integration tests
import "@testing-library/jest-dom";

// Mock environment variables
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
process.env.POSTGRES_HOST = "localhost";
process.env.POSTGRES_PORT = "5432";
process.env.POSTGRES_USER = "test";
process.env.POSTGRES_PASSWORD = "test";
process.env.POSTGRES_DATABASE = "test_db";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";
