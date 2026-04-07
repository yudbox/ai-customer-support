import { render, screen, fireEvent } from "@testing-library/react";

import { Toast } from "@/components/ui/toast";

describe("Toast Component", () => {
  describe("Rendering", () => {
    it("renders toast with message", () => {
      render(<Toast message="Test notification" isVisible={true} />);

      expect(screen.getByText("Test notification")).toBeInTheDocument();
    });

    it("renders toast with message and description", () => {
      render(
        <Toast
          message="Success"
          description="Your message has been sent"
          isVisible={true}
        />,
      );

      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(
        screen.getByText("Your message has been sent"),
      ).toBeInTheDocument();
    });

    it("renders without description when not provided", () => {
      render(<Toast message="Test" isVisible={true} />);

      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.queryByTestId("toast-description")).not.toBeInTheDocument();
    });

    it("renders close button", () => {
      render(<Toast message="Test" isVisible={true} />);
      const closeButton = screen.getByLabelText("Close notification");

      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe("BUTTON");
    });

    it("renders progress bar", () => {
      render(<Toast message="Test" isVisible={true} />);

      const progressBar = screen.getByTestId("toast-progress-bar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveClass("h-1");
    });

    it("renders in DOM but is hidden with CSS when isVisible=false", () => {
      render(<Toast message="Hidden" isVisible={false} />);

      // Element is in DOM
      expect(screen.getByText("Hidden")).toBeInTheDocument();

      // But has hidden classes
      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toHaveClass("opacity-0");
      expect(toastContainer).toHaveClass("-translate-y-full");
      expect(toastContainer).toHaveClass("pointer-events-none");
    });
  });

  describe("Variants", () => {
    it("renders success variant with correct styling and badge", () => {
      render(<Toast message="Success" variant="success" isVisible={true} />);

      expect(screen.getByText("Email & Slack")).toBeInTheDocument();
      expect(screen.getByText("📧")).toBeInTheDocument();

      const toastContent = screen.getByTestId("toast-content");
      expect(toastContent).toHaveClass("from-green-600");
      expect(toastContent).toHaveClass("to-green-500");
      expect(toastContent).toHaveClass("border-green-400");
    });

    it("renders warning variant with correct styling and badge", () => {
      render(<Toast message="Warning" variant="warning" isVisible={true} />);

      expect(screen.getByText("Priority Alert")).toBeInTheDocument();
      expect(screen.getByText("🚨")).toBeInTheDocument();

      const toastContent = screen.getByTestId("toast-content");
      expect(toastContent).toHaveClass("from-orange-600");
      expect(toastContent).toHaveClass("to-orange-500");
      expect(toastContent).toHaveClass("border-orange-400");
    });

    it("renders info variant with correct styling and badge", () => {
      render(<Toast message="Info" variant="info" isVisible={true} />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("📬")).toBeInTheDocument();

      const toastContent = screen.getByTestId("toast-content");
      expect(toastContent).toHaveClass("from-blue-600");
      expect(toastContent).toHaveClass("to-blue-500");
      expect(toastContent).toHaveClass("border-blue-400");
    });

    it("defaults to info variant when not specified", () => {
      render(<Toast message="Default variant" isVisible={true} />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("📬")).toBeInTheDocument();
    });
  });

  describe("Positioning and Styling", () => {
    it("has fixed positioning at top-right", () => {
      render(<Toast message="Test" isVisible={true} />);

      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toHaveClass("fixed");
      expect(toastContainer).toHaveClass("top-8");
      expect(toastContainer).toHaveClass("right-8");
    });

    it("has correct z-index for overlay", () => {
      render(<Toast message="Test" isVisible={true} />);

      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toHaveClass("z-50");
    });

    it("has max width constraint", () => {
      render(<Toast message="Test" isVisible={true} />);

      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toHaveClass("max-w-md");
    });

    it("has gradient background", () => {
      render(<Toast message="Test" isVisible={true} />);

      const toastContent = screen.getByTestId("toast-content");
      expect(toastContent).toHaveClass("bg-gradient-to-r");
      expect(toastContent).toHaveClass("text-white");
    });

    it("has rounded corners and shadow", () => {
      render(<Toast message="Test" isVisible={true} />);

      const toastContent = screen.getByTestId("toast-content");
      expect(toastContent).toHaveClass("rounded-lg");
      expect(toastContent).toHaveClass("shadow-2xl");
    });
  });

  describe("Icon and Badge Rendering", () => {
    it("renders icon in circular background", () => {
      render(<Toast message="Test" variant="success" isVisible={true} />);

      const iconContainer = screen.getByTestId("toast-icon-container");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("bg-white/20");
      expect(iconContainer).toHaveClass("rounded-full");
    });

    it("renders badge with correct styling", () => {
      render(<Toast message="Test" variant="success" isVisible={true} />);
      const badge = screen.getByText("Email & Slack");

      expect(badge.tagName).toBe("SPAN");
      expect(badge).toHaveClass("text-xs");
      expect(badge).toHaveClass("bg-white/20");
      expect(badge).toHaveClass("rounded-full");
    });

    it("renders different icons for different variants", () => {
      const { rerender } = render(
        <Toast message="Test" variant="success" isVisible={true} />,
      );
      expect(screen.getByText("📧")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="warning" isVisible={true} />);
      expect(screen.getByText("🚨")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="info" isVisible={true} />);
      expect(screen.getByText("📬")).toBeInTheDocument();
    });

    it("renders different badges for different variants", () => {
      const { rerender } = render(
        <Toast message="Test" variant="success" isVisible={true} />,
      );
      expect(screen.getByText("Email & Slack")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="warning" isVisible={true} />);
      expect(screen.getByText("Priority Alert")).toBeInTheDocument();

      rerender(<Toast message="Test" variant="info" isVisible={true} />);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  describe("Visibility Classes", () => {
    it("applies visible classes when isVisible=true", () => {
      render(<Toast message="Test" isVisible={true} />);

      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toHaveClass("opacity-100");
      expect(toastContainer).toHaveClass("translate-y-0");
      expect(toastContainer).not.toHaveClass("pointer-events-none");
    });

    it("applies hidden classes when isVisible=false", () => {
      render(<Toast message="Test" isVisible={false} />);

      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toHaveClass("opacity-0");
      expect(toastContainer).toHaveClass("-translate-y-full");
      expect(toastContainer).toHaveClass("pointer-events-none");
    });

    it("has transition classes for smooth animation", () => {
      render(<Toast message="Test" isVisible={true} />);

      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toHaveClass("transition-all");
      expect(toastContainer).toHaveClass("duration-300");
    });

    it("toggles visibility classes when isVisible changes", () => {
      const { rerender } = render(<Toast message="Test" isVisible={true} />);

      const toastContainer = screen.getByTestId("toast-container");
      expect(toastContainer).toHaveClass("opacity-100");

      rerender(<Toast message="Test" isVisible={false} />);
      expect(toastContainer).toHaveClass("opacity-0");
      expect(toastContainer).toHaveClass("pointer-events-none");
    });
  });

  describe("Manual Close", () => {
    it("calls onClose when close button is clicked", () => {
      const onClose = jest.fn();
      render(<Toast message="Test" isVisible={true} onClose={onClose} />);

      const closeButton = screen.getByLabelText("Close notification");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("close button has correct aria-label", () => {
      render(<Toast message="Test" isVisible={true} />);
      const closeButton = screen.getByLabelText("Close notification");

      expect(closeButton).toHaveAttribute("aria-label", "Close notification");
    });

    it("close button has hover styles", () => {
      render(<Toast message="Test" isVisible={true} />);
      const closeButton = screen.getByLabelText("Close notification");

      expect(closeButton).toHaveClass("text-white/60");
      expect(closeButton).toHaveClass("hover:text-white");
      expect(closeButton).toHaveClass("transition-colors");
    });

    it("renders close button SVG icon", () => {
      render(<Toast message="Test" isVisible={true} />);

      const svg = screen.getByTestId("toast-close-icon");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("w-5");
      expect(svg).toHaveClass("h-5");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("does not throw error when onClose is not provided", () => {
      render(<Toast message="Test" isVisible={true} />);

      const closeButton = screen.getByLabelText("Close notification");

      expect(() => {
        fireEvent.click(closeButton);
      }).not.toThrow();
    });
  });
});
