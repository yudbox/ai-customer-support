"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  RESOLUTION_MAX_LENGTH,
  RESOLUTION_WARNING_RATIO,
} from "@/lib/constants/resolution";

interface ResolutionEditorProps {
  resolutionText: string;
  onResolutionChange: (text: string) => void;
  suggestedSolution?: string;
}

type CounterState = "normal" | "warning" | "limit" | "over";

/** All user-facing counter copy lives here so it is a one-place change. */
const COPY = {
  labels: {
    warning: "Approaching limit",
    limit: "Limit reached",
    over: "Over limit",
  },
  announce: (state: CounterState, length: number, max: number): string => {
    const label = state === "normal" ? "Within limit" : COPY.labels[state];
    return `${label}: ${length} of ${max} characters used`;
  },
  notice: (max: number): string => `AI solution shortened to ${max} characters`,
};

const COUNTER_COLORS: Record<CounterState, string> = {
  normal: "text-gray-600",
  warning: "text-orange-700 font-medium",
  limit: "text-red-700 font-medium",
  over: "text-red-700 font-medium",
};

function getCounterState(length: number, limit: number): CounterState {
  const threshold = Math.floor(limit * RESOLUTION_WARNING_RATIO);
  if (length > limit) return "over";
  if (length === limit) return "limit";
  if (length > threshold) return "warning";
  return "normal";
}

export function ResolutionEditor({
  resolutionText,
  onResolutionChange,
  suggestedSolution,
}: ResolutionEditorProps) {
  const statusId = useId();
  const noticeId = useId();
  const [truncatedValue, setTruncatedValue] = useState<string | null>(null);
  const [live, setLive] = useState<{
    text: string;
    state: CounterState | null;
    notice: boolean;
  }>({ text: "", state: null, notice: false });

  const length = resolutionText.length;
  const isRequired = !resolutionText.trim();
  const counterState: CounterState | null = isRequired
    ? null
    : getCounterState(length, RESOLUTION_MAX_LENGTH);
  const noticeVisible =
    truncatedValue !== null && resolutionText === truncatedValue;

  // Derive the live-region text during render, only when the counter state
  // (or notice visibility) changes, so keystrokes within a state stay silent.
  if (live.state !== counterState || live.notice !== noticeVisible) {
    let text = live.text;
    if (counterState !== null) {
      const announcement = COPY.announce(
        counterState,
        length,
        RESOLUTION_MAX_LENGTH,
      );
      if (noticeVisible) {
        text = `${COPY.notice(RESOLUTION_MAX_LENGTH)}. ${announcement}`;
      } else if (live.state !== null && live.state !== counterState) {
        text = announcement;
      }
    }
    setLive({ text, state: counterState, notice: noticeVisible });
  }

  const handleUseAiSolution = () => {
    if (!suggestedSolution) return;
    if (suggestedSolution.length > RESOLUTION_MAX_LENGTH) {
      const truncated = suggestedSolution.slice(0, RESOLUTION_MAX_LENGTH);
      setTruncatedValue(truncated);
      onResolutionChange(truncated);
    } else {
      setTruncatedValue(null);
      onResolutionChange(suggestedSolution);
    }
  };

  const handleWriteCustom = () => {
    setTruncatedValue(null);
    onResolutionChange("");
  };

  const describedBy = noticeVisible ? `${statusId} ${noticeId}` : statusId;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">✍️ Resolution</h2>
        <div className="flex gap-2">
          {suggestedSolution && (
            <Button
              variant="secondary"
              onClick={handleUseAiSolution}
              className="text-sm"
            >
              🤖 Use AI Solution
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handleWriteCustom}
            className="text-sm"
          >
            ✏️ Write Custom
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={resolutionText}
          onChange={(e) => {
            setTruncatedValue(null);
            onResolutionChange(e.target.value);
          }}
          placeholder="Enter resolution for this ticket... (required)"
          rows={6}
          maxLength={RESOLUTION_MAX_LENGTH}
          aria-label="Resolution"
          aria-describedby={describedBy}
          className="font-mono text-sm shadow-sm"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          {counterState === null ? (
            <span id={statusId} className="text-xs text-red-500">
              ⚠️ Resolution required
            </span>
          ) : (
            <span id={statusId} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`text-xs ${COUNTER_COLORS[counterState]}`}
              >{`${length} / ${RESOLUTION_MAX_LENGTH}`}</span>
              <span className="sr-only">
                {`${length} of ${RESOLUTION_MAX_LENGTH} characters`}
              </span>
              {counterState !== "normal" && (
                <span className={`text-xs ${COUNTER_COLORS[counterState]}`}>
                  {COPY.labels[counterState]}
                </span>
              )}
            </span>
          )}
          {noticeVisible && (
            <span id={noticeId} className="text-xs text-gray-700">
              {COPY.notice(RESOLUTION_MAX_LENGTH)}
            </span>
          )}
        </div>
        <div aria-live="polite" role="status" className="sr-only">
          {live.text}
        </div>
      </div>
    </div>
  );
}
