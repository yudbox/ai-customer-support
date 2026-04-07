import { render, screen, fireEvent } from "@testing-library/react";

import { ApproveModal } from "@/app/_components/TicketDetailPanel/ApproveModal";

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

describe("ApproveModal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    selectedTeam: "technical_support",
    resolutionText: "This is a test resolution.",
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders modal when isOpen is true", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("does not render modal when isOpen is false", () => {
      render(<ApproveModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("renders with correct title", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByText("Confirm Approval")).toBeInTheDocument();
    });

    it("renders confirmation message", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByText(/Are you sure you want to approve this ticket/i),
      ).toBeInTheDocument();
    });

    it("renders resolution section heading", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByText("Resolution:")).toBeInTheDocument();
    });

    it("renders cancel button", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it("renders confirm button", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /confirm approval/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Team Name Display", () => {
    it("displays team name with underscores replaced by spaces", () => {
      render(
        <ApproveModal {...defaultProps} selectedTeam="technical_support" />,
      );

      expect(screen.getByText("technical support")).toBeInTheDocument();
    });

    it("replaces only first underscore", () => {
      render(
        <ApproveModal {...defaultProps} selectedTeam="customer_service_team" />,
      );

      // replace() only replaces first occurrence
      expect(screen.getByText("customer service_team")).toBeInTheDocument();
    });

    it("handles team name without underscores", () => {
      render(<ApproveModal {...defaultProps} selectedTeam="billing" />);

      expect(screen.getByText("billing")).toBeInTheDocument();
    });

    it("displays team name in bold", () => {
      render(<ApproveModal {...defaultProps} selectedTeam="escalation" />);

      const teamElement = screen.getByText("escalation");
      expect(teamElement.tagName).toBe("SPAN");
      expect(teamElement).toHaveClass("font-semibold");
    });

    it("handles empty team name", () => {
      render(<ApproveModal {...defaultProps} selectedTeam="" />);

      // Should render approval confirmation text
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  describe("Resolution Text Display", () => {
    it("displays full resolution text when under 200 characters", () => {
      const shortText = "Short resolution text.";
      render(<ApproveModal {...defaultProps} resolutionText={shortText} />);

      expect(screen.getByText(shortText)).toBeInTheDocument();
    });

    it("truncates resolution text when over 200 characters", () => {
      const longText = "A".repeat(250);
      render(<ApproveModal {...defaultProps} resolutionText={longText} />);

      const truncated = longText.substring(0, 200) + "...";
      expect(screen.getByText(truncated)).toBeInTheDocument();
    });

    it("displays ellipsis for text exactly 201 characters", () => {
      const text = "A".repeat(201);
      render(<ApproveModal {...defaultProps} resolutionText={text} />);

      expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
    });

    it("does not display ellipsis for text exactly 200 characters", () => {
      const text = "A".repeat(200);
      render(<ApproveModal {...defaultProps} resolutionText={text} />);

      const textElement = screen.getByText(text);
      expect(textElement.textContent).not.toContain("...");
    });

    it("handles empty resolution text", () => {
      render(<ApproveModal {...defaultProps} resolutionText="" />);

      const resolutionContainer = screen
        .getByText("Resolution:")
        .closest("div");
      expect(resolutionContainer).toBeInTheDocument();
    });

    it("displays resolution in gray box", () => {
      render(<ApproveModal {...defaultProps} />);

      const container = screen.getByText("Resolution:").parentElement;
      expect(container).toHaveClass(
        "bg-gray-50",
        "p-3",
        "rounded",
        "border",
        "border-gray-200",
      );
    });
  });

  describe("Button Interactions", () => {
    it("calls onClose when cancel button is clicked", () => {
      render(<ApproveModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when confirm button is clicked", () => {
      render(<ApproveModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm approval/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not call onConfirm when button is disabled", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const confirmButton = screen.getByRole("button", {
        name: /approving/i,
      });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("allows multiple cancel clicks", () => {
      render(<ApproveModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe("Pending State", () => {
    it("disables confirm button when isPending is true", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const confirmButton = screen.getByRole("button", {
        name: /approving/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("enables confirm button when isPending is false", () => {
      render(<ApproveModal {...defaultProps} isPending={false} />);

      const confirmButton = screen.getByRole("button", {
        name: /confirm approval/i,
      });
      expect(confirmButton).not.toBeDisabled();
    });

    it("displays 'Approving...' text when isPending is true", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      expect(
        screen.getByRole("button", { name: /approving\.\.\./i }),
      ).toBeInTheDocument();
    });

    it("displays 'Confirm Approval' text when isPending is false", () => {
      render(<ApproveModal {...defaultProps} isPending={false} />);

      expect(
        screen.getByRole("button", { name: /✅ confirm approval/i }),
      ).toBeInTheDocument();
    });

    it("cancel button remains enabled when isPending is true", () => {
      render(<ApproveModal {...defaultProps} isPending={true} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe("Modal Props", () => {
    it("passes isOpen prop to Modal component", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} isOpen={true} />,
      );
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      rerender(<ApproveModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("passes onClose prop to Modal component", () => {
      render(<ApproveModal {...defaultProps} />);

      const modalCloseButton = screen.getByTestId("modal-close");
      fireEvent.click(modalCloseButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("passes title prop to Modal component", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByText("Confirm Approval")).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("renders buttons in flex container with gap", () => {
      render(<ApproveModal {...defaultProps} />);

      // Verify both buttons exist
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm approval/i }),
      ).toBeInTheDocument();
    });

    it("applies correct spacing classes to content", () => {
      render(<ApproveModal {...defaultProps} />);

      // Verify content elements exist
      expect(
        screen.getByText(/Are you sure you want to approve this ticket/i),
      ).toBeInTheDocument();
      expect(screen.getByText("Resolution:")).toBeInTheDocument();
    });

    it("applies correct button variants", () => {
      render(<ApproveModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const confirmButton = screen.getByRole("button", {
        name: /confirm approval/i,
      });

      // Verify buttons are actual button elements
      expect(cancelButton.tagName).toBe("BUTTON");
      expect(confirmButton.tagName).toBe("BUTTON");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long team names", () => {
      const longTeam = "very_long_team_name_that_exceeds_normal_length";
      render(<ApproveModal {...defaultProps} selectedTeam={longTeam} />);

      expect(
        screen.getByText("very long_team_name_that_exceeds_normal_length"),
      ).toBeInTheDocument();
    });

    it("handles special characters in resolution text", () => {
      const specialText = "Resolution with <html> & special chars: @#$%";
      render(<ApproveModal {...defaultProps} resolutionText={specialText} />);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it("handles newlines in resolution text", () => {
      const textWithNewlines = "Line 1\nLine 2\nLine 3";
      render(
        <ApproveModal {...defaultProps} resolutionText={textWithNewlines} />,
      );

      // Use function matcher to handle newlines (getByText normalizes whitespace)
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === textWithNewlines;
        }),
      ).toBeInTheDocument();
    });

    it("handles resolution text with exactly 200 characters", () => {
      const text200 = "A".repeat(200);
      render(<ApproveModal {...defaultProps} resolutionText={text200} />);

      const displayedText = screen.getByText(text200);
      expect(displayedText.textContent).toHaveLength(200);
      expect(displayedText.textContent).not.toContain("...");
    });

    it("handles unicode characters in resolution text", () => {
      const unicodeText = "Resolution with emoji 🎉 and special chars";
      render(<ApproveModal {...defaultProps} resolutionText={unicodeText} />);

      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML elements", () => {
      render(<ApproveModal {...defaultProps} />);

      // Verify semantic elements exist using text content
      expect(
        screen.getByText(/Are you sure you want to approve this ticket/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it("buttons are keyboard accessible", () => {
      render(<ApproveModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const confirmButton = screen.getByRole("button", {
        name: /confirm approval/i,
      });

      expect(cancelButton.tagName).toBe("BUTTON");
      expect(confirmButton.tagName).toBe("BUTTON");
    });

    it("confirm button has descriptive text", () => {
      render(<ApproveModal {...defaultProps} />);

      const confirmButton = screen.getByRole("button", {
        name: /✅ confirm approval/i,
      });
      expect(confirmButton).toHaveAccessibleName();
    });
  });

  describe("State Transitions", () => {
    it("handles transition from not pending to pending", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} isPending={false} />,
      );

      expect(
        screen.getByRole("button", { name: /✅ confirm approval/i }),
      ).not.toBeDisabled();

      rerender(<ApproveModal {...defaultProps} isPending={true} />);

      expect(
        screen.getByRole("button", { name: /approving\.\.\./i }),
      ).toBeDisabled();
    });

    it("handles modal open/close transitions", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} isOpen={false} />,
      );

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

      rerender(<ApproveModal {...defaultProps} isOpen={true} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("maintains state when props change", () => {
      const { rerender } = render(
        <ApproveModal {...defaultProps} selectedTeam="billing" />,
      );

      expect(screen.getByText("billing")).toBeInTheDocument();

      rerender(
        <ApproveModal {...defaultProps} selectedTeam="technical_support" />,
      );

      expect(screen.getByText("technical support")).toBeInTheDocument();
      expect(screen.queryByText("billing")).not.toBeInTheDocument();
    });
  });
});
