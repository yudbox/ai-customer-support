"use client";

import { ToastProvider } from "@/lib/contexts";

/**
 * Minimal client wrapper - only for Toast system
 * TRPC can stay in layout if it doesn't need to be in client boundary
 */
export function ToastClient({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
