"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TicketForm } from "./TicketForm";
import { TicketStream } from "./TicketStream";
import { useToast } from "@/lib/contexts";

export function HomePage() {
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(
    null,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  // Check for approved/rejected ticket query params
  useEffect(() => {
    const approvedTicketId = searchParams.get("approved");
    const rejectedTicketId = searchParams.get("rejected");

    if (approvedTicketId) {
      // Show the approved ticket in stream (will display completion status)
      setSubmittedTicketId(approvedTicketId);
      showToast({
        message: "✅ Ticket Approved!",
        description: `Processing workflow completion...`,
        variant: "success",
        duration: 3000,
      });
      // Clear query param
      router.replace("/", { scroll: false });
    } else if (rejectedTicketId) {
      // Show the rejected ticket in stream (will display rejection status)
      setSubmittedTicketId(rejectedTicketId);
      showToast({
        message: "❌ Ticket Rejected",
        description: `Ticket has been rejected and closed.`,
        variant: "warning",
        duration: 3000,
      });
      // Clear query param
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router, showToast]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Split Layout: Form (left) + Stream (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Ticket Form */}
          <div>
            <TicketForm onSubmitSuccess={setSubmittedTicketId} />
          </div>

          {/* Right: Processing Stream */}
          <div>
            <TicketStream
              ticketId={submittedTicketId}
              onReset={() => setSubmittedTicketId(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
