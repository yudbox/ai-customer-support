import { initTRPC } from "@trpc/server";

/**
 * Инициализация tRPC
 * Создает базовые билдеры для роутеров и процедур
 */
const t = initTRPC.create();

/**
 * Экспортируем базовые компоненты для использования в роутерах
 */
export const router = t.router;
export const publicProcedure = t.procedure;
