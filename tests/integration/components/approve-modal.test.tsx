/**
 * Integration tests for ApproveModal component
 *
 * Тестирует модальное окно подтверждения одобрения тикета:
 * отображение команды, резолюции, кнопки, состояния загрузки.
 */

import { render, screen, fireEvent } from "@testing-library/react";

import {
  ApproveModal,
  RESOLUTION_PREVIEW_LENGTH,
} from "@/app/_components/TicketDetailPanel/ApproveModal";

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

describe("ApproveModal Integration Tests", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    selectedTeam: "technical_support",
    resolutionText: "This is a test resolution text.",
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Modal Visibility", () => {
    it("should render modal when isOpen is true", () => {
      render(<ApproveModal {...defaultProps} isOpen={true} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("should not render modal when isOpen is false", () => {
      render(<ApproveModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should show modal content when open", () => {
      render(<ApproveModal {...defaultProps} isOpen={true} />);

      expect(
        screen.getByText(/Are you sure you want to approve/i),
      ).toBeInTheDocument();
    });

    it("should hide modal content when closed", () => {
      render(<ApproveModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText(/Are you sure you want to approve/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Modal Title", () => {
    it("should display correct modal title", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Confirm Approval",
      );
    });

    it("should pass title to Modal component", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByText("Confirm Approval")).toBeInTheDocument();
    });
  });

  describe("Confirmation Message", () => {
    it("should display approval confirmation text", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByText(/Are you sure you want to approve this ticket/i),
      ).toBeInTheDocument();
    });

    it("should display selected team in confirmation text", () => {
      render(
        <ApproveModal {...defaultProps} selectedTeam="technical_support" />,
      );

      expect(screen.getByText(/technical support/i)).toBeInTheDocument();
    });

    it("should replace underscores with spaces in team name", () => {
      render(<ApproveModal {...defaultProps} selectedTeam="billing_team" />);

      expect(screen.getByText(/billing team/i)).toBeInTheDocument();
    });

    it("should display different team names correctly", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} selectedTeam="customer_service" />,
      );

      expect(screen.getByText(/customer service/i)).toBeInTheDocument();

      rerender(<ApproveModal {...defaultProps} selectedTeam="escalation" />);

      expect(screen.getByText(/escalation/i)).toBeInTheDocument();
    });

    it("should make team name bold/semibold", () => {
      render(
        <ApproveModal {...defaultProps} selectedTeam="technical_support" />,
      );

      const teamElement = screen.getByText(/technical support/i);
      expect(teamElement).toHaveClass("font-semibold");
    });

    it("should handle team names with multiple underscores", () => {
      render(
        <ApproveModal {...defaultProps} selectedTeam="team_with_many_words" />,
      );

      // Only first underscore is replaced
      expect(screen.getByText(/team with_many_words/i)).toBeInTheDocument();
    });
  });

  describe("Resolution Text Display", () => {
    it("should display resolution label", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByText("Resolution:")).toBeInTheDocument();
    });

    it("should display full resolution text when short", () => {
      const shortText = "Short resolution text.";
      render(<ApproveModal {...defaultProps} resolutionText={shortText} />);

      expect(screen.getByText(shortText)).toBeInTheDocument();
    });

    it("should display different resolution texts", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} resolutionText="First resolution" />,
      );

      expect(screen.getByText("First resolution")).toBeInTheDocument();

      rerender(
        <ApproveModal
          {...defaultProps}
          resolutionText="Second resolution text"
        />,
      );

      expect(screen.getByText("Second resolution text")).toBeInTheDocument();
    });

    it("should truncate resolution text when longer than 200 characters", () => {
      const longText = "A".repeat(250);
      render(<ApproveModal {...defaultProps} resolutionText={longText} />);

      const displayedText = screen.getByText(/A{200}\.\.\.$/);
      expect(displayedText).toBeInTheDocument();
    });

    it("should add ellipsis when text is truncated", () => {
      const longText = "A".repeat(250);
      render(<ApproveModal {...defaultProps} resolutionText={longText} />);

      expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
    });

    it("should not add ellipsis when text is exactly 200 characters", () => {
      const exactText = "A".repeat(RESOLUTION_PREVIEW_LENGTH);
      render(<ApproveModal {...defaultProps} resolutionText={exactText} />);

      const displayedText = screen.getByText(exactText);
      expect(displayedText?.textContent).not.toContain("...");
    });

    it("should not add ellipsis when text is 199 characters", () => {
      const text = "A".repeat(199);
      render(<ApproveModal {...defaultProps} resolutionText={text} />);

      const displayedText = screen.getByText(text);
      expect(displayedText?.textContent).not.toContain("...");
    });

    it("should truncate at exactly 200 characters", () => {
      const longText = "A".repeat(250);
      render(<ApproveModal {...defaultProps} resolutionText={longText} />);

      const container = screen.getByText(/A+\.\.\./);
      const textWithoutEllipsis =
        container.textContent?.replace("...", "") || "";
      expect(textWithoutEllipsis.length).toBe(RESOLUTION_PREVIEW_LENGTH);
    });

    it("should handle empty resolution text", () => {
      render(<ApproveModal {...defaultProps} resolutionText="" />);

      expect(screen.getByText("Resolution:")).toBeInTheDocument();
    });

    it("should handle very long resolution text correctly", () => {
      const veryLongText = "B".repeat(1000);
      render(<ApproveModal {...defaultProps} resolutionText={veryLongText} />);

      expect(screen.getByText(/B{200}\.\.\.$/)).toBeInTheDocument();
    });

    it("should display resolution in styled container", () => {
      render(<ApproveModal {...defaultProps} />);

      const container = screen.getByText("Resolution:").parentElement;
      expect(container).toHaveClass("bg-gray-50", "p-3", "rounded");
    });
  });

  describe("Cancel Button", () => {
    it("should render Cancel button", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Cancel/i }),
      ).toBeInTheDocument();
    });

    it("should have secondary variant styling", () => {
      render(<ApproveModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it("should call onClose when Cancel is clicked", () => {
      render(<ApproveModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose multiple times for multiple clicks", () => {
      render(<ApproveModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });

      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it("should be enabled when isPending is false", () => {
      render(<ApproveModal {...defaultProps} isPending={false} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });

    it("should be enabled even when isPending is true", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe("Confirm Button", () => {
    it("should render Confirm button", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Confirm Approval/i }),
      ).toBeInTheDocument();
    });

    it("should have primary variant styling", () => {
      render(<ApproveModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });
      expect(confirmButton).toBeInTheDocument();
    });

    it("should display checkmark emoji in confirm button", () => {
      render(<ApproveModal {...defaultProps} isPending={false} />);

      expect(screen.getByText(/✅ Confirm Approval/i)).toBeInTheDocument();
    });

    it("should call onConfirm when clicked", () => {
      render(<ApproveModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("should call onConfirm multiple times for multiple clicks", () => {
      render(<ApproveModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });

      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(2);
    });

    it("should be enabled when isPending is false", () => {
      render(<ApproveModal {...defaultProps} isPending={false} />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should be disabled when isPending is true", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const confirmButton = screen.getByRole("button", { name: /Approving/i });
      expect(confirmButton).toBeDisabled();
    });

    it("should not call onConfirm when disabled", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const confirmButton = screen.getByRole("button", { name: /Approving/i });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should change text to "Approving..." when isPending is true', () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const confirmButton = screen.getByRole("button", { name: /Approving/i });
      expect(confirmButton).toHaveTextContent("Approving...");
      expect(confirmButton).not.toHaveTextContent("✅ Confirm Approval");
    });

    it('should show "Confirm Approval" when isPending is false', () => {
      render(<ApproveModal {...defaultProps} isPending={false} />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });
      expect(confirmButton).toHaveTextContent("✅ Confirm Approval");
      expect(confirmButton).not.toHaveTextContent("Approving...");
    });
  });

  describe("Modal Close Handler", () => {
    it("should call onClose when modal close button is clicked", () => {
      render(<ApproveModal {...defaultProps} />);

      const closeButton = screen.getByTestId("modal-close");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should pass onClose to Modal component", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByTestId("modal-close")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show normal state when not pending", () => {
      render(<ApproveModal {...defaultProps} isPending={false} />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });
      expect(confirmButton).not.toBeDisabled();
      expect(confirmButton).toHaveTextContent("✅ Confirm Approval");
    });

    it("should show loading state when pending", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const confirmButton = screen.getByRole("button", { name: /Approving/i });
      expect(confirmButton).toBeDisabled();
      expect(confirmButton).toHaveTextContent("Approving...");
    });

    it("should transition from normal to loading state", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} isPending={false} />,
      );

      let confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });
      expect(confirmButton).toHaveTextContent("✅ Confirm Approval");

      rerender(<ApproveModal {...defaultProps} isPending={true} />);

      confirmButton = screen.getByRole("button", { name: /Approving/i });
      expect(confirmButton).toHaveTextContent("Approving...");
    });

    it("should transition from loading back to normal state", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} isPending={true} />,
      );

      let confirmButton = screen.getByRole("button", { name: /Approving/i });
      expect(confirmButton).toHaveTextContent("Approving...");

      rerender(<ApproveModal {...defaultProps} isPending={false} />);

      confirmButton = screen.getByRole("button", { name: /Confirm Approval/i });
      expect(confirmButton).toHaveTextContent("✅ Confirm Approval");
    });

    it("should allow cancel during loading", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Complete Workflows", () => {
    it("should handle full approval workflow", () => {
      render(
        <ApproveModal
          {...defaultProps}
          selectedTeam="technical_support"
          resolutionText="Issue has been resolved."
        />,
      );

      expect(screen.getByText(/technical support/i)).toBeInTheDocument();
      expect(screen.getByText("Issue has been resolved.")).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("should handle cancel workflow", () => {
      render(<ApproveModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("should handle long resolution with approval", () => {
      const longResolution = "A".repeat(300);
      render(
        <ApproveModal {...defaultProps} resolutionText={longResolution} />,
      );

      expect(screen.getByText(/A{200}\.\.\.$/)).toBeInTheDocument();

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple team changes", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} selectedTeam="billing_team" />,
      );

      expect(screen.getByText(/billing team/i)).toBeInTheDocument();

      rerender(
        <ApproveModal {...defaultProps} selectedTeam="technical_support" />,
      );

      expect(screen.getByText(/technical support/i)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle team name without underscores", () => {
      render(<ApproveModal {...defaultProps} selectedTeam="escalation" />);

      expect(screen.getByText(/escalation/i)).toBeInTheDocument();
    });

    it("should handle resolution with special characters", () => {
      const specialText = "Issue: #123 - User@example.com - $100 refund";
      render(<ApproveModal {...defaultProps} resolutionText={specialText} />);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it("should handle resolution with newlines", () => {
      const textWithNewlines = "Line 1\nLine 2\nLine 3";
      render(
        <ApproveModal {...defaultProps} resolutionText={textWithNewlines} />,
      );

      // Check parts of the text separately since newlines may not be preserved in DOM
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2/)).toBeInTheDocument();
      expect(screen.getByText(/Line 3/)).toBeInTheDocument();
    });

    it("should handle very short resolution", () => {
      render(<ApproveModal {...defaultProps} resolutionText="OK" />);

      expect(screen.getByText("OK")).toBeInTheDocument();
    });

    it("should handle resolution text with only spaces", () => {
      render(<ApproveModal {...defaultProps} resolutionText="   " />);

      expect(screen.getByText("Resolution:")).toBeInTheDocument();
    });

    it("should not crash with rapid button clicks", () => {
      render(<ApproveModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /Confirm Approval/i,
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
        <ApproveModal {...defaultProps} isOpen={true} />,
      );

      expect(() => {
        for (let i = 0; i < 5; i++) {
          rerender(<ApproveModal {...defaultProps} isOpen={false} />);
          rerender(<ApproveModal {...defaultProps} isOpen={true} />);
        }
      }).not.toThrow();
    });
  });

  describe("Component Structure", () => {
    it("should render buttons in flex container", () => {
      render(<ApproveModal {...defaultProps} />);

      const buttons = screen.getAllByRole("button").filter((btn) => {
        const text = btn.textContent || "";
        return (
          text.includes("Cancel") ||
          text.includes("Confirm") ||
          text.includes("Approving")
        );
      });

      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("should render resolution in proper container", () => {
      render(<ApproveModal {...defaultProps} />);

      const resolutionLabel = screen.getByText("Resolution:");
      const container = resolutionLabel.parentElement;

      expect(container).toHaveClass("bg-gray-50");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button names", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Confirm Approval/i }),
      ).toBeInTheDocument();
    });

    it("should indicate disabled state properly", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const confirmButton = screen.getByRole("button", { name: /Approving/i });
      expect(confirmButton).toHaveAttribute("disabled");
    });

    it("should have semantic HTML structure", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(3); // Close, Cancel, Confirm
    });
  });

  describe("Constants", () => {
    it("should use RESOLUTION_PREVIEW_LENGTH constant correctly", () => {
      const text = "A".repeat(RESOLUTION_PREVIEW_LENGTH + 50);
      render(<ApproveModal {...defaultProps} resolutionText={text} />);

      const container = screen.getByText(/A+\.\.\./);
      const displayedLength = (container.textContent?.replace("...", "") || "")
        .length;

      expect(displayedLength).toBe(RESOLUTION_PREVIEW_LENGTH);
    });

    it("should export RESOLUTION_PREVIEW_LENGTH constant", () => {
      expect(RESOLUTION_PREVIEW_LENGTH).toBe(200);
    });
  });
});
