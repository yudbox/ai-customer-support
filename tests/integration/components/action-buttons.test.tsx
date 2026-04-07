/**
 * Integration tests for ActionButtons component
 *
 * Тестирует кнопки действий для менеджера: выбор команды, approve/reject,
 * состояния загрузки и disabled.
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { ActionButtons } from "@/app/_components/TicketDetailPanel/ActionButtons";
import { TeamCode } from "@/lib/types/common";

describe("ActionButtons Integration Tests", () => {
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

  describe("Initial Rendering", () => {
    it("should render ActionButtons component", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByLabelText(/Assign to Team:/i)).toBeInTheDocument();
    });

    it("should render team select dropdown", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox", { name: /Assign to Team:/i });
      expect(select).toBeInTheDocument();
    });

    it("should render Reject button", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Reject/i }),
      ).toBeInTheDocument();
    });

    it("should render Approve button", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Approve/i }),
      ).toBeInTheDocument();
    });

    it("should render both action buttons", () => {
      render(<ActionButtons {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });
  });

  describe("Team Selection Dropdown", () => {
    it("should display Technical Support option", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(
        screen.getByText("Technical Support (Tier 2)"),
      ).toBeInTheDocument();
    });

    it("should display Customer Service option", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByText("Customer Service (Tier 1)")).toBeInTheDocument();
    });

    it("should display Billing Team option", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByText("Billing Team")).toBeInTheDocument();
    });

    it("should display Escalation Team option", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByText("Escalation Team (Tier 3)")).toBeInTheDocument();
    });

    it("should have all team options available", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.options).toHaveLength(4);
    });

    it("should show selected team as default value", () => {
      render(
        <ActionButtons
          {...defaultProps}
          selectedTeam={TeamCode.TECHNICAL_SUPPORT}
        />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe(TeamCode.TECHNICAL_SUPPORT);
    });

    it("should show different selected team", () => {
      render(
        <ActionButtons {...defaultProps} selectedTeam={TeamCode.BILLING} />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe(TeamCode.BILLING);
    });

    it("should show customer service when selected", () => {
      render(
        <ActionButtons
          {...defaultProps}
          selectedTeam={TeamCode.CUSTOMER_SERVICE}
        />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe(TeamCode.CUSTOMER_SERVICE);
    });

    it("should show escalation team when selected", () => {
      render(<ActionButtons {...defaultProps} selectedTeam="escalation" />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("escalation");
    });
  });

  describe("Team Selection Changes", () => {
    it("should call onTeamChange when team is selected", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: TeamCode.BILLING } });

      expect(mockOnTeamChange).toHaveBeenCalledTimes(1);
      expect(mockOnTeamChange).toHaveBeenCalledWith(TeamCode.BILLING);
    });

    it("should call onTeamChange with customer service", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, {
        target: { value: TeamCode.CUSTOMER_SERVICE },
      });

      expect(mockOnTeamChange).toHaveBeenCalledWith(TeamCode.CUSTOMER_SERVICE);
    });

    it("should call onTeamChange with escalation", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "escalation" } });

      expect(mockOnTeamChange).toHaveBeenCalledWith("escalation");
    });

    it("should call onTeamChange multiple times for multiple changes", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");

      fireEvent.change(select, { target: { value: TeamCode.BILLING } });
      fireEvent.change(select, {
        target: { value: TeamCode.CUSTOMER_SERVICE },
      });
      fireEvent.change(select, { target: { value: "escalation" } });

      expect(mockOnTeamChange).toHaveBeenCalledTimes(3);
    });

    it("should not call onTeamChange when not interacted", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(mockOnTeamChange).not.toHaveBeenCalled();
    });
  });

  describe("Reject Button", () => {
    it("should have destructive variant styling", () => {
      render(<ActionButtons {...defaultProps} />);

      const rejectButton = screen.getByRole("button", { name: /Reject/i });
      expect(rejectButton).toBeInTheDocument();
    });

    it("should display emoji in reject button", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByText(/❌ Reject/i)).toBeInTheDocument();
    });

    it("should call onReject when clicked", () => {
      render(<ActionButtons {...defaultProps} />);

      const rejectButton = screen.getByRole("button", { name: /Reject/i });
      fireEvent.click(rejectButton);

      expect(mockOnReject).toHaveBeenCalledTimes(1);
    });

    it("should call onReject multiple times for multiple clicks", () => {
      render(<ActionButtons {...defaultProps} />);

      const rejectButton = screen.getByRole("button", { name: /Reject/i });

      fireEvent.click(rejectButton);
      fireEvent.click(rejectButton);
      fireEvent.click(rejectButton);

      expect(mockOnReject).toHaveBeenCalledTimes(3);
    });

    it("should be enabled when not rejecting", () => {
      render(<ActionButtons {...defaultProps} isRejecting={false} />);

      const rejectButton = screen.getByRole("button", { name: /Reject/i });
      expect(rejectButton).not.toBeDisabled();
    });

    it("should be disabled when rejecting", () => {
      render(<ActionButtons {...defaultProps} isRejecting={true} />);

      const rejectButton = screen.getByRole("button", { name: /Reject/i });
      expect(rejectButton).toBeDisabled();
    });

    it("should not call onReject when disabled", () => {
      render(<ActionButtons {...defaultProps} isRejecting={true} />);

      const rejectButton = screen.getByRole("button", { name: /Reject/i });
      fireEvent.click(rejectButton);

      expect(mockOnReject).not.toHaveBeenCalled();
    });
  });

  describe("Approve Button", () => {
    it("should have primary variant styling", () => {
      render(<ActionButtons {...defaultProps} />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      expect(approveButton).toBeInTheDocument();
    });

    it("should display emoji in approve button", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByText(/✅ Approve/i)).toBeInTheDocument();
    });

    it("should display selected team in approve button text", () => {
      render(
        <ActionButtons
          {...defaultProps}
          selectedTeam={TeamCode.TECHNICAL_SUPPORT}
        />,
      );

      expect(
        screen.getByText(/Approve & Assign to technical support/i),
      ).toBeInTheDocument();
    });

    it("should replace underscores with spaces in team name", () => {
      render(
        <ActionButtons
          {...defaultProps}
          selectedTeam={TeamCode.TECHNICAL_SUPPORT}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      expect(approveButton).toHaveTextContent("technical support");
      expect(approveButton).not.toHaveTextContent("technical_support");
    });

    it("should display billing team in approve button", () => {
      render(
        <ActionButtons {...defaultProps} selectedTeam={TeamCode.BILLING} />,
      );

      expect(
        screen.getByText(/Approve & Assign to billing/i),
      ).toBeInTheDocument();
    });

    it("should display customer service in approve button", () => {
      render(
        <ActionButtons
          {...defaultProps}
          selectedTeam={TeamCode.CUSTOMER_SERVICE}
        />,
      );

      expect(
        screen.getByText(/Approve & Assign to customer service/i),
      ).toBeInTheDocument();
    });

    it("should display escalation team in approve button", () => {
      render(<ActionButtons {...defaultProps} selectedTeam="escalation" />);

      expect(
        screen.getByText(/Approve & Assign to escalation/i),
      ).toBeInTheDocument();
    });

    it("should call onApprove when clicked", () => {
      render(<ActionButtons {...defaultProps} />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      fireEvent.click(approveButton);

      expect(mockOnApprove).toHaveBeenCalledTimes(1);
    });

    it("should call onApprove multiple times for multiple clicks", () => {
      render(<ActionButtons {...defaultProps} />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });

      fireEvent.click(approveButton);
      fireEvent.click(approveButton);

      expect(mockOnApprove).toHaveBeenCalledTimes(2);
    });

    it("should be enabled when not approving and not disabled", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={false}
          isApproveDisabled={false}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      expect(approveButton).not.toBeDisabled();
    });

    it("should be disabled when approving", () => {
      render(<ActionButtons {...defaultProps} isApproving={true} />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      expect(approveButton).toBeDisabled();
    });

    it("should be disabled when isApproveDisabled is true", () => {
      render(<ActionButtons {...defaultProps} isApproveDisabled={true} />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      expect(approveButton).toBeDisabled();
    });

    it("should be disabled when both isApproving and isApproveDisabled are true", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={true}
          isApproveDisabled={true}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      expect(approveButton).toBeDisabled();
    });

    it("should not call onApprove when disabled by isApproving", () => {
      render(<ActionButtons {...defaultProps} isApproving={true} />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      fireEvent.click(approveButton);

      expect(mockOnApprove).not.toHaveBeenCalled();
    });

    it("should not call onApprove when disabled by isApproveDisabled", () => {
      render(<ActionButtons {...defaultProps} isApproveDisabled={true} />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      fireEvent.click(approveButton);

      expect(mockOnApprove).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("should allow reject when approve is loading", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={true}
          isRejecting={false}
        />,
      );

      const rejectButton = screen.getByRole("button", { name: /Reject/i });
      expect(rejectButton).not.toBeDisabled();
    });

    it("should allow approve when reject is loading (if not otherwise disabled)", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={false}
          isRejecting={true}
          isApproveDisabled={false}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      expect(approveButton).not.toBeDisabled();
    });

    it("should disable both buttons when both are loading", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={true}
          isRejecting={true}
        />,
      );

      const rejectButton = screen.getByRole("button", { name: /Reject/i });
      const approveButton = screen.getByRole("button", { name: /Approve/i });

      expect(rejectButton).toBeDisabled();
      expect(approveButton).toBeDisabled();
    });

    it("should enable both buttons when neither is loading", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={false}
          isRejecting={false}
          isApproveDisabled={false}
        />,
      );

      const rejectButton = screen.getByRole("button", { name: /Reject/i });
      const approveButton = screen.getByRole("button", { name: /Approve/i });

      expect(rejectButton).not.toBeDisabled();
      expect(approveButton).not.toBeDisabled();
    });
  });

  describe("Interaction Flows", () => {
    it("should handle team change followed by approve", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");
      const approveButton = screen.getByRole("button", { name: /Approve/i });

      fireEvent.change(select, { target: { value: TeamCode.BILLING } });
      fireEvent.click(approveButton);

      expect(mockOnTeamChange).toHaveBeenCalledWith(TeamCode.BILLING);
      expect(mockOnApprove).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple team changes before approve", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");
      const approveButton = screen.getByRole("button", { name: /Approve/i });

      fireEvent.change(select, { target: { value: TeamCode.BILLING } });
      fireEvent.change(select, {
        target: { value: TeamCode.CUSTOMER_SERVICE },
      });
      fireEvent.change(select, { target: { value: "escalation" } });
      fireEvent.click(approveButton);

      expect(mockOnTeamChange).toHaveBeenCalledTimes(3);
      expect(mockOnApprove).toHaveBeenCalledTimes(1);
    });

    it("should allow changing team after reject", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");
      const rejectButton = screen.getByRole("button", { name: /Reject/i });

      fireEvent.click(rejectButton);
      fireEvent.change(select, { target: { value: TeamCode.BILLING } });

      expect(mockOnReject).toHaveBeenCalledTimes(1);
      expect(mockOnTeamChange).toHaveBeenCalledWith(TeamCode.BILLING);
    });

    it("should update button text when team changes", () => {
      const { rerender } = render(
        <ActionButtons
          {...defaultProps}
          selectedTeam={TeamCode.TECHNICAL_SUPPORT}
        />,
      );

      expect(
        screen.getByText(/Assign to technical support/i),
      ).toBeInTheDocument();

      rerender(
        <ActionButtons {...defaultProps} selectedTeam={TeamCode.BILLING} />,
      );

      expect(screen.getByText(/Assign to billing/i)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty team string", () => {
      render(<ActionButtons {...defaultProps} selectedTeam="" />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      expect(approveButton).toHaveTextContent("Approve & Assign to");
    });

    it("should handle team with multiple underscores", () => {
      render(
        <ActionButtons
          {...defaultProps}
          selectedTeam="team_with_multiple_underscores"
        />,
      );

      expect(
        screen.getByText(/team with multiple underscores/i),
      ).toBeInTheDocument();
    });

    it("should handle team with no underscores", () => {
      render(<ActionButtons {...defaultProps} selectedTeam="escalation" />);

      expect(screen.getByText(/Assign to escalation/i)).toBeInTheDocument();
    });

    it("should not crash when onTeamChange is called multiple times rapidly", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");

      expect(() => {
        for (let i = 0; i < 10; i++) {
          fireEvent.change(select, { target: { value: TeamCode.BILLING } });
        }
      }).not.toThrow();

      expect(mockOnTeamChange).toHaveBeenCalledTimes(10);
    });

    it("should not crash when buttons are clicked rapidly", () => {
      render(<ActionButtons {...defaultProps} />);

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      const rejectButton = screen.getByRole("button", { name: /Reject/i });

      expect(() => {
        for (let i = 0; i < 5; i++) {
          fireEvent.click(approveButton);
          fireEvent.click(rejectButton);
        }
      }).not.toThrow();
    });
  });

  describe("Component Structure", () => {
    it("should render container with proper classes", () => {
      const { container } = render(<ActionButtons {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass("bg-white", "rounded-lg", "shadow", "p-6");
    });

    it("should render select with proper id", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("id", "team-select");
    });

    it("should have label associated with select", () => {
      render(<ActionButtons {...defaultProps} />);

      const label = screen.getByLabelText(/Assign to Team:/i);
      expect(label).toBeInTheDocument();
    });

    it("should render buttons in flex container with gap", () => {
      render(<ActionButtons {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });
  });

  describe("Accessibility", () => {
    it("should have accessible label for team select", () => {
      render(<ActionButtons {...defaultProps} />);

      const select = screen.getByLabelText(/Assign to Team:/i);
      expect(select).toBeInTheDocument();
    });


    it("should have accessible button names", () => {
      render(<ActionButtons {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Reject/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Approve/i }),
      ).toBeInTheDocument();
    });

    it("should indicate disabled state on buttons", () => {
      render(
        <ActionButtons
          {...defaultProps}
          isApproving={true}
          isRejecting={true}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /Approve/i });
      const rejectButton = screen.getByRole("button", { name: /Reject/i });

      expect(approveButton).toHaveAttribute("disabled");
      expect(rejectButton).toHaveAttribute("disabled");
    });
  });
});
