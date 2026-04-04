"use client";

import { ReactNode } from "react";

import { ToastProvider } from "@/lib/contexts";
import { TRPCProvider } from "@/lib/trpc/provider";

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
