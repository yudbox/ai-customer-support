"use client";

import { ReactNode } from "react";
import { TRPCProvider } from "@/lib/trpc/provider";
import { ToastProvider } from "@/lib/contexts";

/**
 * Client-side providers wrapper
 * Allows Server Components to use Client Context providers
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <TRPCProvider>
      <ToastProvider>{children}</ToastProvider>
    </TRPCProvider>
  );
}
