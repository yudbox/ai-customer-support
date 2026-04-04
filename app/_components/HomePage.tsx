"use client";

import { useState, useEffect, useRef } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/lib/contexts";
import { QUERY_PARAMS } from "@/lib/types/common";

import { TicketForm } from "./TicketForm";
import { TicketStream } from "./TicketStream";

export function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // State only for tickets created via form
  const [ticketIdFromForm, setTicketIdFromForm] = useState<string | null>(null);

  // Track processed IDs to avoid duplicate toast notifications
  const processedRef = useRef<Set<string>>(new Set());

  // Get ticket ID from URL (approved/rejected from manager)
  const ticketIdFromUrl =
    searchParams.get(QUERY_PARAMS.APPROVED) ||
    searchParams.get(QUERY_PARAMS.REJECTED);

  // Combined ticket ID: URL takes precedence over form
  const ticketId = ticketIdFromUrl || ticketIdFromForm;

  // Handle reset: clear both form state and URL params
  const handleReset = () => {
    setTicketIdFromForm(null);
    router.replace("/"); // Clear query params
  };

  // Show toast notifications for approved/rejected tickets
  useEffect(() => {
    if (!ticketIdFromUrl || processedRef.current.has(ticketIdFromUrl)) {
      return;
    }

    processedRef.current.add(ticketIdFromUrl);

    const approvedTicketId = searchParams.get(QUERY_PARAMS.APPROVED);
    if (approvedTicketId) {
      showToast({
        message: "✅ Ticket Approved!",
        description: `Processing workflow completion...`,
        variant: "success",
        duration: 3000,
      });
    } else {
      showToast({
        message: "❌ Ticket Rejected",
        description: `Ticket has been rejected and closed.`,
        variant: "warning",
        duration: 3000,
      });
    }
  }, [ticketIdFromUrl, searchParams, showToast]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Split Layout: Form (left) + Stream (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Ticket Form */}
          <div>
            <TicketForm onSubmitSuccess={setTicketIdFromForm} />
          </div>

          {/* Right: Processing Stream */}
          <div>
            <TicketStream ticketId={ticketId} onReset={handleReset} />
          </div>
        </div>
      </div>
    </div>
  );
}
