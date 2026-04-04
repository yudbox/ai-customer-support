import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

interface SidebarToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Which side the toggle button appears on
   */
  side?: "left" | "right";
  /**
   * Whether the toggle is visible (for responsive behavior)
   */
  mobileOnly?: boolean;
}

/**
 * Floating toggle button for opening/closing sidebars.
 * Positioned on the edge of the screen with an arrow icon.
 */
export function SidebarToggle({
  side = "left",
  mobileOnly = true,
  className,
  "aria-label": ariaLabel,
  ...props
}: SidebarToggleProps) {
  const sideStyles = {
    left: "left-0 rounded-r-lg",
    right: "right-0 rounded-l-lg",
  };

  const iconRotation = {
    left: "M9 5l7 7-7 7", // Chevron right
    right: "M15 19l-7-7 7-7", // Chevron left
  };

  return (
    <button
      className={cn(
        "fixed top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 shadow-lg z-30",
        "hover:bg-blue-700 active:bg-blue-800 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        sideStyles[side],
        mobileOnly && "lg:hidden",
        className,
      )}
      aria-label={ariaLabel || `Open ${side} sidebar`}
      {...props}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconRotation[side]}
        />
      </svg>
    </button>
  );
}
