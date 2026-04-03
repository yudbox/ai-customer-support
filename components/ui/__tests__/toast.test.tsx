import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Toast } from "@/components/ui/toast";

describe("Toast Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("renders toast with message", () => {
      render(<Toast message="Test notification" show={true} />);

      expect(screen.getByText("Test notification")).toBeInTheDocument();
    });

    it("renders toast with message and description", () => {
      render(
        <Toast
          message="Success"
          description="Your message has been sent"
          show={true}
        />,
      );

      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(
        screen.getByText("Your message has been sent"),
      ).toBeInTheDocument();
    });

    it("renders without description when not provided", () => {
      const { container } = render(<Toast message="Test" show={true} />);

      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(container.querySelector("p.text-sm")).not.toBeInTheDocument();
    });

    it("renders close button", () => {
      render(<Toast message="Test" show={true} />);
      const closeButton = screen.getByLabelText("Close notification");

      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe("BUTTON");
    });

    it("renders progress bar", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const progressBar = container.querySelector(".absolute.bottom-0");

      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveClass("h-1");
    });

    it("does not render when show=false", () => {
      render(<Toast message="Hidden" show={false} />);

      expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("renders success variant with correct styling and badge", () => {
      const { container } = render(
        <Toast message="Success" variant="success" show={true} />,
      );

      expect(screen.getByText("Email & Slack")).toBeInTheDocument();
      expect(screen.getByText("📧")).toBeInTheDocument();

      const gradientDiv = container.querySelector(".from-green-600");
      expect(gradientDiv).toHaveClass("to-green-500");
      expect(gradientDiv).toHaveClass("border-green-400");
    });

    it("renders warning variant with correct styling and badge", () => {
      const { container } = render(
        <Toast message="Warning" variant="warning" show={true} />,
      );

      expect(screen.getByText("Priority Alert")).toBeInTheDocument();
      expect(screen.getByText("🚨")).toBeInTheDocument();

      const gradientDiv = container.querySelector(".from-orange-600");
      expect(gradientDiv).toHaveClass("to-orange-500");
      expect(gradientDiv).toHaveClass("border-orange-400");
    });

    it("renders info variant with correct styling and badge", () => {
      const { container } = render(
        <Toast message="Info" variant="info" show={true} />,
      );

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("📬")).toBeInTheDocument();

      const gradientDiv = container.querySelector(".from-blue-600");
      expect(gradientDiv).toHaveClass("to-blue-500");
      expect(gradientDiv).toHaveClass("border-blue-400");
    });

    it("defaults to info variant when not specified", () => {
      render(<Toast message="Default variant" show={true} />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("📬")).toBeInTheDocument();
    });
  });

  describe("Positioning and Styling", () => {
    it("has fixed positioning at top-right", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const toastContainer = container.querySelector(".fixed");

      expect(toastContainer).toHaveClass("fixed");
      expect(toastContainer).toHaveClass("top-8");
      expect(toastContainer).toHaveClass("right-8");
    });

    it("has correct z-index for overlay", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const toastContainer = container.querySelector(".fixed");

      expect(toastContainer).toHaveClass("z-50");
    });

    it("has max width constraint", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const toastContainer = container.querySelector(".fixed");

      expect(toastContainer).toHaveClass("max-w-md");
    });

    it("has gradient background", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const toastContent = container.querySelector(".bg-gradient-to-r");

      expect(toastContent).toHaveClass("bg-gradient-to-r");
      expect(toastContent).toHaveClass("text-white");
    });

    it("has rounded corners and shadow", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const toastContent = container.querySelector(".rounded-lg");

      expect(toastContent).toHaveClass("rounded-lg");
      expect(toastContent).toHaveClass("shadow-2xl");
    });
  });

  describe("Icon and Badge Rendering", () => {
    it("renders icon in circular background", () => {
      const { container } = render(
        <Toast message="Test" variant="success" show={true} />,
      );
      const iconContainer = container.querySelector(".w-10.h-10");

      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("bg-white/20");
      expect(iconContainer).toHaveClass("rounded-full");
    });

    it("renders badge with correct styling", () => {
      render(<Toast message="Test" variant="success" show={true} />);
      const badge = screen.getByText("Email & Slack");

      expect(badge.tagName).toBe("SPAN");
      expect(badge).toHaveClass("text-xs");
      expect(badge).toHaveClass("bg-white/20");
      expect(badge).toHaveClass("rounded-full");
    });

    it("renders different icons for different variants", () => {
      const { rerender } = render(
        <Toast message="Test" variant="success" show={true} />,
      );
      expect(screen.getByText("📧")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="warning" show={true} />);
      expect(screen.getByText("🚨")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="info" show={true} />);
      expect(screen.getByText("📬")).toBeInTheDocument();
    });

    it("renders different badges for different variants", () => {
      const { rerender } = render(
        <Toast message="Test" variant="success" show={true} />,
      );
      expect(screen.getByText("Email & Slack")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="warning" show={true} />);
      expect(screen.getByText("Priority Alert")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="info" show={true} />);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  describe("Visibility Animation", () => {
    it("starts hidden and shows after delay", async () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const toastContainer = container.querySelector(".fixed");

      // Initially should have opacity-0 (before animation)
      expect(toastContainer).toHaveClass("opacity-0");
      expect(toastContainer).toHaveClass("-translate-y-full");

      // After 100ms delay, should become visible
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(toastContainer).toHaveClass("opacity-100");
        expect(toastContainer).toHaveClass("translate-y-0");
      });
    });

    it("has transition classes", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const toastContainer = container.querySelector(".fixed");

      expect(toastContainer).toHaveClass("transition-all");
      expect(toastContainer).toHaveClass("duration-300");
    });

    it("becomes hidden when show changes to false", async () => {
      const { rerender } = render(<Toast message="Test" show={true} />);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText("Test")).toBeInTheDocument();
      });

      rerender(<Toast message="Test" show={false} />);
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });
  });

  describe("Auto-dismiss", () => {
    it("auto-dismisses after default duration (5000ms)", () => {
      const onClose = jest.fn();
      render(<Toast message="Test" show={true} onClose={onClose} />);

      // Show animation (100ms)
      jest.advanceTimersByTime(100);
      expect(screen.getByText("Test")).toBeInTheDocument();

      // Auto-hide after duration + 100ms = 5100ms
      jest.advanceTimersByTime(5100);

      // Wait for hide animation (300ms)
      jest.advanceTimersByTime(300);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("auto-dismisses after custom duration", () => {
      const onClose = jest.fn();
      render(
        <Toast message="Test" show={true} duration={2000} onClose={onClose} />,
      );

      jest.advanceTimersByTime(100); // Show delay
      expect(screen.getByText("Test")).toBeInTheDocument();

      jest.advanceTimersByTime(2100); // Duration + 100ms
      jest.advanceTimersByTime(300); // Hide animation

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when not provided", () => {
      render(<Toast message="Test" show={true} />);

      jest.advanceTimersByTime(100);
      expect(screen.getByText("Test")).toBeInTheDocument();

      // Should not throw error when onClose is undefined
      expect(() => {
        jest.advanceTimersByTime(5100);
        jest.advanceTimersByTime(300);
      }).not.toThrow();
    });

    it("clears timers on unmount", () => {
      const onClose = jest.fn();
      const { unmount } = render(
        <Toast message="Test" show={true} onClose={onClose} />,
      );

      unmount();
      jest.advanceTimersByTime(10000);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Manual Close", () => {
    it("calls onClose when close button is clicked", () => {
      const onClose = jest.fn();
      render(<Toast message="Test" show={true} onClose={onClose} />);

      const closeButton = screen.getByLabelText("Close notification");
      fireEvent.click(closeButton);

      // Wait for animation delay
      jest.advanceTimersByTime(300);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("close button has correct aria-label", () => {
      render(<Toast message="Test" show={true} />);
      const closeButton = screen.getByLabelText("Close notification");

      expect(closeButton).toHaveAttribute("aria-label", "Close notification");
    });

    it("close button has hover styles", () => {
      render(<Toast message="Test" show={true} />);
      const closeButton = screen.getByLabelText("Close notification");

      expect(closeButton).toHaveClass("text-white/60");
      expect(closeButton).toHaveClass("hover:text-white");
      expect(closeButton).toHaveClass("transition-colors");
    });

    it("renders close button SVG icon", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const svg = container.querySelector("svg.w-5.h-5");

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("clicking close button hides toast before onClose is called", () => {
      const onClose = jest.fn();
      const { container } = render(
        <Toast message="Test" show={true} onClose={onClose} />,
      );

      jest.advanceTimersByTime(100);
      const closeButton = screen.getByLabelText("Close notification");
      fireEvent.click(closeButton);

      const toastContainer = container.querySelector(".fixed");
      expect(toastContainer).toHaveClass("opacity-0");

      jest.advanceTimersByTime(300);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Progress Bar", () => {
    it("renders progress bar with animation", () => {
      const { container } = render(
        <Toast message="Test" show={true} duration={3000} />,
      );
      const progressBar = container.querySelector(".h-full.bg-white\\/60");

      expect(progressBar).toBeInTheDocument();
    });

    it("progress bar has correct duration style", () => {
      const { container } = render(
        <Toast message="Test" show={true} duration={4000} />,
      );
      const progressBar = container.querySelector(".h-full.bg-white\\/60");

      expect(progressBar).toHaveStyle({
        animation: "progress-bar 4000ms linear",
      });
    });

    it("progress bar uses default duration when not specified", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const progressBar = container.querySelector(".h-full.bg-white\\/60");

      expect(progressBar).toHaveStyle({
        animation: "progress-bar 5000ms linear",
      });
    });

    it("progress bar container has correct styling", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const progressBarContainer =
        container.querySelector(".absolute.bottom-0");

      expect(progressBarContainer).toHaveClass("absolute");
      expect(progressBarContainer).toHaveClass("bottom-0");
      expect(progressBarContainer).toHaveClass("left-0");
      expect(progressBarContainer).toHaveClass("right-0");
      expect(progressBarContainer).toHaveClass("h-1");
      expect(progressBarContainer).toHaveClass("bg-white/20");
    });
  });

  describe("Layout and Structure", () => {
    it("uses flexbox for content layout", () => {
      const { container } = render(
        <Toast message="Test" description="Details" show={true} />,
      );
      const flexContainer = container.querySelector(".flex.items-start.gap-3");

      expect(flexContainer).toBeInTheDocument();
    });

    it("icon container is flex-shrink-0", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const iconContainer = container.querySelectorAll(".flex-shrink-0")[0];

      expect(iconContainer).toHaveClass("flex-shrink-0");
    });

    it("content area is flex-1", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const contentArea = container.querySelector(".flex-1");

      expect(contentArea).toBeInTheDocument();
    });

    it("close button is flex-shrink-0", () => {
      render(<Toast message="Test" show={true} />);
      const closeButton = screen.getByLabelText("Close notification");

      expect(closeButton).toHaveClass("flex-shrink-0");
    });
  });

  describe("Message and Description Styling", () => {
    it("message has correct styling", () => {
      render(<Toast message="Important Message" show={true} />);
      const message = screen.getByText("Important Message");

      expect(message.tagName).toBe("H4");
      expect(message).toHaveClass("font-bold");
      expect(message).toHaveClass("text-sm");
    });

    it("description has correct styling", () => {
      render(
        <Toast
          message="Test"
          description="Additional details here"
          show={true}
        />,
      );
      const description = screen.getByText("Additional details here");

      expect(description.tagName).toBe("P");
      expect(description).toHaveClass("text-sm");
      expect(description).toHaveClass("opacity-90");
    });

    it("message and badge are in same row", () => {
      const { container } = render(
        <Toast message="Test" variant="success" show={true} />,
      );
      const row = container.querySelector(".flex.items-center.gap-2");

      expect(row).toContainElement(screen.getByText("Test"));
      expect(row).toContainElement(screen.getByText("Email & Slack"));
    });
  });

  describe("Edge Cases", () => {
    it("handles very long message text", () => {
      const longMessage =
        "This is a very long message that should wrap to multiple lines and not break the layout of the toast component.";
      render(<Toast message={longMessage} show={true} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("handles very long description text", () => {
      const longDescription =
        "This is a very long description with lots of details that should also wrap properly without breaking the toast layout.";
      render(
        <Toast message="Test" description={longDescription} show={true} />,
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("handles empty string description", () => {
      const { container } = render(
        <Toast message="Test" description="" show={true} />,
      );

      // Empty string is falsy, so description paragraph should not render
      const description = container.querySelector("p.text-sm.opacity-90");
      expect(description).not.toBeInTheDocument();
    });

    it("handles zero duration", () => {
      const onClose = jest.fn();
      render(
        <Toast message="Test" show={true} duration={0} onClose={onClose} />,
      );

      jest.advanceTimersByTime(100); // Show delay
      jest.advanceTimersByTime(100); // Duration + 100
      jest.advanceTimersByTime(300); // Hide animation

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("handles rapid show/hide toggling", () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <Toast message="Test" show={true} onClose={onClose} />,
      );

      rerender(<Toast message="Test" show={false} onClose={onClose} />);
      rerender(<Toast message="Test" show={true} onClose={onClose} />);
      rerender(<Toast message="Test" show={false} onClose={onClose} />);

      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });

    it("handles multiple manual closes", () => {
      const onClose = jest.fn();
      render(<Toast message="Test" show={true} onClose={onClose} />);

      const closeButton = screen.getByLabelText("Close notification");
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      jest.advanceTimersByTime(300);

      // Should only be called once per click sequence
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Complex Scenarios", () => {
    it("shows success toast with all props", () => {
      const onClose = jest.fn();
      render(
        <Toast
          message="Operation successful"
          description="Your data has been saved"
          variant="success"
          duration={3000}
          onClose={onClose}
          show={true}
        />,
      );

      expect(screen.getByText("Operation successful")).toBeInTheDocument();
      expect(screen.getByText("Your data has been saved")).toBeInTheDocument();
      expect(screen.getByText("📧")).toBeInTheDocument();
      expect(screen.getByText("Email & Slack")).toBeInTheDocument();
    });

    it("switches between variants dynamically", () => {
      const { rerender } = render(
        <Toast message="Test" variant="info" show={true} />,
      );

      expect(screen.getByText("📬")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="warning" show={true} />);
      expect(screen.getByText("🚨")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="success" show={true} />);
      expect(screen.getByText("📧")).toBeInTheDocument();
    });

    it("updates message and description dynamically", () => {
      const { rerender } = render(
        <Toast message="Initial" description="First description" show={true} />,
      );

      expect(screen.getByText("Initial")).toBeInTheDocument();
      expect(screen.getByText("First description")).toBeInTheDocument();

      rerender(
        <Toast
          message="Updated"
          description="Second description"
          show={true}
        />,
      );

      expect(screen.queryByText("Initial")).not.toBeInTheDocument();
      expect(screen.getByText("Updated")).toBeInTheDocument();
      expect(screen.getByText("Second description")).toBeInTheDocument();
    });

    it("auto-dismiss can be cancelled by manual close", () => {
      const onClose = jest.fn();
      render(<Toast message="Test" show={true} onClose={onClose} />);

      jest.advanceTimersByTime(100);

      // Manually close before auto-dismiss
      const closeButton = screen.getByLabelText("Close notification");
      fireEvent.click(closeButton);
      jest.advanceTimersByTime(300);

      expect(onClose).toHaveBeenCalledTimes(1);

      // Auto-dismiss timer should still fire but shouldn't call onClose again
      jest.advanceTimersByTime(5000);
    });

    it("changing duration while visible resets timer", () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <Toast message="Test" show={true} duration={5000} onClose={onClose} />,
      );

      jest.advanceTimersByTime(2000);

      rerender(
        <Toast message="Test" show={true} duration={1000} onClose={onClose} />,
      );

      jest.advanceTimersByTime(1200);
      jest.advanceTimersByTime(300);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("close button is keyboard accessible", () => {
      render(<Toast message="Test" show={true} />);
      const closeButton = screen.getByLabelText("Close notification");

      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });

    it("has semantic heading for message", () => {
      render(<Toast message="Important notification" show={true} />);
      const heading = screen.getByText("Important notification");

      expect(heading.tagName).toBe("H4");
    });

    it("close button SVG has proper attributes", () => {
      const { container } = render(<Toast message="Test" show={true} />);
      const svg = container.querySelector("svg");

      expect(svg).toHaveAttribute("fill", "none");
      expect(svg).toHaveAttribute("stroke", "currentColor");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });
  });
});
