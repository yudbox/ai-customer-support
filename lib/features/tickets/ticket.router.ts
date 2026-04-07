import { z } from "zod";

import { router, publicProcedure } from "@/lib/trpc/server";
import { ticketFormSchema } from "@/lib/validations/ticket-form-schema";

import { ticketService } from "./ticket.service";

/**
 * Tickets router
 * Содержит все процедуры для работы с тикетами
 */
export const ticketsRouter = router({
  /**
   * Создание нового тикета
   * Автоматически создает кастомера если его нет
   */
  create: publicProcedure
    .input(ticketFormSchema)
    .mutation(async ({ input }) => {
      return ticketService.createTicket(input);
    }),

  /**
   * Получить список pending approval тикетов для Manager Dashboard
   * Ищет тикеты с активными checkpoints (workflow остановлен на WAIT_APPROVAL)
   */
  getPendingApproval: publicProcedure.query(async () => {
    return ticketService.getPendingApprovalTickets();
  }),

  /**
   * Получить полные детали тикета по ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return ticketService.getTicketDetails(input.id);
    }),

  /**
   * Approve тикет (Manager action)
   * Phase 1: Uses thread_id to resume workflow from checkpoint
   */
  approve: publicProcedure
    .input(
      z.object({
        id: z.string(),
        assigned_team: z.string(),
        assigned_to: z.string().optional(),
        resolution: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return ticketService.approveTicket(input);
    }),

  /**
   * Reject тикет (Manager action)
   */
  reject: publicProcedure
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(async ({ input }) => {
      return ticketService.rejectTicket(input);
    }),

  /**
   * Get AI recommendations for a ticket (queries Pinecone in real-time)
   */
  getAIRecommendations: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ input }) => {
      return ticketService.getAIRecommendations(input.ticketId);
    }),
});
