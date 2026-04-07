"use client";

import { cn } from "@/lib/utils/cn";

export type ToastVariant = "success" | "warning" | "info";

export interface ToastProps {
  message: string;
  description?: string;
  variant?: ToastVariant;
  isVisible: boolean;
  duration?: number;
  onClose?: () => void;
}

/**
 * Toast notification component (Pure presentation)
 * State management is handled by ToastProvider
 *
 * @param message - Main notification message
 * @param description - Optional detailed description
 * @param variant - Visual style: success, warning, or info
 * @param isVisible - Controls visibility animation
 * @param onClose - Callback when toast is closed manually
 */
export function Toast({
  message,
  description,
  variant = "info",
  isVisible,
  duration = 5000,
  onClose,
}: ToastProps) {
  const variants = {
    success: {
      gradient: "from-green-600 to-green-500",
      border: "border-green-400",
      icon: "📧",
      badge: "Email & Slack",
    },
    warning: {
      gradient: "from-orange-600 to-orange-500",
      border: "border-orange-400",
      icon: "🚨",
      badge: "Priority Alert",
    },
    info: {
      gradient: "from-blue-600 to-blue-500",
      border: "border-blue-400",
      icon: "📬",
      badge: "Email",
    },
  };

  const config = variants[variant];

  return (
    <div
      data-testid="toast-container"
      className={cn(
        "fixed top-8 right-8 max-w-md z-50 transition-all duration-300",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none",
      )}
    >
      <div
        data-testid="toast-content"
        className={cn(
          "relative bg-gradient-to-r text-white rounded-lg shadow-2xl p-4 border overflow-hidden",
          config.gradient,
          config.border,
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div
              data-testid="toast-icon-container"
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <span className="text-2xl">{config.icon}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm">{message}</h4>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {config.badge}
              </span>
            </div>
            {description && (
              <p data-testid="toast-description" className="text-sm opacity-90">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <svg
              data-testid="toast-close-icon"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div
          data-testid="toast-progress-bar"
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden"
        >
          <div
            className="h-full bg-white/60"
            style={{
              animation: `progress-bar ${duration}ms linear`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
