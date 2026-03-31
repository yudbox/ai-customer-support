"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/contexts";
import { TicketStatus, WorkflowStep } from "@/lib/types/common";

interface StreamEvent {
  step: string;
  status: TicketStatus;
  message: string;
  detail?: string;
  critical?: boolean;
  resolution?: string | null;
  assigned_team?: string | null;
  assigned_to?: string | null;
}

interface TicketStreamProps {
  ticketId: string | null;
  onComplete?: (isCritical: boolean) => void;
  onReset?: () => void;
}

export function TicketStream({
  ticketId,
  onComplete,
  onReset,
}: TicketStreamProps) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [resolution, setResolution] = useState<string | null>(null);
  const [assignedTeam, setAssignedTeam] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    // Reset state when new ticket is submitted
    if (ticketId) {
      setEvents([]);
      setIsComplete(false);
      setIsCritical(false);
      setResolution(null);
      setAssignedTeam(null);
      setAssignedTo(null);
    }
  }, [ticketId]);

  // Show toast notification when ticket is complete
  useEffect(() => {
    if (isComplete) {
      showToast({
        message: "Notification Sent",
        description: resolution
          ? "We've sent a confirmation email with the resolution details."
          : isCritical
            ? "Manager has been notified. You'll receive an email update within 60 minutes."
            : "Support team has been notified and will respond via email.",
        variant: resolution ? "success" : isCritical ? "warning" : "info",
        duration: 5000,
      });
    }
  }, [isComplete, resolution, isCritical, showToast]);

  useEffect(() => {
    if (!ticketId) return;

    const eventSource = new EventSource(
      `/api/tickets/stream?ticketId=${ticketId}`,
    );

    eventSource.onmessage = (event) => {
      const data: StreamEvent = JSON.parse(event.data);

      // Update or add event based on step
      setEvents((prev) => {
        const existingIndex = prev.findIndex((e) => e.step === data.step);
        if (existingIndex >= 0) {
          // Update existing event
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else {
          // Add new event
          return [...prev, data];
        }
      });

      // Check if this is the final event
      if (data.step === WorkflowStep.COMPLETE) {
        setIsComplete(true);
        setIsCritical(data.critical || false);
        setResolution(data.resolution || null);
        setAssignedTeam(data.assigned_team || null);
        setAssignedTo(data.assigned_to || null);
        eventSource.close();

        // Notify parent component
        if (onComplete) {
          onComplete(data.critical || false);
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [ticketId, onComplete]);

  // Empty state - no ticket submitted yet
  if (!ticketId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 h-[calc(100vh-8rem)] min-h-[600px] flex items-center justify-center sticky top-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Process
            </h3>
            <p className="text-gray-600 text-sm">
              Submit a ticket to see AI agents in action
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("111111111111111111111111 events", events);

  return (
    <div className="bg-white rounded-lg shadow-md h-[calc(100vh-8rem)] min-h-[600px] flex flex-col sticky top-8">
      {/* Fixed Header */}
      <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Ticket #{ticketId.slice(0, 8)}
          </h2>
          <p className="text-gray-600">AI agents are analyzing your request</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                {event.status === TicketStatus.RESOLVED ? (
                  event.step === WorkflowStep.COMPLETE ? (
                    event.critical ? (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xl">🚨</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xl">✅</span>
                      </div>
                    )
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xl">✅</span>
                    </div>
                  )
                ) : event.status === TicketStatus.PENDING_APPROVAL ? (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xl">🚨</span>
                  </div>
                ) : event.status === TicketStatus.IN_PROGRESS ? (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xl">⏳</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    event.status === TicketStatus.RESOLVED
                      ? "text-gray-900"
                      : event.status === TicketStatus.PENDING_APPROVAL
                        ? "text-red-900"
                        : event.status === TicketStatus.IN_PROGRESS
                          ? "text-blue-900"
                          : "text-gray-600"
                  }`}
                >
                  {event.message}
                </p>
                {event.detail && (
                  <p className="text-sm text-gray-600 mt-1">{event.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final Result Card */}
        {isComplete && (
          <div
            className={`rounded-lg border-2 p-6 ${
              isCritical
                ? "border-red-300 bg-red-50"
                : "border-green-300 bg-green-50"
            }`}
          >
            {isCritical ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🚨</span>
                  <h3 className="text-xl font-bold text-red-900">
                    REQUIRES MANAGER APPROVAL
                  </h3>
                </div>
                <div className="space-y-3 text-red-900">
                  <p>
                    Your request has been escalated to our senior support team.
                  </p>
                  <div className="space-y-1">
                    <p className="font-medium">
                      Ticket ID: #{ticketId.slice(0, 8)}
                    </p>
                    <p className="font-medium">
                      Status: Pending Manager Review
                    </p>
                    <p className="font-medium">Priority: CRITICAL 🚨</p>
                  </div>
                  <p className="mt-4 text-sm">
                    A senior team member will contact you within 60 minutes.
                    You&apos;ll receive an email notification once your ticket
                    is approved.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">✅</span>
                  <h3 className="text-xl font-bold text-green-900">
                    {resolution
                      ? "TICKET RESOLVED AUTOMATICALLY"
                      : "TICKET ASSIGNED TO SUPPORT TEAM"}
                  </h3>
                </div>
                <div className="space-y-3 text-green-900">
                  {resolution ? (
                    <>
                      <p>
                        Your ticket has been resolved based on similar past
                        cases:
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          📋 Resolution:
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {resolution}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">
                          Ticket ID: #{ticketId.slice(0, 8)}
                        </p>
                        <p className="font-medium">Status: ✅ Resolved</p>
                        <p className="text-xs text-green-700 mt-2">
                          If you need further assistance, please reply to this
                          ticket.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        Your ticket has been analyzed and assigned to our
                        support team:
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          📋 Assignment:
                        </p>
                        <p className="text-sm text-gray-800">
                          Team:{" "}
                          <span className="font-semibold">
                            {assignedTeam?.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </p>
                        {assignedTo && (
                          <p className="text-sm text-gray-800 mt-1">
                            Assigned to:{" "}
                            <span className="font-semibold">{assignedTo}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">
                          Ticket ID: #{ticketId.slice(0, 8)}
                        </p>
                        <p className="font-medium">Status: ⏳ In Progress</p>
                        <p className="font-medium">
                          Expected response: Within 2 hours
                        </p>
                        <p className="text-xs text-green-700 mt-2">
                          Our {assignedTeam?.replace(/_/g, " ")} team will
                          investigate and respond shortly.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Fixed Footer - Submit Another Ticket Button */}
      {isComplete && onReset && (
        <div className="px-8 pb-8 pt-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onReset}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            ✉️ Submit Another Ticket
          </button>
        </div>
      )}
    </div>
  );
}
