import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("PINECONE_INDEX_NAME is not set");
}

if (!process.env.PINECONE_NAMESPACE) {
  throw new Error("PINECONE_NAMESPACE is not set");
}

// Export Pinecone configuration constants
export const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE;

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);
