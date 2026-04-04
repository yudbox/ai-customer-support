import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@/lib/trpc/routers/_app";

/**
 * tRPC React Client
 * Импортирует AppRouter тип с сервера для end-to-end type safety
 * Используется в клиентских компонентах через хуки:
 * - trpc.tickets.create.useMutation()
 * - trpc.tickets.list.useQuery()
 */
export const trpc = createTRPCReact<AppRouter>();
