import type { WorkflowStateType } from "../state/WorkflowState";
import { TicketStatus } from "@/lib/types/common";
import { openai } from "../../clients/openai";

/**
 * Node 2: Classification Agent
 * Классифицирует тикет по категориям и подкатегориям
 */
export async function classificationNode(
  state: WorkflowStateType,
): Promise<Partial<WorkflowStateType>> {
  console.log("🔵 Agent 2: Classification Agent - Starting...");

  try {
    const prompt = `You are a support ticket classifier.\nGiven the subject and body of a customer support ticket, classify it into one of the following categories and subcategories:\n\nCategories:\n- Account Issues: Cannot Login, Email Change Request, Password Reset\n- Payment Problems: Card Declined, Double Charge, Payment Failed, Billing Issue\n- Product Quality: Missing Parts, Product Damaged on Arrival, Defective Product\n- Refund Requests: Changed Mind, Defective Product Return, Order Cancellation\n- Shipping Delays: Package Lost, Wrong Address, Delayed Delivery, Not Received\n- Technical Issues: App Not Loading, Feature Not Working, Checkout Issue, Website Bug\n\nReturn a JSON object:\n{\n  \"category\": \"...\",\n  \"subcategory\": \"...\",\n  \"confidence\": 0.0-1.0\n}\n\nSubject: ${state.input.subject}\nBody: ${state.input.body}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI support ticket classifier.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.0,
      max_tokens: 256,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      // fallback: extract JSON from text
      const match = responseText.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed || !parsed.category) {
      throw new Error("Failed to parse classification result: " + responseText);
    }

    return {
      classification: {
        category: parsed.category,
        subcategory: parsed.subcategory,
        confidence: parsed.confidence ?? null,
      },
      status: TicketStatus.IN_PROGRESS,
    };
  } catch (error) {
    console.error("❌ Agent 2: Classification Agent - Error:", error);
    return {
      errors: [
        {
          agent: "classification",
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      ],
      status: TicketStatus.REJECTED,
    };
  }
}
