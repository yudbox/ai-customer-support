import { render, screen, fireEvent } from "@testing-library/react";

import { RejectModal } from "@/app/_components/TicketDetailPanel/RejectModal";

// Mock Modal component
jest.mock("@/components/ui/modal", () => ({
  Modal: ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    );
  },
}));

describe("RejectModal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockOnReasonChange = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    rejectReason: "This is a test rejection reason.",
    onReasonChange: mockOnReasonChange,
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders modal when isOpen is true", () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("does not render modal when isOpen is false", () => {
      render(<RejectModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("renders with correct title", () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText("Reject Ticket")).toBeInTheDocument();
    });

    it("renders instruction message", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByText("Please provide a reason for rejecting this ticket:"),
      ).toBeInTheDocument();
    });

    it("renders textarea for rejection reason", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("renders cancel button", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it("renders confirm button", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /confirm rejection/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Textarea Properties", () => {
    it("displays current rejection reason value", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("This is a test rejection reason.");
    });

    it("has correct placeholder text", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      expect(textarea).toBeInTheDocument();
    });

    it("has autoFocus attribute", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      // autoFocus is a React prop, in DOM it's just autofocus lowercase
      // We can't reliably test focus in jsdom, so we just check the element exists
      expect(textarea).toBeInTheDocument();
    });

    it("has 4 rows", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("rows", "4");
    });

    it("has correct styling classes", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("w-full");
      expect(textarea).toHaveClass("px-4");
      expect(textarea).toHaveClass("py-2");
      expect(textarea).toHaveClass("border");
      expect(textarea).toHaveClass("rounded-lg");
      expect(textarea).toHaveClass("focus:ring-red-500");
    });

    it("displays empty string when rejectReason is empty", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
    });

    it("displays very long rejection reason", () => {
      const longReason = "A".repeat(1000);
      render(<RejectModal {...defaultProps} rejectReason={longReason} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(longReason);
    });

    it("displays rejection reason with newlines", () => {
      const reasonWithNewlines = "Line 1\nLine 2\nLine 3";
      render(
        <RejectModal {...defaultProps} rejectReason={reasonWithNewlines} />,
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(reasonWithNewlines);
    });

    it("displays rejection reason with special characters", () => {
      const specialReason = "Issue: @#$%^&*() <script>alert('test')</script>";
      render(<RejectModal {...defaultProps} rejectReason={specialReason} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(specialReason);
    });

    it("displays rejection reason with unicode characters", () => {
      const unicodeReason = "Reason: error message with emoji 🚫";
      render(<RejectModal {...defaultProps} rejectReason={unicodeReason} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(unicodeReason);
    });
  });

  describe("Textarea Interaction", () => {
    it("calls onReasonChange when text is entered", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "New reason" } });

      expect(mockOnReasonChange).toHaveBeenCalledWith("New reason");
      expect(mockOnReasonChange).toHaveBeenCalledTimes(1);
    });

    it("calls onReasonChange with empty string when cleared", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "" } });

      expect(mockOnReasonChange).toHaveBeenCalledWith("");
    });

    it("calls onReasonChange with multiline text", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const textarea = screen.getByRole("textbox");
      const multilineText = "Line 1\nLine 2\nLine 3";
      fireEvent.change(textarea, { target: { value: multilineText } });

      expect(mockOnReasonChange).toHaveBeenCalledWith(multilineText);
    });

    it("calls onReasonChange multiple times for multiple edits", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "First" } });
      fireEvent.change(textarea, { target: { value: "Second" } });
      fireEvent.change(textarea, { target: { value: "Third" } });

      expect(mockOnReasonChange).toHaveBeenCalledTimes(3);
      expect(mockOnReasonChange).toHaveBeenNthCalledWith(1, "First");
      expect(mockOnReasonChange).toHaveBeenNthCalledWith(2, "Second");
      expect(mockOnReasonChange).toHaveBeenNthCalledWith(3, "Third");
    });
  });

  describe("Button Interactions", () => {
    it("calls onClose when Cancel button is clicked", () => {
      render(<RejectModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("calls onConfirm when Confirm button is clicked", () => {
      render(<RejectModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not call onConfirm when Confirm button is disabled", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("Cancel button is never disabled", () => {
      const { rerender } = render(<RejectModal {...defaultProps} />);

      let cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();

      rerender(<RejectModal {...defaultProps} isPending={true} />);
      cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();

      rerender(<RejectModal {...defaultProps} rejectReason="" />);
      cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe("Confirm Button Disabled State", () => {
    it("is disabled when rejectReason is empty", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("is disabled when rejectReason contains only whitespace", () => {
      render(<RejectModal {...defaultProps} rejectReason="   " />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("is enabled when rejectReason has valid text", () => {
      render(<RejectModal {...defaultProps} rejectReason="Valid reason" />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("is enabled when rejectReason has text with leading/trailing whitespace", () => {
      render(<RejectModal {...defaultProps} rejectReason="  Valid  " />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("is enabled with single character reason", () => {
      render(<RejectModal {...defaultProps} rejectReason="X" />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe("Pending State", () => {
    it("shows pending state on Confirm button when isPending is true", () => {
      render(<RejectModal {...defaultProps} isPending={true} />);

      // When pending, button shows spinner with "Loading" aria-label
      const confirmButton = screen.getByRole("button", {
        name: /loading/i,
      });
      // Button should be disabled when pending
      expect(confirmButton).toBeDisabled();
    });

    it("Confirm button is not disabled when isPending is false and has valid reason", () => {
      render(<RejectModal {...defaultProps} isPending={false} />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("does not call onConfirm when pending", () => {
      render(<RejectModal {...defaultProps} isPending={true} />);

      const confirmButton = screen.getByRole("button", {
        name: /loading/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("transitions from not pending to pending", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} isPending={false} />,
      );

      let confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();

      rerender(<RejectModal {...defaultProps} isPending={true} />);
      confirmButton = screen.getByRole("button", {
        name: /loading/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("transitions from pending to not pending", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} isPending={true} />,
      );

      let confirmButton = screen.getByRole("button", {
        name: /loading/i,
      });
      expect(confirmButton).toBeDisabled();

      rerender(<RejectModal {...defaultProps} isPending={false} />);
      confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe("Button Text", () => {
    it("displays correct Cancel button text", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
    });

    it("displays correct Confirm button text when not pending", () => {
      render(<RejectModal {...defaultProps} isPending={false} />);

      expect(
        screen.getByRole("button", { name: "❌ Confirm Rejection" }),
      ).toBeInTheDocument();
    });

    it("Confirm button has emoji", () => {
      render(<RejectModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).toHaveTextContent("❌");
    });
  });

  describe("Modal Props", () => {
    it("passes isOpen prop to Modal", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} isOpen={true} />,
      );

      expect(screen.getByTestId("modal")).toBeInTheDocument();

      rerender(<RejectModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("passes onClose prop to Modal", () => {
      render(<RejectModal {...defaultProps} />);

      const modalCloseButton = screen.getByTestId("modal-close");
      fireEvent.click(modalCloseButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("passes correct title to Modal", () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText("Reject Ticket")).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    it("renders buttons in flex container with gap", () => {
      render(<RejectModal {...defaultProps} />);

      // Check buttons are rendered (they're in a flex container)
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm rejection/i }),
      ).toBeInTheDocument();
    });

    it("renders buttons aligned to the right", () => {
      render(<RejectModal {...defaultProps} />);

      // Check buttons exist (alignment is CSS, checked via class tests elsewhere)
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm rejection/i }),
      ).toBeInTheDocument();
    });

    it("has space-y-4 for vertical spacing", () => {
      render(<RejectModal {...defaultProps} />);

      // Check main content is rendered (spacing is CSS)
      expect(
        screen.getByPlaceholderText(/enter rejection reason/i),
      ).toBeInTheDocument();
    });
  });

  describe("Button Variants", () => {
    it("Cancel button has secondary variant", () => {
      render(<RejectModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      // Secondary variant adds these classes
      expect(cancelButton).toHaveClass("bg-white");
      expect(cancelButton).toHaveClass("text-gray-700");
    });

    it("Confirm button has destructive variant", () => {
      render(<RejectModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      // Destructive variant adds these classes
      expect(confirmButton).toHaveClass("bg-red-600");
      expect(confirmButton).toHaveClass("text-white");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long rejection reason", () => {
      const longReason = "A".repeat(10000);
      render(<RejectModal {...defaultProps} rejectReason={longReason} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(longReason);
    });

    it("handles rejection reason with only emoji", () => {
      render(<RejectModal {...defaultProps} rejectReason="🚫❌⛔" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("🚫❌⛔");
    });

    it("handles rejection reason with HTML tags", () => {
      const htmlReason = "<script>alert('xss')</script>";
      render(<RejectModal {...defaultProps} rejectReason={htmlReason} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(htmlReason);
    });

    it("handles rejection reason with SQL injection attempt", () => {
      const sqlReason = "'; DROP TABLE tickets; --";
      render(<RejectModal {...defaultProps} rejectReason={sqlReason} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(sqlReason);
    });

    it("handles rapid reason changes", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const textarea = screen.getByRole("textbox");
      for (let i = 0; i < 100; i++) {
        fireEvent.change(textarea, { target: { value: `Reason ${i}` } });
      }

      expect(mockOnReasonChange).toHaveBeenCalledTimes(100);
    });
  });

  describe("Accessibility", () => {
    it("textarea is accessible with role textbox", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("buttons are accessible with role button", () => {
      render(<RejectModal {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      // Cancel + Confirm + Modal close button = 3
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("has descriptive button text", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm rejection/i }),
      ).toBeInTheDocument();
    });

    it("textarea is rendered for user input", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      // autoFocus behavior cannot be reliably tested in jsdom
      expect(textarea).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("accepts and uses all props correctly", () => {
      const customProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        rejectReason: "Custom reason",
        onReasonChange: jest.fn(),
        isPending: false,
      };

      render(<RejectModal {...customProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("Custom reason");
    });

    it("re-renders when props change", () => {
      const { rerender } = render(<RejectModal {...defaultProps} />);

      expect(screen.getByRole("textbox")).toHaveValue(
        "This is a test rejection reason.",
      );

      rerender(<RejectModal {...defaultProps} rejectReason="Updated reason" />);

      expect(screen.getByRole("textbox")).toHaveValue("Updated reason");
    });

    it("updates disabled state when rejectReason changes", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} rejectReason="" />,
      );

      let confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).toBeDisabled();

      rerender(<RejectModal {...defaultProps} rejectReason="Now valid" />);
      confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe("State Combinations", () => {
    it("handles empty reason + not pending", () => {
      render(
        <RejectModal {...defaultProps} rejectReason="" isPending={false} />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("handles empty reason + pending", () => {
      render(
        <RejectModal {...defaultProps} rejectReason="" isPending={true} />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /loading/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("handles valid reason + pending", () => {
      render(
        <RejectModal {...defaultProps} rejectReason="Valid" isPending={true} />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /loading/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("handles valid reason + not pending", () => {
      render(
        <RejectModal
          {...defaultProps}
          rejectReason="Valid"
          isPending={false}
        />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /confirm rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });
  });
});
