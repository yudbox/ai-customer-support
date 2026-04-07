"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

import { API_BASE_PATHS } from "@/lib/config/api-routes";

import { trpc } from "./client";

/**
 * TRPCProvider
 * Wraps the application for using tRPC client
 * Configures React Query and tRPC client
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetch (can be enabled later)
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000, // 1 minute
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: API_BASE_PATHS.TRPC,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
