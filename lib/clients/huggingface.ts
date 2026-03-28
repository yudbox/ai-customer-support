import { InferenceClient } from "@huggingface/inference";

if (!process.env.HUGGINGFACE_API_KEY) {
  throw new Error("HUGGINGFACE_API_KEY is not set");
}

export const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
