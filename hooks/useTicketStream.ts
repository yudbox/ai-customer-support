import { useEffect, useReducer } from "react";

import { useToast } from "@/lib/contexts";
import { TicketStatus, WorkflowStep } from "@/lib/types/common";

export interface StreamEvent {
  step: string;
  status: TicketStatus;
  message: string;
  detail?: string;
  critical?: boolean;
  resolution?: string | null;
  assigned_team?: string | null;
  assigned_to?: string | null;
}

interface StreamState {
  events: StreamEvent[];
  isComplete: boolean;
  isCritical: boolean;
  resolution: string | null;
  assignedTeam: string | null;
  assignedTo: string | null;
}

enum StreamActionType {
  RESET = "RESET",
  ADD_EVENT = "ADD_EVENT",
  UPDATE_EVENT = "UPDATE_EVENT",
  COMPLETE = "COMPLETE",
}

type StreamAction =
  | { type: StreamActionType.RESET }
  | { type: StreamActionType.ADD_EVENT; payload: StreamEvent }
  | { type: StreamActionType.UPDATE_EVENT; payload: StreamEvent }
  | { type: StreamActionType.COMPLETE; payload: StreamEvent };

const initialState: StreamState = {
  events: [],
  isComplete: false,
  isCritical: false,
  resolution: null,
  assignedTeam: null,
  assignedTo: null,
};

function streamReducer(state: StreamState, action: StreamAction): StreamState {
  switch (action.type) {
    case StreamActionType.RESET:
      return initialState;

    case StreamActionType.ADD_EVENT: {
      const existingIndex = state.events.findIndex(
        (e) => e.step === action.payload.step,
      );
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...state.events];
        updated[existingIndex] = action.payload;
        return { ...state, events: updated };
      }
      // Add new
      return { ...state, events: [...state.events, action.payload] };
    }

    case StreamActionType.UPDATE_EVENT: {
      const index = state.events.findIndex(
        (e) => e.step === action.payload.step,
      );
      if (index >= 0) {
        const updated = [...state.events];
        updated[index] = action.payload;
        return { ...state, events: updated };
      }
      return state;
    }

    case StreamActionType.COMPLETE:
      return {
        ...state,
        isComplete: true,
        isCritical: action.payload.critical || false,
        resolution: action.payload.resolution || null,
        assignedTeam: action.payload.assigned_team || null,
        assignedTo: action.payload.assigned_to || null,
      };

    default:
      return state;
  }
}

export function useTicketStream(ticketId: string | null) {
  const [state, dispatch] = useReducer(streamReducer, initialState);
  const { showToast } = useToast();

  // Handle EventSource stream
  useEffect(() => {
    if (!ticketId) {
      dispatch({ type: StreamActionType.RESET });
      return;
    }

    const eventSource = new EventSource(
      `/api/tickets/stream?ticketId=${ticketId}`,
    );

    eventSource.onmessage = (event) => {
      const data: StreamEvent = JSON.parse(event.data);

      dispatch({ type: StreamActionType.ADD_EVENT, payload: data });

      // Check if this is the final event
      if (data.step === WorkflowStep.COMPLETE) {
        dispatch({ type: StreamActionType.COMPLETE, payload: data });
        eventSource.close();

        // Show toast notification
        setTimeout(() => {
          showToast({
            message: "Notification Sent",
            description: data.resolution
              ? "We've sent a confirmation email with the resolution details."
              : data.critical
                ? "Manager has been notified. You'll receive an email update within 60 minutes."
                : "Support team has been notified and will respond via email.",
            variant: data.resolution
              ? "success"
              : data.critical
                ? "warning"
                : "info",
            duration: 5000,
          });
        }, 100);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [ticketId, showToast]);

  return state;
}
