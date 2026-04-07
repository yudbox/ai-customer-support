import { render, screen, fireEvent } from "@testing-library/react";

import { ActionButtons } from "@/app/_components/TicketDetailPanel/ActionButtons";
import { TeamCode } from "@/lib/types/common";

describe("ActionButtons Component", () => {
  const mockOnTeamChange = jest.fn();
  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();

  const defaultProps = {
    selectedTeam: TeamCode.TECHNICAL_SUPPORT,
    onTeamChange: mockOnTeamChange,
    onApprove: mockOnApprove,
    onReject: mockOnReject,
    isApproving: false,
    isRejecting: false,
    isApproveDisabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders container with correct styling", () => {
      render(<ActionButtons {...defaultProps} />);

      // Check for the main container with nested elements
      expect(screen.getByText("Assign to Team:")).toBeInTheDocument();
    });

    it("renders team selection label", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByText("Assign to Team:")).toBeInTheDocument();
    });

    it("renders team select dropdown", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByLabelText("Assign to Team:");
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute("id", "team-select");
    });

    it("renders all team options", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(
        screen.getByRole("option", { name: "Technical Support (Tier 2)" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Customer Service (Tier 1)" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Billing Team" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Escalation Team (Tier 3)" }),
      ).toBeInTheDocument();
    });

    it("renders reject button", () => {
      render(<ActionButtons {...defaultProps} />);

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      expect(rejectButton).toBeInTheDocument();
      expect(rejectButton).toHaveTextContent("❌ Reject");
    });

    it("renders approve button with dynamic team name", () => {
      render(<ActionButtons {...defaultProps} />);

      const approveButton = screen.getByRole("button", {
        name: /approve & assign to technical support/i,
      });
      expect(approveButton).toBeInTheDocument();
      expect(approveButton).toHaveTextContent(
        "✅ Approve & Assign to technical support",
      );
    });
  });

  describe("Team Selection", () => {
    it("displays currently selected team", () => {
      render(
        <ActionButtons {...defaultProps} selectedTeam={TeamCode.BILLING} />,
      );

      const select = screen.getByLabelText("Assign to Team:");
      expect(select).toHaveValue(TeamCode.BILLING);
    });

    it("calls onTeamChange when team is changed", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByLabelText("Assign to Team:");
      fireEvent.change(select, {
        target: { value: TeamCode.CUSTOMER_SERVICE },
      });

      expect(mockOnTeamChange).toHaveBeenCalledWith(TeamCode.CUSTOMER_SERVICE);
      expect(mockOnTeamChange).toHaveBeenCalledTimes(1);
    });

    it("updates approve button text when team changes", () => {
      render(<ActionButtons {...defaultProps} selectedTeam="escalation" />);

      const approveButton = screen.getByRole("button", {
        name: /approve & assign to escalation/i,
      });
      expect(approveButton).toHaveTextContent(
        "✅ Approve & Assign to escalation",
      );
    });

    it("replaces underscores with spaces in team name", () => {
      render(
        <ActionButtons
          {...defaultProps}
          selectedTeam={TeamCode.CUSTOMER_SERVICE}
        />,
      );

      const approveButton = screen.getByRole("button", {
        name: /approve & assign to customer service/i,
      });
      expect(approveButton).toHaveTextContent(
        "✅ Approve & Assign to customer service",
      );
    });

    it("has correct option values", () => {
      render(<ActionButtons {...defaultProps} />);

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveValue(TeamCode.TECHNICAL_SUPPORT);
      expect(options[1]).toHaveValue(TeamCode.CUSTOMER_SERVICE);
      expect(options[2]).toHaveValue(TeamCode.BILLING);
      expect(options[3]).toHaveValue("escalation");
    });
  });

  describe("Button Interactions", () => {
    it("calls onApprove when approve button is clicked", () => {
      render(<ActionButtons {...defaultProps} />);

      const approveButton = screen.getByRole("button", { name: /approve/i });
      fireEvent.click(approveButton);

      expect(mockOnApprove).toHaveBeenCalledTimes(1);
    });

    it("calls onReject when reject button is clicked", () => {
      render(<ActionButtons {...defaultProps} />);

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      fireEvent.click(rejectButton);

      expect(mockOnReject).toHaveBeenCalledTimes(1);
    });

    it("does not call handlers when buttons are clicked multiple times rapidly", () => {
      render(<ActionButtons {...defaultProps} />);

      const approveButton = screen.getByRole("button", { name: /approve/i });
      fireEvent.click(approveButton);
      fireEvent.click(approveButton);
      fireEvent.click(approveButton);

      expect(mockOnApprove).toHaveBeenCalledTimes(3);
    });
  });

  describe("Disabled States - Approve Button", () => {
    it("disables approve button when isApproving is true", () => {
      render(<ActionButtons {...defaultProps} isApproving={true} />);

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton).toBeDisabled();
    });

    it("disables approve button when isApproveDisabled is true", () => {
      render(<ActionButtons {...defaultProps} isApproveDisabled={true} />);

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton).toBeDisabled();
    });

    it("disables approve button when both isApproving and isApproveDisabled are true", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={true}
          isApproveDisabled={true}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton).toBeDisabled();
    });

    it("enables approve button when both flags are false", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={false}
          isApproveDisabled={false}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton).not.toBeDisabled();
    });

    it("does not call onApprove when disabled button is clicked", () => {
      render(<ActionButtons {...defaultProps} isApproving={true} />);

      const approveButton = screen.getByRole("button", { name: /approve/i });
      fireEvent.click(approveButton);

      expect(mockOnApprove).not.toHaveBeenCalled();
    });
  });

  describe("Disabled States - Reject Button", () => {
    it("disables reject button when isRejecting is true", () => {
      render(<ActionButtons {...defaultProps} isRejecting={true} />);

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      expect(rejectButton).toBeDisabled();
    });

    it("enables reject button when isRejecting is false", () => {
      render(<ActionButtons {...defaultProps} isRejecting={false} />);

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      expect(rejectButton).not.toBeDisabled();
    });

    it("does not call onReject when disabled button is clicked", () => {
      render(<ActionButtons {...defaultProps} isRejecting={true} />);

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      fireEvent.click(rejectButton);

      expect(mockOnReject).not.toHaveBeenCalled();
    });
  });

  describe("Button Layout and Styling", () => {
    it("applies destructive variant to reject button", () => {
      render(<ActionButtons {...defaultProps} />);
      const rejectButton = screen.getByRole("button", { name: /reject/i });

      // Button component should have destructive styling
      expect(rejectButton).toBeInTheDocument();
    });

    it("applies primary variant to approve button", () => {
      render(<ActionButtons {...defaultProps} />);
      const approveButton = screen.getByRole("button", { name: /approve/i });

      // Button component should have primary styling
      expect(approveButton).toBeInTheDocument();
      expect(approveButton).toHaveClass("ml-auto");
    });

    it("renders buttons in flex container with gap", () => {
      render(<ActionButtons {...defaultProps} />);

      // Check buttons are rendered (they're in a flex container)
      expect(
        screen.getByRole("button", { name: /approve/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /reject/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Select Styling", () => {
    it("applies correct classes to select element", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByLabelText("Assign to Team:");
      expect(select).toHaveClass(
        "w-full",
        "px-3",
        "py-2",
        "border",
        "border-gray-300",
        "rounded-md",
      );
    });

    it("has focus styles on select", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByLabelText("Assign to Team:");
      expect(select).toHaveClass("focus:outline-none", "focus:ring-2");
    });
  });

  describe("Accessibility", () => {
    it("has proper label association with select", () => {
      render(<ActionButtons {...defaultProps} />);

      const label = screen.getByText("Assign to Team:");
      const select = screen.getByLabelText("Assign to Team:");

      expect(label).toHaveAttribute("for", "team-select");
      expect(select).toHaveAttribute("id", "team-select");
    });

    it("buttons are keyboard accessible", () => {
      render(<ActionButtons {...defaultProps} />);

      const approveButton = screen.getByRole("button", { name: /approve/i });
      const rejectButton = screen.getByRole("button", { name: /reject/i });

      expect(approveButton.tagName).toBe("BUTTON");
      expect(rejectButton.tagName).toBe("BUTTON");
    });

    it("select is keyboard accessible", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByLabelText("Assign to Team:");
      expect(select.tagName).toBe("SELECT");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty team name gracefully", () => {
      render(<ActionButtons {...defaultProps} selectedTeam="" />);

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton).toHaveTextContent("✅ Approve & Assign to");
    });

    it("handles team name without underscores", () => {
      render(
        <ActionButtons {...defaultProps} selectedTeam={TeamCode.BILLING} />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton).toHaveTextContent("✅ Approve & Assign to billing");
    });

    it("handles multiple underscores in team name", () => {
      render(
        <ActionButtons {...defaultProps} selectedTeam="super_special_team" />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton).toHaveTextContent(
        "✅ Approve & Assign to super special team",
      );
    });
  });

  describe("Component State Combinations", () => {
    it("renders correctly when both buttons are disabled", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={true}
          isRejecting={true}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      const rejectButton = screen.getByRole("button", { name: /reject/i });

      expect(approveButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });

    it("allows team selection while buttons are disabled", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={true}
          isRejecting={true}
        />,
      );

      const select = screen.getByLabelText("Assign to Team:");
      fireEvent.change(select, { target: { value: TeamCode.BILLING } });

      expect(mockOnTeamChange).toHaveBeenCalledWith(TeamCode.BILLING);
    });

    it("maintains team selection across re-renders", () => {
      const { rerender } = render(
        <ActionButtons {...defaultProps} selectedTeam="billing" />,
      );

      let select = screen.getByLabelText("Assign to Team:");
      expect(select).toHaveValue("billing");

      rerender(
        <ActionButtons
          {...defaultProps}
          selectedTeam="escalation"
          isApproving={true}
        />,
      );

      select = screen.getByLabelText("Assign to Team:");
      expect(select).toHaveValue("escalation");
    });
  });
});
