import { NextRequest } from "next/server";
import { streamWorkflow } from "@/lib/langgraph/workflow";
import { getDataSource } from "@/lib/database/connection";
import { Ticket } from "@/lib/database/entities/Ticket";
import type { CustomerLookupOutput } from "@/lib/types/agents";

/**
 * SSE endpoint для real-time стриминга прогресса обработки тикета
 * Симулирует работу 6 AI агентов с задержками
 */

import { TicketStatus } from "@/lib/types/common";

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

  // Реальный стриминг через streamWorkflow
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const event of await streamWorkflow(
        input,
        ticket.id,
        customerData,
      )) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      }
      controller.close();
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
