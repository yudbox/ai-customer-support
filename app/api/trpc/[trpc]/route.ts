import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { API_BASE_PATHS } from "@/lib/config/api-routes";
import { appRouter } from "@/lib/trpc/routers/_app";

/**
 * Next.js API Route Handler for tRPC
 * Handles all requests to /api/trpc/*
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: API_BASE_PATHS.TRPC,
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
