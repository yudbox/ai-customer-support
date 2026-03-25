import { router } from "../server";
import { ticketsRouter } from "./tickets";

/**
 * Главный tRPC роутер приложения
 * Объединяет все sub-роутеры
 */
export const appRouter = router({
  tickets: ticketsRouter,
});

/**
 * Экспортируем тип роутера для использования на клиенте
 * Это обеспечивает end-to-end type safety
 */
export type AppRouter = typeof appRouter;
