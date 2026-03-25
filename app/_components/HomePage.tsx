"use client";

import { useState } from "react";
import { TicketForm } from "./TicketForm";
import { TicketStream } from "./TicketStream";

export function HomePage() {
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(
    null,
  );

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
