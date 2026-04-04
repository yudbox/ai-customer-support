import { NextRequest } from "next/server";

import { getDataSource } from "@/lib/database/connection";
import { Ticket } from "@/lib/database/entities/Ticket";
import { streamWorkflow } from "@/lib/langgraph/workflow";
import type { CustomerLookupOutput } from "@/lib/types/agents";
import { TicketStatus, WorkflowStep } from "@/lib/types/common";

/**
 * SSE endpoint для real-time стриминга прогресса обработки тикета
 * Симулирует работу 6 AI агентов с задержками
 */

interface StreamEvent {
  step: string;
  status: TicketStatus;
  message: string;
  detail?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticketId = searchParams.get("ticketId");
  if (!ticketId) {
    return new Response("Missing ticketId parameter", { status: 400 });
  }

  // Получить тикет и customer
  const connection = await getDataSource();
  const ticketRepo = connection.getRepository(Ticket);
  const ticket = await ticketRepo.findOne({
    where: { id: ticketId },
    relations: ["customer"],
  });
  if (!ticket) {
    return new Response("Ticket not found", { status: 404 });
  }

  // Собрать input для агента
  const input = {
    email: ticket.customer?.email || "",
    subject: ticket.subject,
    body: ticket.body,
    attachments: [],
  };

  // ✅ ОПТИМИЗАЦИЯ: Передаем уже загруженные данные customer (избегаем лишнего запроса к БД)
  const customerData: CustomerLookupOutput | undefined = ticket.customer
    ? {
        found: true,
        customer_id: ticket.customer.id,
        tier: ticket.customer.tier,
        total_orders: ticket.customer.total_orders,
        lifetime_value: Number(ticket.customer.lifetime_value),
        avg_sentiment: undefined, // TODO: можно добавить расчет из истории тикетов
      }
    : undefined;

  // 🔑 Get thread_id for checkpointer (if exists)
  const threadId = ticket.thread_id;

  // ✅ If workflow already completed (no thread_id), send all workflow steps from ticket data
  if (!threadId && ticket.status !== TicketStatus.OPEN) {
    let isClosed = false;
    const timeoutIds: NodeJS.Timeout[] = [];

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Helper to send event with delay
        const sendEvent = (event: StreamEvent, delay: number = 0) => {
          const timeoutId = setTimeout(() => {
            if (!isClosed) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
              );
            }
          }, delay);
          timeoutIds.push(timeoutId);
        };

        // Reconstruct workflow steps from ticket data
        const steps = [
          {
            step: WorkflowStep.INTAKE_AGENT,
            status: TicketStatus.RESOLVED,
            message: "📥 Intake Agent completed",
            detail: `Parsed ticket: ${ticket.subject}`,
          },
          {
            step: WorkflowStep.CLASSIFICATION_AGENT,
            status: TicketStatus.RESOLVED,
            message: "🏷️ Classification Agent completed",
            detail: ticket.category
              ? `Category: ${ticket.category}${ticket.subcategory ? ` - ${ticket.subcategory}` : ""}`
              : "Ticket classified",
          },
          {
            step: WorkflowStep.SENTIMENT_AGENT,
            status: TicketStatus.RESOLVED,
            message: "😊 Sentiment Agent completed",
            detail: ticket.sentiment_label
              ? `Detected: ${ticket.sentiment_label} (${ticket.sentiment_score ? (ticket.sentiment_score * 100).toFixed(0) : "0"}%)`
              : "Sentiment analyzed",
          },
          {
            step: WorkflowStep.CUSTOMER_AGENT,
            status: TicketStatus.RESOLVED,
            message: "👤 Customer Lookup completed",
            detail: ticket.customer
              ? `Customer: ${ticket.customer.tier} tier - ${ticket.customer.total_orders} orders`
              : "Customer data retrieved",
          },
          {
            step: WorkflowStep.RESOLUTION_SEARCH_AGENT,
            status: TicketStatus.RESOLVED,
            message: "🔍 Resolution Search completed",
            detail: "Similar tickets analyzed via RAG",
          },
          {
            step: WorkflowStep.PRIORITY_AGENT,
            status: TicketStatus.RESOLVED,
            message: "⚡ Priority Agent completed",
            detail: ticket.priority
              ? `Priority: ${ticket.priority.toUpperCase()} (${ticket.priority_score || 0}/100)${(ticket.priority_score || 0) >= 60 ? " - Escalated to manager" : ""}`
              : "Priority calculated",
          },
          {
            step: WorkflowStep.WAIT_APPROVAL,
            status: TicketStatus.RESOLVED,
            message: "✅ Manager Approval",
            detail: "Ticket approved and assigned to support team",
          },
          {
            step: WorkflowStep.FINALIZE_TICKET,
            status: TicketStatus.RESOLVED,
            message: "🏁 Finalize Ticket completed",
            detail: ticket.assigned_team
              ? `Assigned to: ${ticket.assigned_team}${ticket.assigned_to ? ` (${ticket.assigned_to})` : ""}`
              : "Ticket finalized",
          },
          {
            step: WorkflowStep.SAVE_TO_DATABASE,
            status: TicketStatus.RESOLVED,
            message: "💾 Save to Database completed",
            detail: `Ticket updated: ${ticket.status}`,
          },
          {
            step: WorkflowStep.COMPLETE,
            status: TicketStatus.RESOLVED,
            message: "Workflow completed",
            detail:
              ticket.resolution ||
              "Ticket has been processed and assigned to support team",
            resolution: ticket.resolution,
            assigned_team: ticket.assigned_team,
            assigned_to: ticket.assigned_to,
            critical: false,
          },
        ];

        // Send all steps with small delays for visual effect
        steps.forEach((step, index) => {
          sendEvent(step, index * 100);
        });

        // Close stream after all events sent
        const closeTimeoutId = setTimeout(
          () => {
            if (!isClosed) {
              isClosed = true;
              try {
                controller.close();
              } catch (_error) {
                // Controller already closed, ignore
              }
            }
          },
          steps.length * 100 + 100,
        );
        timeoutIds.push(closeTimeoutId);
      },
      cancel() {
        // Cleanup: clear all pending timeouts if stream is cancelled
        timeoutIds.forEach((id) => clearTimeout(id));
        isClosed = true;
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Реальный стриминг через streamWorkflow
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const event of await streamWorkflow(
          input,
          ticket.id,
          customerData,
          threadId, // 🔑 Pass thread_id for resume support
        )) {
          if (!isClosed) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );
          }
        }
      } catch (error) {
        console.error("[stream/route] Stream error:", error);
      } finally {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch (_error) {
            // Controller already closed, ignore
          }
        }
      }
    },
    cancel() {
      // Stream cancelled by client
      isClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
