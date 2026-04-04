import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";
import { Modal } from "@/components/ui/modal";

describe("Modal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Modal",
    children: <p>Modal content</p>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders modal when isOpen is true", () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal content")).toBeInTheDocument();
    });

    it("does not render modal when isOpen is false", () => {
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
      expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
    });

    it("returns null when closed", () => {
      const { container } = render(<Modal {...defaultProps} isOpen={false} />);

      expect(container.firstChild).toBeNull();
    });

    it("renders title correctly", () => {
      render(<Modal {...defaultProps} title="Custom Title" />);

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("renders children content", () => {
      render(
        <Modal {...defaultProps}>
          <div>
            <h3>Custom Content</h3>
            <p>Paragraph text</p>
          </div>
        </Modal>,
      );

      expect(screen.getByText("Custom Content")).toBeInTheDocument();
      expect(screen.getByText("Paragraph text")).toBeInTheDocument();
    });
  });

  describe("Structure and Styling", () => {
    it("renders with correct z-index layers", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const wrapper = container.querySelector(".fixed.inset-0.z-50");
      const modalContent = container.querySelector(".relative.bg-white.z-10");

      expect(wrapper).toBeInTheDocument();
      expect(modalContent).toBeInTheDocument();
    });

    it("renders backdrop with blur effect", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const backdrop = container.querySelector(
        ".absolute.inset-0.bg-black\\/40.backdrop-blur-sm",
      );

      expect(backdrop).toBeInTheDocument();
    });

    it("renders modal with correct positioning classes", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const wrapper = container.querySelector(
        ".flex.items-center.justify-center",
      );

      expect(wrapper).toBeInTheDocument();
    });

    it("renders modal content with correct styles", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modal = container.querySelector(".bg-white.rounded-lg.shadow-xl");

      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass("max-w-md");
      expect(modal).toHaveClass("p-6");
    });

    it("renders header with title and close button", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const header = container.querySelector(
        ".flex.items-center.justify-between.mb-4",
      );

      expect(header).toBeInTheDocument();
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });

    it("renders title with correct styles", () => {
      render(<Modal {...defaultProps} />);
      const title = screen.getByText("Test Modal");

      expect(title.tagName).toBe("H2");
      expect(title).toHaveClass("text-xl");
      expect(title).toHaveClass("font-bold");
      expect(title).toHaveClass("text-gray-900");
    });
  });

  describe("Close Button", () => {
    it("renders close button with X icon", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const closeButton = container.querySelector("button");
      const svg = closeButton?.querySelector("svg");

      expect(closeButton).toBeInTheDocument();
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("w-6");
      expect(svg).toHaveClass("h-6");
    });

    it("close button has correct styles", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const closeButton = container.querySelector("button");

      expect(closeButton).toHaveClass("text-gray-400");
      expect(closeButton).toHaveClass("hover:text-gray-600");
      expect(closeButton).toHaveClass("transition-colors");
    });

    it("calls onClose when close button is clicked", () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={handleClose} />,
      );
      const closeButton = container.querySelector("button");

      if (closeButton) {
        fireEvent.click(closeButton);
      }

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("renders SVG with correct path for X icon", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const path = container.querySelector("path");

      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute("d", "M6 18L18 6M6 6l12 12");
    });
  });

  describe("Backdrop Interaction", () => {
    it("calls onClose when backdrop is clicked", () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={handleClose} />,
      );
      const backdrop = container.querySelector(
        ".absolute.inset-0.bg-black\\/40",
      );

      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("does not close when clicking modal content", () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={handleClose} />,
      );
      const modalContent = container.querySelector(".relative.bg-white");

      if (modalContent) {
        fireEvent.click(modalContent);
      }

      expect(handleClose).not.toHaveBeenCalled();
    });

    it("stops propagation when clicking modal content", () => {
      const handleClose = jest.fn();
      render(<Modal {...defaultProps} onClose={handleClose} />);
      const modalContent =
        screen.getByText("Test Modal").parentElement?.parentElement;

      if (modalContent) {
        fireEvent.click(modalContent);
      }

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe("Multiple Close Methods", () => {
    it("can close via backdrop click", () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={handleClose} />,
      );
      const backdrop = container.querySelector(".absolute.inset-0");

      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("can close via close button click", () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={handleClose} />,
      );
      const closeButton = container.querySelector("button");

      if (closeButton) {
        fireEvent.click(closeButton);
      }

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("onClose is called only once per interaction", () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={handleClose} />,
      );
      const backdrop = container.querySelector(".absolute.inset-0");

      if (backdrop) {
        fireEvent.click(backdrop);
        fireEvent.click(backdrop);
      }

      expect(handleClose).toHaveBeenCalledTimes(2);
    });
  });

  describe("Complex Children Content", () => {
    it("renders form inside modal", () => {
      render(
        <Modal {...defaultProps}>
          <form>
            <input type="text" placeholder="Username" />
            <button type="submit">Submit</button>
          </form>
        </Modal>,
      );

      expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Submit" }),
      ).toBeInTheDocument();
    });

    it("renders multiple paragraphs inside modal", () => {
      render(
        <Modal {...defaultProps}>
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <p>Third paragraph</p>
        </Modal>,
      );

      expect(screen.getByText("First paragraph")).toBeInTheDocument();
      expect(screen.getByText("Second paragraph")).toBeInTheDocument();
      expect(screen.getByText("Third paragraph")).toBeInTheDocument();
    });

    it("renders buttons inside children", () => {
      render(
        <Modal {...defaultProps}>
          <div>
            <button>Confirm</button>
            <button>Cancel</button>
          </div>
        </Modal>,
      );

      expect(
        screen.getByRole("button", { name: "Confirm" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
    });
  });

  describe("State Changes", () => {
    it("responds to isOpen prop changes", () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();

      rerender(<Modal {...defaultProps} isOpen={true} />);

      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });

    it("updates title when prop changes", () => {
      const { rerender } = render(
        <Modal {...defaultProps} title="Initial Title" />,
      );

      expect(screen.getByText("Initial Title")).toBeInTheDocument();

      rerender(<Modal {...defaultProps} title="Updated Title" />);

      expect(screen.getByText("Updated Title")).toBeInTheDocument();
      expect(screen.queryByText("Initial Title")).not.toBeInTheDocument();
    });

    it("updates children when prop changes", () => {
      const { rerender } = render(
        <Modal {...defaultProps}>
          <p>Initial content</p>
        </Modal>,
      );

      expect(screen.getByText("Initial content")).toBeInTheDocument();

      rerender(
        <Modal {...defaultProps}>
          <p>Updated content</p>
        </Modal>,
      );

      expect(screen.getByText("Updated content")).toBeInTheDocument();
      expect(screen.queryByText("Initial content")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("renders with empty string title", () => {
      render(<Modal {...defaultProps} title="" />);
      const title = screen.queryByRole("heading");

      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("");
    });

    it("renders with very long title", () => {
      const longTitle = "A".repeat(100);
      render(<Modal {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("renders with only text as children", () => {
      render(
        <Modal {...defaultProps}>Plain text content without wrapper</Modal>,
      );

      expect(
        screen.getByText("Plain text content without wrapper"),
      ).toBeInTheDocument();
    });

    it("handles onClose being called multiple times quickly", () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={handleClose} />,
      );
      const closeButton = container.querySelector("button");

      if (closeButton) {
        fireEvent.click(closeButton);
        fireEvent.click(closeButton);
        fireEvent.click(closeButton);
      }

      expect(handleClose).toHaveBeenCalledTimes(3);
    });
  });

  describe("Accessibility", () => {
    it("title uses semantic H2 heading", () => {
      render(<Modal {...defaultProps} />);
      const title = screen.getByText("Test Modal");

      expect(title.tagName).toBe("H2");
    });

    it("close button is focusable", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const closeButton = container.querySelector("button");

      closeButton?.focus();
      expect(closeButton).toHaveFocus();
    });

    it("modal structure supports keyboard navigation", () => {
      const { container } = render(
        <Modal {...defaultProps}>
          <button>Action 1</button>
          <button>Action 2</button>
        </Modal>,
      );

      const buttons = container.querySelectorAll("button");
      expect(buttons).toHaveLength(3); // 2 action buttons + 1 close button
    });
  });

  describe("Layout and Positioning", () => {
    it("centers modal in viewport", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const wrapper = container.querySelector(".fixed.inset-0");

      expect(wrapper).toHaveClass("flex");
      expect(wrapper).toHaveClass("items-center");
      expect(wrapper).toHaveClass("justify-center");
    });

    it("modal has responsive width with max constraint", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modal = container.querySelector(".bg-white.rounded-lg");

      expect(modal).toHaveClass("max-w-md");
      expect(modal).toHaveClass("w-full");
      expect(modal).toHaveClass("mx-4"); // Horizontal margin for mobile
    });

    it("backdrop covers entire viewport", () => {
      const { container } = render(<Modal {...defaultProps} />);
      const backdrop = container.querySelector(
        ".absolute.inset-0.bg-black\\/40",
      );

      expect(backdrop).toHaveClass("absolute");
      expect(backdrop).toHaveClass("inset-0");
    });
  });
});
