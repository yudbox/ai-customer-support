/**
 * Integration tests for RejectModal component
 *
 * Тестирует модальное окно отклонения тикета: ввод причины,
 * валидация, кнопки, состояния загрузки.
 */

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
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <div>{children}</div>
      </div>
    );
  },
}));

// Mock Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    isPending,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    isPending?: boolean;
  }) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          variant === "destructive"
            ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:hover:bg-red-600"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 disabled:hover:bg-white"
        } px-6 py-3 text-base`}
      >
        {isPending ? "Loading" : children}
      </button>
    );
  },
}));

// Mock Textarea component
jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    value,
    onChange,
    placeholder,
    rows,
    autoFocus,
    className,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    autoFocus?: boolean;
    className?: string;
  }) => {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className={className}
      />
    );
  },
}));

describe("RejectModal Integration Tests", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockOnReasonChange = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    rejectReason: "",
    onReasonChange: mockOnReasonChange,
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Modal Visibility", () => {
    it("should render modal when isOpen is true", () => {
      render(<RejectModal {...defaultProps} isOpen={true} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("should not render modal when isOpen is false", () => {
      render(<RejectModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should show modal content when open", () => {
      render(<RejectModal {...defaultProps} isOpen={true} />);

      expect(screen.getByText(/Please provide a reason/i)).toBeInTheDocument();
    });

    it("should hide modal content when closed", () => {
      render(<RejectModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText(/Please provide a reason/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Modal Title", () => {
    it("should display correct modal title", () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Reject Ticket",
      );
    });

    it("should pass title to Modal component", () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText("Reject Ticket")).toBeInTheDocument();
    });
  });

  describe("Instruction Text", () => {
    it("should display instruction message", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByText("Please provide a reason for rejecting this ticket:"),
      ).toBeInTheDocument();
    });

    it("should render instruction with proper styling", () => {
      render(<RejectModal {...defaultProps} />);

      const instruction = screen.getByText(/Please provide a reason/i);
      expect(instruction).toHaveClass("text-gray-700");
    });
  });

  describe("Textarea Display", () => {
    it("should render textarea for rejection reason", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Enter rejection reason..."),
      ).toBeInTheDocument();
    });

    it("should have correct placeholder text", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      expect(textarea).toBeInTheDocument();
    });

    it("should render textarea with 4 rows", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.rows).toBe(4);
    });

    it("should render textarea as main input element", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should have focus:ring-red-500 class", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      expect(textarea).toHaveClass("focus:ring-red-500");
    });

    it("should display empty textarea initially", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("");
    });

    it("should display provided rejection reason", () => {
      render(
        <RejectModal {...defaultProps} rejectReason="Issue is not valid" />,
      );

      const textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Issue is not valid");
    });

    it("should display different rejection reasons", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} rejectReason="Duplicate ticket" />,
      );

      let textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Duplicate ticket");

      rerender(<RejectModal {...defaultProps} rejectReason="Customer error" />);

      textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Customer error");
    });
  });

  describe("Textarea Input", () => {
    it("should call onReasonChange when typing", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      fireEvent.change(textarea, { target: { value: "Test reason" } });

      expect(mockOnReasonChange).toHaveBeenCalledTimes(1);
      expect(mockOnReasonChange).toHaveBeenCalledWith("Test reason");
    });

    it("should call onReasonChange with each character", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");

      fireEvent.change(textarea, { target: { value: "T" } });
      fireEvent.change(textarea, { target: { value: "Te" } });
      fireEvent.change(textarea, { target: { value: "Tes" } });

      expect(mockOnReasonChange).toHaveBeenCalledTimes(3);
      expect(mockOnReasonChange).toHaveBeenNthCalledWith(1, "T");
      expect(mockOnReasonChange).toHaveBeenNthCalledWith(2, "Te");
      expect(mockOnReasonChange).toHaveBeenNthCalledWith(3, "Tes");
    });

    it("should handle long text input", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      const longText = "A".repeat(500);

      fireEvent.change(textarea, { target: { value: longText } });

      expect(mockOnReasonChange).toHaveBeenCalledWith(longText);
    });

    it("should handle multiline text input", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      const multilineText = "Line 1\nLine 2\nLine 3";

      fireEvent.change(textarea, { target: { value: multilineText } });

      expect(mockOnReasonChange).toHaveBeenCalledWith(multilineText);
    });

    it("should handle special characters", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      const specialText = "Issue: #123 - $100 refund @ customer@email.com";

      fireEvent.change(textarea, { target: { value: specialText } });

      expect(mockOnReasonChange).toHaveBeenCalledWith(specialText);
    });

    it("should handle clearing text", () => {
      render(<RejectModal {...defaultProps} rejectReason="Some text" />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      fireEvent.change(textarea, { target: { value: "" } });

      expect(mockOnReasonChange).toHaveBeenCalledWith("");
    });
  });

  describe("Cancel Button", () => {
    it("should render Cancel button", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Cancel/i }),
      ).toBeInTheDocument();
    });

    it("should have secondary variant styling", () => {
      render(<RejectModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it("should call onClose when Cancel is clicked", () => {
      render(<RejectModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose multiple times for multiple clicks", () => {
      render(<RejectModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });

      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it("should be enabled regardless of isPending state", () => {
      render(<RejectModal {...defaultProps} isPending={true} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });

    it("should be enabled when reject reason is empty", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe("Confirm Button", () => {
    it("should render Confirm Rejection button", () => {
      render(<RejectModal {...defaultProps} rejectReason="Valid reason" />);

      expect(
        screen.getByRole("button", { name: /Confirm Rejection/i }),
      ).toBeInTheDocument();
    });

    it("should have destructive variant styling", () => {
      render(<RejectModal {...defaultProps} rejectReason="Valid reason" />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeInTheDocument();
    });

    it("should display emoji in confirm button", () => {
      render(<RejectModal {...defaultProps} rejectReason="Valid reason" />);

      expect(screen.getByText(/❌ Confirm Rejection/i)).toBeInTheDocument();
    });

    it("should call onConfirm when clicked", () => {
      render(<RejectModal {...defaultProps} rejectReason="Valid reason" />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("should call onConfirm multiple times for multiple clicks", () => {
      render(<RejectModal {...defaultProps} rejectReason="Valid reason" />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });

      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(2);
    });

    it("should be disabled when reject reason is empty", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("should be disabled when reject reason is only spaces", () => {
      render(<RejectModal {...defaultProps} rejectReason="   " />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("should be enabled when reject reason has valid text", () => {
      render(
        <RejectModal
          {...defaultProps}
          rejectReason="Valid reason"
          isPending={false}
        />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should be enabled with trimmed whitespace around text", () => {
      render(
        <RejectModal
          {...defaultProps}
          rejectReason="  Valid reason  "
          isPending={false}
        />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should not call onConfirm when disabled by empty reason", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("should not call onConfirm when disabled by whitespace-only reason", () => {
      render(<RejectModal {...defaultProps} rejectReason="   " />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe("Loading State (isPending)", () => {
    it("should show normal button when not pending", () => {
      render(
        <RejectModal
          {...defaultProps}
          rejectReason="Valid reason"
          isPending={false}
        />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should render button when isPending is true", () => {
      render(
        <RejectModal
          {...defaultProps}
          rejectReason="Valid reason"
          isPending={true}
        />,
      );

      // When isPending is true, Button shows "Loading" text
      const confirmButton = screen.getByRole("button", { name: /Loading/i });
      expect(confirmButton).toBeInTheDocument();
    });

    it("should allow cancel during loading", () => {
      render(<RejectModal {...defaultProps} isPending={true} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Modal Close Handler", () => {
    it("should call onClose when modal close button is clicked", () => {
      render(<RejectModal {...defaultProps} />);

      const closeButton = screen.getByTestId("modal-close");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should pass onClose to Modal component", () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByTestId("modal-close")).toBeInTheDocument();
    });
  });

  describe("Complete Workflows", () => {
    it("should handle full rejection workflow", () => {
      render(<RejectModal {...defaultProps} />);

      // Type rejection reason
      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      fireEvent.change(textarea, { target: { value: "Duplicate ticket" } });

      expect(mockOnReasonChange).toHaveBeenCalledWith("Duplicate ticket");
    });

    it("should handle rejection with confirm", () => {
      render(<RejectModal {...defaultProps} rejectReason="Invalid request" />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("should handle cancel workflow", () => {
      render(<RejectModal {...defaultProps} rejectReason="Some reason" />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("should enable confirm button when typing valid reason", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} rejectReason="" />,
      );

      let confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeDisabled();

      rerender(
        <RejectModal {...defaultProps} rejectReason="Now has a reason" />,
      );

      confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should disable confirm button when clearing reason", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} rejectReason="Has a reason" />,
      );

      let confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();

      rerender(<RejectModal {...defaultProps} rejectReason="" />);

      confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("should handle typing and then cancelling", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      fireEvent.change(textarea, { target: { value: "Test reason" } });

      expect(mockOnReasonChange).toHaveBeenCalledWith("Test reason");

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single character reason", () => {
      render(
        <RejectModal {...defaultProps} rejectReason="X" isPending={false} />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should handle reason with only one space and text", () => {
      render(
        <RejectModal {...defaultProps} rejectReason=" X" isPending={false} />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should handle very long rejection reason", () => {
      const longReason = "A".repeat(1000);
      render(<RejectModal {...defaultProps} rejectReason={longReason} />);

      const textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe(longReason);
    });

    it("should handle reason with emoji", () => {
      render(
        <RejectModal {...defaultProps} rejectReason="❌ Invalid ticket" />,
      );

      const textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("❌ Invalid ticket");
    });

    it("should handle reason with numbers", () => {
      render(
        <RejectModal
          {...defaultProps}
          rejectReason="Duplicate of ticket #12345"
        />,
      );

      const textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Duplicate of ticket #12345");
    });

    it("should handle rapid typing", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");

      for (let i = 0; i < 10; i++) {
        fireEvent.change(textarea, { target: { value: `Reason ${i}` } });
      }

      expect(mockOnReasonChange).toHaveBeenCalledTimes(10);
    });

    it("should not crash with rapid button clicks", () => {
      render(<RejectModal {...defaultProps} rejectReason="Valid reason" />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });

      expect(() => {
        for (let i = 0; i < 10; i++) {
          fireEvent.click(confirmButton);
          fireEvent.click(cancelButton);
        }
      }).not.toThrow();
    });

    it("should handle rapid open/close", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} isOpen={true} />,
      );

      expect(() => {
        for (let i = 0; i < 5; i++) {
          rerender(<RejectModal {...defaultProps} isOpen={false} />);
          rerender(<RejectModal {...defaultProps} isOpen={true} />);
        }
      }).not.toThrow();
    });
  });

  describe("Validation Edge Cases", () => {
    it("should be disabled with only whitespace", () => {
      render(<RejectModal {...defaultProps} rejectReason="      " />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("should be enabled with text and newlines", () => {
      render(
        <RejectModal
          {...defaultProps}
          rejectReason="Line 1\nLine 2"
          isPending={false}
        />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should trim leading and trailing whitespace for validation", () => {
      render(
        <RejectModal
          {...defaultProps}
          rejectReason="  \n  Valid  \n  "
          isPending={false}
        />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should handle empty string after trimming", () => {
      render(<RejectModal {...defaultProps} rejectReason="     " />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe("Data Updates", () => {
    it("should update textarea value when rejectReason changes", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} rejectReason="Original reason" />,
      );

      let textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Original reason");

      rerender(<RejectModal {...defaultProps} rejectReason="Updated reason" />);

      textarea = screen.getByPlaceholderText(
        "Enter rejection reason...",
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Updated reason");
    });

    it("should update button state when reason changes from empty to valid", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} rejectReason="" />,
      );

      let confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeDisabled();

      rerender(<RejectModal {...defaultProps} rejectReason="Valid" />);

      confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should update button state when reason changes from valid to whitespace", () => {
      const { rerender } = render(
        <RejectModal {...defaultProps} rejectReason="Valid reason" />,
      );

      let confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).not.toBeDisabled();

      rerender(<RejectModal {...defaultProps} rejectReason="   " />);

      confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button names", () => {
      render(<RejectModal {...defaultProps} rejectReason="Valid" />);

      expect(
        screen.getByRole("button", { name: /Cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Confirm Rejection/i }),
      ).toBeInTheDocument();
    });

    it("should have textarea as main input control", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Enter rejection reason...");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    });

    it("should have placeholder text for guidance", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Enter rejection reason..."),
      ).toBeInTheDocument();
    });

    it("should indicate disabled state on button", () => {
      render(<RejectModal {...defaultProps} rejectReason="" />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Rejection/i,
      });
      expect(confirmButton).toHaveAttribute("disabled");
    });
  });
});
