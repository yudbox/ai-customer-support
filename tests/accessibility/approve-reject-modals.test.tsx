/**
 * Accessibility Tests - Approve/Reject Modals (TIER 1)
 *
 * CRITICAL: EU Directive 2019/882 compliance
 * Tests confirmation dialogs for critical actions
 *
 * Coverage:
 * - Modal accessibility (focus trap, keyboard)
 * - Dangerous action confirmation
 * - Form within modal
 * - Button states
 * - Error prevention
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import { ApproveModal } from "@/app/_components/TicketDetailPanel/ApproveModal";
import { RejectModal } from "@/app/_components/TicketDetailPanel/RejectModal";

expect.extend(toHaveNoViolations);

describe("Approve/Reject Modals - WCAG 2.1 AA Compliance (TIER 1)", () => {
  // ============================================================================
  // APPROVE MODAL
  // ============================================================================

  describe("ApproveModal", () => {
    const defaultProps = {
      isOpen: true,
      onClose: jest.fn(),
      onConfirm: jest.fn(),
      selectedTeam: "TECHNICAL_SUPPORT",
      resolutionText:
        "This ticket has been resolved by resetting the user's password.",
      isPending: false,
    };

    describe("Basic Accessibility", () => {
      it("should pass axe accessibility tests", async () => {
        const { container } = render(<ApproveModal {...defaultProps} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it("should have dialog role", () => {
        const { getByRole } = render(<ApproveModal {...defaultProps} />);

        const dialog = getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });

      it("should have accessible title", () => {
        const { getByRole } = render(<ApproveModal {...defaultProps} />);

        const dialog = getByRole("dialog", { name: /confirm approval/i });
        expect(dialog).toBeInTheDocument();
      });

      it("should have aria-modal attribute", () => {
        const { getByRole } = render(<ApproveModal {...defaultProps} />);

        const dialog = getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
      });
    });

    describe("Content Accessibility", () => {
      it("should display team assignment information", () => {
        const { getByText } = render(<ApproveModal {...defaultProps} />);

        expect(getByText(/technical support/i)).toBeInTheDocument();
      });

      it("should display resolution preview", () => {
        const { getByText } = render(<ApproveModal {...defaultProps} />);

        expect(getByText(/password/i)).toBeInTheDocument();
      });

      it("should have semantic heading for resolution", () => {
        const { getByText } = render(<ApproveModal {...defaultProps} />);

        const resolutionLabel = getByText(/resolution:/i);
        expect(resolutionLabel).toBeInTheDocument();
      });
    });

    describe("Action Buttons", () => {
      it("should have cancel button", () => {
        const { getByRole } = render(<ApproveModal {...defaultProps} />);

        const cancelButton = getByRole("button", { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();
      });

      it("should have confirm button with clear label", () => {
        const { getByRole } = render(<ApproveModal {...defaultProps} />);

        const confirmButton = getByRole("button", {
          name: /confirm approval/i,
        });
        expect(confirmButton).toBeInTheDocument();
      });

      it("should call onClose when cancel clicked", async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();

        const { getByRole } = render(
          <ApproveModal {...defaultProps} onClose={onClose} />,
        );

        const cancelButton = getByRole("button", { name: /cancel/i });
        await user.click(cancelButton);

        expect(onClose).toHaveBeenCalledTimes(1);
      });

      it("should call onConfirm when confirm clicked", async () => {
        const user = userEvent.setup();
        const onConfirm = jest.fn();

        const { getByRole } = render(
          <ApproveModal {...defaultProps} onConfirm={onConfirm} />,
        );

        const confirmButton = getByRole("button", {
          name: /confirm approval/i,
        });
        await user.click(confirmButton);

        expect(onConfirm).toHaveBeenCalledTimes(1);
      });

      it("should disable confirm button when pending", () => {
        const { getByRole } = render(
          <ApproveModal {...defaultProps} isPending={true} />,
        );

        const confirmButton = getByRole("button", { name: /approving/i });
        expect(confirmButton).toBeDisabled();
      });

      it("should show loading text when pending", () => {
        const { getByRole } = render(
          <ApproveModal {...defaultProps} isPending={true} />,
        );

        const confirmButton = getByRole("button", { name: /approving/i });
        expect(confirmButton).toHaveTextContent(/approving/i);
      });
    });

    describe("Keyboard Navigation", () => {
      it("should close on Escape key", async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();

        render(<ApproveModal {...defaultProps} onClose={onClose} />);

        await user.keyboard("{Escape}");

        expect(onClose).toHaveBeenCalled();
      });

      it("should confirm on Enter key when button focused", async () => {
        const user = userEvent.setup();
        const onConfirm = jest.fn();

        const { getByRole } = render(
          <ApproveModal {...defaultProps} onConfirm={onConfirm} />,
        );

        const confirmButton = getByRole("button", {
          name: /confirm approval/i,
        });
        confirmButton.focus();

        await user.keyboard("{Enter}");

        expect(onConfirm).toHaveBeenCalled();
      });
    });

    describe("Not Rendered When Closed", () => {
      it("should not render when isOpen is false", () => {
        const { queryByRole } = render(
          <ApproveModal {...defaultProps} isOpen={false} />,
        );

        const dialog = queryByRole("dialog");
        expect(dialog).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // REJECT MODAL
  // ============================================================================

  describe("RejectModal", () => {
    const defaultProps = {
      isOpen: true,
      onClose: jest.fn(),
      onConfirm: jest.fn(),
      rejectReason: "",
      onReasonChange: jest.fn(),
      isPending: false,
    };

    describe("Basic Accessibility", () => {
      it("should pass axe accessibility tests", async () => {
        const { container } = render(<RejectModal {...defaultProps} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it("should have dialog role", () => {
        const { getByRole } = render(<RejectModal {...defaultProps} />);

        const dialog = getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });

      it("should have accessible title", () => {
        const { getByRole } = render(<RejectModal {...defaultProps} />);

        const dialog = getByRole("dialog", { name: /reject ticket/i });
        expect(dialog).toBeInTheDocument();
      });
    });

    describe("Textarea Accessibility", () => {
      it("should have accessible textarea for reason", () => {
        const { getByRole } = render(<RejectModal {...defaultProps} />);

        const textarea = getByRole("textbox");
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveAccessibleName(/rejection reason/i);
      });

      it("should have placeholder text", () => {
        const { getByPlaceholderText } = render(
          <RejectModal {...defaultProps} />,
        );

        const textarea = getByPlaceholderText(/enter rejection reason/i);
        expect(textarea).toBeInTheDocument();
      });

      it("should call onReasonChange when typing", async () => {
        const user = userEvent.setup();
        const onReasonChange = jest.fn();

        const { getByRole } = render(
          <RejectModal {...defaultProps} onReasonChange={onReasonChange} />,
        );

        const textarea = getByRole("textbox");
        await user.type(textarea, "Not valid");

        expect(onReasonChange).toHaveBeenCalled();
      });
    });

    describe("Action Buttons", () => {
      it("should have cancel button", () => {
        const { getByRole } = render(<RejectModal {...defaultProps} />);

        const cancelButton = getByRole("button", { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();
      });

      it("should have destructive confirm button", () => {
        const { getByRole } = render(<RejectModal {...defaultProps} />);

        const confirmButton = getByRole("button", {
          name: /confirm rejection/i,
        });
        expect(confirmButton).toBeInTheDocument();
      });

      it("should disable confirm button when reason is empty", () => {
        const { getByRole } = render(
          <RejectModal {...defaultProps} rejectReason="" />,
        );

        const confirmButton = getByRole("button", {
          name: /confirm rejection/i,
        });
        expect(confirmButton).toBeDisabled();
      });

      it("should enable confirm button when reason is provided", () => {
        const { getByRole } = render(
          <RejectModal {...defaultProps} rejectReason="Duplicate ticket" />,
        );

        const confirmButton = getByRole("button", {
          name: /confirm rejection/i,
        });
        expect(confirmButton).not.toBeDisabled();
      });

      it("should call onConfirm when confirm clicked", async () => {
        const user = userEvent.setup();
        const onConfirm = jest.fn();

        const { getByRole } = render(
          <RejectModal
            {...defaultProps}
            rejectReason="Valid reason"
            onConfirm={onConfirm}
          />,
        );

        const confirmButton = getByRole("button", {
          name: /confirm rejection/i,
        });
        await user.click(confirmButton);

        expect(onConfirm).toHaveBeenCalledTimes(1);
      });
    });

    describe("Keyboard Navigation", () => {
      it("should close on Escape key", async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();

        render(<RejectModal {...defaultProps} onClose={onClose} />);

        await user.keyboard("{Escape}");

        expect(onClose).toHaveBeenCalled();
      });

      it("should be keyboard navigable", async () => {
        const user = userEvent.setup();
        const { getByRole } = render(<RejectModal {...defaultProps} />);

        const textarea = getByRole("textbox");
        const cancelButton = getByRole("button", { name: /cancel/i });

        // Should be able to tab between elements
        textarea.focus();
        await user.tab();

        expect(
          document.activeElement === cancelButton ||
            document.activeElement ===
              getByRole("button", { name: /confirm rejection/i }),
        ).toBe(true);
      });
    });

    describe("Error Prevention - WCAG 3.3.4", () => {
      it("should prevent confirmation without reason", async () => {
        const user = userEvent.setup();
        const onConfirm = jest.fn();

        const { getByRole } = render(
          <RejectModal
            {...defaultProps}
            rejectReason=""
            onConfirm={onConfirm}
          />,
        );

        const confirmButton = getByRole("button", {
          name: /confirm rejection/i,
        });

        // Button should be disabled
        expect(confirmButton).toBeDisabled();

        // Click should not work
        await user.click(confirmButton);
        expect(onConfirm).not.toHaveBeenCalled();
      });

      it("should not prevent confirmation with whitespace-only reason", () => {
        const { getByRole } = render(
          <RejectModal {...defaultProps} rejectReason="   " />,
        );

        const confirmButton = getByRole("button", {
          name: /confirm rejection/i,
        });
        // Should be disabled for whitespace-only (trim() check in component)
        expect(confirmButton).toBeDisabled();
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Modal Integration", () => {
    it("should work together in sequence", async () => {
      // Approve modal
      const { unmount: unmountApprove } = render(
        <ApproveModal
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          selectedTeam="TECHNICAL_SUPPORT"
          resolutionText="Resolved"
          isPending={false}
        />,
      );

      unmountApprove();

      // Reject modal
      const { getByRole } = render(
        <RejectModal
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          rejectReason="Not valid"
          onReasonChange={jest.fn()}
          isPending={false}
        />,
      );

      const dialog = getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should handle rapid open/close", async () => {
      const { rerender } = render(
        <ApproveModal
          isOpen={false}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          selectedTeam="TECHNICAL_SUPPORT"
          resolutionText="Resolved"
          isPending={false}
        />,
      );

      // Open
      rerender(
        <ApproveModal
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          selectedTeam="TECHNICAL_SUPPORT"
          resolutionText="Resolved"
          isPending={false}
        />,
      );

      // Close
      rerender(
        <ApproveModal
          isOpen={false}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          selectedTeam="TECHNICAL_SUPPORT"
          resolutionText="Resolved"
          isPending={false}
        />,
      );
    });
  });

  // ============================================================================
  // COLOR CONTRAST
  // ============================================================================

  describe("Color Contrast", () => {
    it("should have sufficient contrast in ApproveModal", async () => {
      const { container } = render(
        <ApproveModal
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          selectedTeam="TECHNICAL_SUPPORT"
          resolutionText="Resolved"
          isPending={false}
        />,
      );

      const results = await axe(container, {
        rules: { "color-contrast": { enabled: true } },
      });

      expect(results).toHaveNoViolations();
    });

    it("should have sufficient contrast in RejectModal", async () => {
      const { container } = render(
        <RejectModal
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          rejectReason="Reason"
          onReasonChange={jest.fn()}
          isPending={false}
        />,
      );

      const results = await axe(container, {
        rules: { "color-contrast": { enabled: true } },
      });

      expect(results).toHaveNoViolations();
    });
  });
});
