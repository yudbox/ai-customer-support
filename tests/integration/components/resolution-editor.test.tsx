/**
 * Integration tests for ResolutionEditor component
 *
 * Тестирует редактор резолюции: ввод текста, кнопки AI/Custom,
 * индикатор статуса, валидация.
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { ResolutionEditor } from "@/app/_components/TicketDetailPanel/ResolutionEditor";

// Mock Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => {
    return (
      <button onClick={onClick} className={className}>
        {children}
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
    className,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
  }) => {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
    );
  },
}));

describe("ResolutionEditor Integration Tests", () => {
  const mockOnResolutionChange = jest.fn();

  const defaultProps = {
    resolutionText: "",
    onResolutionChange: mockOnResolutionChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render all main sections", () => {
      render(<ResolutionEditor {...defaultProps} />);

      expect(screen.getByText(/✍️ Resolution/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Enter resolution for this ticket/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/⚠️ Resolution required/i)).toBeInTheDocument();
    });

    it("should render without crashing", () => {
      expect(() =>
        render(<ResolutionEditor {...defaultProps} />),
      ).not.toThrow();
    });
  });

  describe("Header Title", () => {
    it("should display Resolution header with emoji", () => {
      render(<ResolutionEditor {...defaultProps} />);

      expect(screen.getByText("✍️ Resolution")).toBeInTheDocument();
    });

    it("should have correct styling for header", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const header = screen.getByText("✍️ Resolution");
      expect(header.tagName).toBe("H2");
      expect(header).toHaveClass("text-lg", "font-bold", "text-gray-900");
    });
  });

  describe("Write Custom Button", () => {
    it("should always render Write Custom button", () => {
      render(<ResolutionEditor {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /✏️ Write Custom/i }),
      ).toBeInTheDocument();
    });

    it("should render Write Custom button without AI solution", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={undefined} />,
      );

      expect(
        screen.getByRole("button", { name: /✏️ Write Custom/i }),
      ).toBeInTheDocument();
    });

    it("should have secondary variant styling", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const button = screen.getByRole("button", { name: /✏️ Write Custom/i });
      expect(button).toBeInTheDocument();
    });

    it("should call onResolutionChange with empty string when clicked", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="Some text" />);

      const button = screen.getByRole("button", { name: /✏️ Write Custom/i });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(1);
      expect(mockOnResolutionChange).toHaveBeenCalledWith("");
    });

    it("should clear text when clicked with existing resolution", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText="Existing resolution"
        />,
      );

      const button = screen.getByRole("button", { name: /✏️ Write Custom/i });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledWith("");
    });

    it("should work when clicked multiple times", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const button = screen.getByRole("button", { name: /✏️ Write Custom/i });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(3);
      expect(mockOnResolutionChange).toHaveBeenCalledWith("");
    });
  });

  describe("Use AI Solution Button", () => {
    it("should render when suggestedSolution is provided", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          suggestedSolution="AI generated solution"
        />,
      );

      expect(
        screen.getByRole("button", { name: /🤖 Use AI Solution/i }),
      ).toBeInTheDocument();
    });

    it("should not render when suggestedSolution is undefined", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={undefined} />,
      );

      expect(
        screen.queryByRole("button", { name: /🤖 Use AI Solution/i }),
      ).not.toBeInTheDocument();
    });

    it("should not render when suggestedSolution is empty string", () => {
      render(<ResolutionEditor {...defaultProps} suggestedSolution="" />);

      expect(
        screen.queryByRole("button", { name: /🤖 Use AI Solution/i }),
      ).not.toBeInTheDocument();
    });

    it("should call onResolutionChange with suggestedSolution when clicked", () => {
      const aiSolution = "Please check your email settings";
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={aiSolution} />,
      );

      const button = screen.getByRole("button", {
        name: /🤖 Use AI Solution/i,
      });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(1);
      expect(mockOnResolutionChange).toHaveBeenCalledWith(aiSolution);
    });

    it("should work with long AI solution", () => {
      const longSolution = "A".repeat(500);
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={longSolution} />,
      );

      const button = screen.getByRole("button", {
        name: /🤖 Use AI Solution/i,
      });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledWith(longSolution);
    });

    it("should work with AI solution containing special characters", () => {
      const specialSolution = "Issue: #123 - Contact support@email.com";
      render(
        <ResolutionEditor
          {...defaultProps}
          suggestedSolution={specialSolution}
        />,
      );

      const button = screen.getByRole("button", {
        name: /🤖 Use AI Solution/i,
      });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledWith(specialSolution);
    });

    it("should display both buttons when AI solution exists", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      expect(
        screen.getByRole("button", { name: /🤖 Use AI Solution/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /✏️ Write Custom/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Textarea Input", () => {
    it("should render textarea with correct placeholder", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(
        "Enter resolution for this ticket... (required)",
      );
      expect(textarea).toBeInTheDocument();
    });

    it("should render textarea with 6 rows", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(
        /Enter resolution/i,
      ) as HTMLTextAreaElement;
      expect(textarea.rows).toBe(6);
    });

    it("should display textarea as main input element", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should have font-mono styling", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      expect(textarea).toHaveClass("font-mono", "text-sm");
    });

    it("should display empty textarea initially", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const textarea = screen.getByPlaceholderText(
        /Enter resolution/i,
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("");
    });

    it("should display provided resolution text", () => {
      render(
        <ResolutionEditor {...defaultProps} resolutionText="Fixed the issue" />,
      );

      const textarea = screen.getByPlaceholderText(
        /Enter resolution/i,
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Fixed the issue");
    });

    it("should call onResolutionChange when typing", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      fireEvent.change(textarea, { target: { value: "New resolution" } });

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(1);
      expect(mockOnResolutionChange).toHaveBeenCalledWith("New resolution");
    });

    it("should handle multiline text input", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      const multilineText = "Line 1\nLine 2\nLine 3";

      fireEvent.change(textarea, { target: { value: multilineText } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith(multilineText);
    });

    it("should handle long text input", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      const longText = "A".repeat(1000);

      fireEvent.change(textarea, { target: { value: longText } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith(longText);
    });

    it("should handle special characters", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      const specialText = "Issue #123: $100 refund @ customer@email.com";

      fireEvent.change(textarea, { target: { value: specialText } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith(specialText);
    });

    it("should handle clearing text", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="Some text" />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      fireEvent.change(textarea, { target: { value: "" } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith("");
    });

    it("should handle emoji in text", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      fireEvent.change(textarea, { target: { value: "✓ Issue resolved 🎉" } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith(
        "✓ Issue resolved 🎉",
      );
    });
  });

  describe("Status Indicator - Empty State", () => {
    it("should show warning when resolution is empty", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });

    it("should show warning when resolution is only spaces", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="   " />);

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });

    it("should have red text color when empty", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const warning = screen.getByText("⚠️ Resolution required");
      expect(warning).toHaveClass("text-red-500");
    });

    it("should show warning with only whitespace", () => {
      render(
        <ResolutionEditor {...defaultProps} resolutionText="          " />,
      );

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });
  });

  describe("Status Indicator - Filled State", () => {
    it("should show character count when resolution has text", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="Hello" />);

      expect(screen.getByText("✓ 5 characters")).toBeInTheDocument();
    });

    it("should have green text color when filled", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="Some text" />);

      const status = screen.getByText(/✓ \d+ characters/);
      expect(status).toHaveClass("text-green-600", "font-medium");
    });

    it("should update character count correctly", () => {
      const { rerender } = render(
        <ResolutionEditor {...defaultProps} resolutionText="Hi" />,
      );

      expect(screen.getByText("✓ 2 characters")).toBeInTheDocument();

      rerender(
        <ResolutionEditor {...defaultProps} resolutionText="Hello World" />,
      );

      expect(screen.getByText("✓ 11 characters")).toBeInTheDocument();
    });

    it("should count all characters including spaces", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="a b c d" />);

      expect(screen.getByText("✓ 7 characters")).toBeInTheDocument();
    });

    it("should count all characters in multiline text", () => {
      render(
        <ResolutionEditor {...defaultProps} resolutionText="Line1 Line2" />,
      );

      expect(screen.getByText("✓ 11 characters")).toBeInTheDocument();
    });

    it("should show 1 character for single character", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="A" />);

      expect(screen.getByText("✓ 1 characters")).toBeInTheDocument();
    });

    it("should handle long text character count", () => {
      const longText = "A".repeat(500);
      render(<ResolutionEditor {...defaultProps} resolutionText={longText} />);

      expect(screen.getByText("✓ 500 characters")).toBeInTheDocument();
    });

    it("should not show character count for whitespace-only text", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="   " />);

      expect(screen.queryByText(/✓ \d+ characters/)).not.toBeInTheDocument();
      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });
  });

  describe("Complete Workflows", () => {
    it("should handle typing resolution from empty", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);
      fireEvent.change(textarea, { target: { value: "Resolution text" } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith("Resolution text");
    });

    it("should handle using AI solution workflow", () => {
      const aiSolution = "Please restart your device";
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={aiSolution} />,
      );

      const aiButton = screen.getByRole("button", {
        name: /🤖 Use AI Solution/i,
      });
      fireEvent.click(aiButton);

      expect(mockOnResolutionChange).toHaveBeenCalledWith(aiSolution);
    });

    it("should handle clearing custom text workflow", () => {
      render(
        <ResolutionEditor {...defaultProps} resolutionText="Custom text" />,
      );

      const customButton = screen.getByRole("button", {
        name: /✏️ Write Custom/i,
      });
      fireEvent.click(customButton);

      expect(mockOnResolutionChange).toHaveBeenCalledWith("");
    });

    it("should handle switching from AI to custom", () => {
      const aiSolution = "AI solution";
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={aiSolution} />,
      );

      const aiButton = screen.getByRole("button", {
        name: /🤖 Use AI Solution/i,
      });
      fireEvent.click(aiButton);

      expect(mockOnResolutionChange).toHaveBeenCalledWith(aiSolution);

      const customButton = screen.getByRole("button", {
        name: /✏️ Write Custom/i,
      });
      fireEvent.click(customButton);

      expect(mockOnResolutionChange).toHaveBeenLastCalledWith("");
    });

    it("should handle rapid typing", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Enter resolution/i);

      fireEvent.change(textarea, { target: { value: "A" } });
      fireEvent.change(textarea, { target: { value: "AB" } });
      fireEvent.change(textarea, { target: { value: "ABC" } });

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(3);
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(1, "A");
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(2, "AB");
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(3, "ABC");
    });
  });

  describe("Edge Cases", () => {
    it("should handle text with leading whitespace", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText="  Text with spaces"
        />,
      );

      const textarea = screen.getByPlaceholderText(
        /Enter resolution/i,
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("  Text with spaces");
      expect(screen.getByText("✓ 18 characters")).toBeInTheDocument();
    });

    it("should handle text with trailing whitespace", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText="Text with spaces  "
        />,
      );

      const textarea = screen.getByPlaceholderText(
        /Enter resolution/i,
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("Text with spaces  ");
      expect(screen.getByText("✓ 18 characters")).toBeInTheDocument();
    });

    it("should handle very long resolution text", () => {
      const longText = "A".repeat(10000);
      render(<ResolutionEditor {...defaultProps} resolutionText={longText} />);

      const textarea = screen.getByPlaceholderText(
        /Enter resolution/i,
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
      expect(screen.getByText("✓ 10000 characters")).toBeInTheDocument();
    });

    it("should handle text with only spaces", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="        " />);

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });

    it("should handle text with leading spaces", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="    Text" />);

      expect(screen.getByText("✓ 8 characters")).toBeInTheDocument();
    });

    it("should handle rapid button clicks", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      const aiButton = screen.getByRole("button", {
        name: /🤖 Use AI Solution/i,
      });
      const customButton = screen.getByRole("button", {
        name: /✏️ Write Custom/i,
      });

      fireEvent.click(aiButton);
      fireEvent.click(customButton);
      fireEvent.click(aiButton);
      fireEvent.click(customButton);

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(4);
    });

    it("should handle undefined suggested solution gracefully", () => {
      expect(() =>
        render(
          <ResolutionEditor {...defaultProps} suggestedSolution={undefined} />,
        ),
      ).not.toThrow();
    });

    it("should handle empty string suggested solution", () => {
      render(<ResolutionEditor {...defaultProps} suggestedSolution="" />);

      expect(
        screen.queryByRole("button", { name: /🤖 Use AI Solution/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("State Transitions", () => {
    it("should transition from empty to filled state", () => {
      const { rerender } = render(
        <ResolutionEditor {...defaultProps} resolutionText="" />,
      );

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();

      rerender(
        <ResolutionEditor {...defaultProps} resolutionText="Now filled" />,
      );

      expect(
        screen.queryByText("⚠️ Resolution required"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("✓ 10 characters")).toBeInTheDocument();
    });

    it("should transition from filled to empty state", () => {
      const { rerender } = render(
        <ResolutionEditor {...defaultProps} resolutionText="Some text" />,
      );

      expect(screen.getByText("✓ 9 characters")).toBeInTheDocument();

      rerender(<ResolutionEditor {...defaultProps} resolutionText="" />);

      expect(screen.queryByText(/✓ \d+ characters/)).not.toBeInTheDocument();
      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });

    it("should transition from filled to whitespace-only state", () => {
      const { rerender } = render(
        <ResolutionEditor {...defaultProps} resolutionText="Valid text" />,
      );

      expect(screen.getByText("✓ 10 characters")).toBeInTheDocument();

      rerender(<ResolutionEditor {...defaultProps} resolutionText="   " />);

      expect(screen.queryByText(/✓ \d+ characters/)).not.toBeInTheDocument();
      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });

    it("should update character count dynamically", () => {
      const { rerender } = render(
        <ResolutionEditor {...defaultProps} resolutionText="Hi" />,
      );

      expect(screen.getByText("✓ 2 characters")).toBeInTheDocument();

      rerender(<ResolutionEditor {...defaultProps} resolutionText="Hello" />);

      expect(screen.getByText("✓ 5 characters")).toBeInTheDocument();

      rerender(
        <ResolutionEditor {...defaultProps} resolutionText="Hello World!" />,
      );

      expect(screen.getByText("✓ 12 characters")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button names", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      expect(
        screen.getByRole("button", { name: /🤖 Use AI Solution/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /✏️ Write Custom/i }),
      ).toBeInTheDocument();
    });

    it("should have accessible textarea with placeholder", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(
        /Enter resolution for this ticket/i,
      );
      expect(textarea).toBeInTheDocument();
    });

    it("should use semantic HTML heading for title", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const heading = screen.getByText("✍️ Resolution");
      expect(heading.tagName).toBe("H2");
    });
  });
});
