"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";

const COPY_LABEL = "Copy ticket ID";
const COPIED_LABEL = "Copied";
const COPIED_ANNOUNCEMENT = "Ticket ID copied";
const FAILED_MESSAGE = "Couldn't copy, select the ID manually";
const COPIED_MS = 2000;
const FAILED_MS = 4000;

type CopyStatus = "idle" | "copied" | "failed";

interface CopyTicketIdButtonProps {
  ticketNumber: string;
}

/**
 * Copies the raw ticket number to the clipboard and shows transient feedback.
 * Render with key={ticketNumber} so a ticket switch resets all state.
 */
export function CopyTicketIdButton({ ticketNumber }: CopyTicketIdButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const showStatus = useCallback((next: CopyStatus, durationMs: number) => {
    if (!mountedRef.current) return;
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setStatus(next);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setStatus("idle");
    }, durationMs);
  }, []);

  const handleClick = useCallback(async () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (typeof navigator.clipboard?.writeText !== "function") {
      showStatus("failed", FAILED_MS);
      return;
    }

    try {
      await navigator.clipboard.writeText(ticketNumber);
      showStatus("copied", COPIED_MS);
    } catch {
      showStatus("failed", FAILED_MS);
    }
  }, [ticketNumber, showStatus]);

  const isCopied = status === "copied";

  return (
    <div className="flex flex-col items-start">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label={COPY_LABEL}
        onClick={handleClick}
      >
        <span className="inline-grid">
          <span
            aria-hidden="true"
            className={`col-start-1 row-start-1 text-center ${
              isCopied ? "invisible" : ""
            }`}
          >
            {COPY_LABEL}
          </span>
          <span
            aria-hidden="true"
            className={`col-start-1 row-start-1 text-center ${
              isCopied ? "" : "invisible"
            }`}
          >
            {COPIED_LABEL}
          </span>
        </span>
      </Button>
      <div
        role="status"
        aria-live="polite"
        className={
          status === "failed" ? "mt-1 text-xs text-red-600" : "sr-only"
        }
      >
        {status === "copied" && COPIED_ANNOUNCEMENT}
        {status === "failed" && FAILED_MESSAGE}
      </div>
    </div>
  );
}
