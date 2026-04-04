"use client";

import { useState } from "react";

import { Sidebar, SidebarToggle } from "@/components/ui";

import { ManagerSidebar } from "./ManagerSidebar";
import { TicketDetailPanel } from "./TicketDetailPanel";

export function ManagerDashboardPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSelectTicket = (ticketId: string | null) => {
    setSelectedTicketId(ticketId);
    // Close mobile sidebar after selecting a ticket
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-gray-50 relative">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <ManagerSidebar
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
        />
      </div>

      {/* Mobile Sidebar Toggle Button - visible only on mobile */}
      <SidebarToggle
        side="left"
        onClick={() => setIsMobileSidebarOpen(true)}
        aria-label="Open tickets list"
      />

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        >
          <ManagerSidebar
            selectedTicketId={selectedTicketId}
            onSelectTicket={handleSelectTicket}
          />
        </Sidebar>
      </div>

      {/* Detail Panel - full width on mobile, 70% on desktop */}
      <div className="flex-1">
        <TicketDetailPanel ticketId={selectedTicketId} />
      </div>
    </div>
  );
}
