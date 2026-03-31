/**
 * Workflow Runners
 *
 * Стратегии синхронного запуска workflow (без стриминга):
 * - runWorkflow: запуск с app.invoke()
 * - runWorkflowForTicketId: запуск для существующего тикета из БД
 *
 * Для стриминга используйте streamWorkflow из workflow.ts
 */

import { getDataSource } from "@/lib/database/connection";
import { Ticket } from "@/lib/database/entities/Ticket";
import type { CustomerTicketInput } from "@/lib/types/common";
import { TicketStatus } from "@/lib/types/common";
import { createWorkflow } from "./workflow";

// ===========================
// SYNC RUNNERS (invoke)
// ===========================

/**
 * Запустить workflow синхронно (без стриминга)
 * Используется для тестов, бэкграунд jobs, CLI
 *
 * @param input - данные тикета
 * @returns Финальное состояние workflow
 */
export async function runWorkflow(input: CustomerTicketInput) {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 STARTING WORKFLOW");
  console.log("=".repeat(80) + "\n");

  const app = createWorkflow();

  const initialState = {
    input,
    created_at: new Date().toISOString(),
    status: TicketStatus.OPEN,
    needs_approval: false,
    errors: [],
  };

  try {
    const result = await app.invoke(initialState);

    console.log("\n" + "=".repeat(80));
    console.log("✅ WORKFLOW COMPLETED");
    console.log("=".repeat(80));
    console.log("\nFinal State:");
    console.log(JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ WORKFLOW FAILED");
    console.error("=".repeat(80));
    console.error(error);
    throw error;
  }
}

/**
 * Запустить workflow для существующего тикета из БД
 * Загружает тикет по ID, конвертирует в input, запускает workflow
 *
 * @param ticketId - UUID тикета
 */
export async function runWorkflowForTicketId(ticketId: string) {
  const connection = await getDataSource();
  const ticketRepo = connection.getRepository(Ticket);
  const ticket = await ticketRepo.findOne({
    where: { id: ticketId },
    relations: ["customer"],
  });
  if (!ticket) throw new Error("Ticket not found");

  const input: CustomerTicketInput = {
    email: ticket.customer?.email || "",
    subject: ticket.subject,
    body: ticket.body,
    attachments: [],
  };

  await runWorkflow(input);
}
