import { NextRequest } from "next/server";

/**
 * SSE endpoint для real-time стриминга прогресса обработки тикета
 * Симулирует работу 6 AI агентов с задержками
 */

interface StreamEvent {
  step: string;
  status: "in_progress" | "complete" | "error";
  message: string;
  detail?: string;
}

const MOCK_STEPS: StreamEvent[] = [
  {
    step: "intake",
    status: "complete",
    message: "Analyzing message",
    detail: "Parsed email content and extracted key information",
  },
  {
    step: "classification",
    status: "complete",
    message: "Classifying issue",
    detail: "Category: Order Status / Delayed Delivery",
  },
  {
    step: "sentiment",
    status: "complete",
    message: "Detecting sentiment",
    detail: "😡 ANGRY (0.94 confidence)",
  },
  {
    step: "customer",
    status: "complete",
    message: "Looking up customer",
    detail: "Found: VIP tier, 145 orders, $6,200 lifetime value",
  },
  {
    step: "rag",
    status: "complete",
    message: "Searching similar tickets",
    detail: "Found 3 similar cases (avg resolution: 35 min)",
  },
  {
    step: "priority",
    status: "complete",
    message: "Calculating priority",
    detail: "Score: 94/100 (CRITICAL)",
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticketId = searchParams.get("ticketId");

  if (!ticketId) {
    return new Response("Missing ticketId parameter", { status: 400 });
  }

  // Create ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send events with 500ms delay between each
      for (let i = 0; i < MOCK_STEPS.length; i++) {
        const event = MOCK_STEPS[i];

        // First send "in_progress" status
        const progressData = {
          ...event,
          status: "in_progress",
        };

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`),
        );

        // Wait 500ms
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Then send "complete" status
        const completeData = {
          ...event,
          status: "complete",
        };

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`),
        );

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Final event - either CRITICAL or AUTO-RESOLVED
      const isCritical = Math.random() > 0.5; // 50% chance для демо

      if (isCritical) {
        const finalEvent = {
          step: "complete",
          status: "complete" as const,
          message: "🚨 REQUIRES MANAGER APPROVAL",
          detail: "Ticket escalated to senior support team",
          critical: true,
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`),
        );
      } else {
        const finalEvent = {
          step: "complete",
          status: "complete" as const,
          message: "✅ TICKET RESOLVED AUTOMATICALLY",
          detail: "Assigned to Product Support Team",
          critical: false,
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`),
        );
      }

      controller.close();
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
