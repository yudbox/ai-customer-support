import { render, screen, fireEvent } from "@testing-library/react";

import { ResolutionEditor } from "@/app/_components/TicketDetailPanel/ResolutionEditor";

describe("ResolutionEditor Component", () => {
  const mockOnResolutionChange = jest.fn();

  const defaultProps = {
    resolutionText: "This is a test resolution.",
    onResolutionChange: mockOnResolutionChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders component with heading", () => {
      render(<ResolutionEditor {...defaultProps} />);

      expect(screen.getByText("✍️ Resolution")).toBeInTheDocument();
    });

    it("renders heading as h2", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const heading = screen.getByRole("heading", { name: /resolution/i });
      expect(heading.tagName).toBe("H2");
    });

    it("renders textarea", () => {
      render(<ResolutionEditor {...defaultProps} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders Write Custom button", () => {
      render(<ResolutionEditor {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /write custom/i }),
      ).toBeInTheDocument();
    });

    it("renders container with correct styling", () => {
      const { container } = render(<ResolutionEditor {...defaultProps} />);
      const mainDiv = container.firstChild;

      expect(mainDiv).toHaveClass("bg-white");
      expect(mainDiv).toHaveClass("rounded-lg");
      expect(mainDiv).toHaveClass("shadow");
      expect(mainDiv).toHaveClass("p-6");
    });
  });

  describe("AI Solution Button Visibility", () => {
    it("does not render Use AI Solution button when suggestedSolution is not provided", () => {
      render(<ResolutionEditor {...defaultProps} />);

      expect(
        screen.queryByRole("button", { name: /use ai solution/i }),
      ).not.toBeInTheDocument();
    });

    it("renders Use AI Solution button when suggestedSolution is provided", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          suggestedSolution="AI suggested solution"
        />,
      );

      expect(
        screen.getByRole("button", { name: /use ai solution/i }),
      ).toBeInTheDocument();
    });

    it("does not render Use AI Solution button when suggestedSolution is empty string", () => {
      render(<ResolutionEditor {...defaultProps} suggestedSolution="" />);

      expect(
        screen.queryByRole("button", { name: /use ai solution/i }),
      ).not.toBeInTheDocument();
    });

    it("renders Use AI Solution button when suggestedSolution has whitespace", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="   text   " />,
      );

      expect(
        screen.getByRole("button", { name: /use ai solution/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Button Text", () => {
    it("displays correct text for Write Custom button", () => {
      render(<ResolutionEditor {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "✏️ Write Custom" }),
      ).toBeInTheDocument();
    });

    it("displays correct text for Use AI Solution button", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      expect(
        screen.getByRole("button", { name: "🤖 Use AI Solution" }),
      ).toBeInTheDocument();
    });

    it("Write Custom button has emoji", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const button = screen.getByRole("button", { name: /write custom/i });
      expect(button).toHaveTextContent("✏️");
    });

    it("Use AI Solution button has emoji", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      const button = screen.getByRole("button", { name: /use ai solution/i });
      expect(button).toHaveTextContent("🤖");
    });
  });

  describe("Button Interactions", () => {
    it("calls onResolutionChange with empty string when Write Custom is clicked", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const button = screen.getByRole("button", { name: /write custom/i });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledWith("");
      expect(mockOnResolutionChange).toHaveBeenCalledTimes(1);
    });

    it("calls onResolutionChange with suggestedSolution when Use AI Solution is clicked", () => {
      const suggestedText = "This is the AI suggested solution text.";
      render(
        <ResolutionEditor
          {...defaultProps}
          suggestedSolution={suggestedText}
        />,
      );

      const button = screen.getByRole("button", { name: /use ai solution/i });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledWith(suggestedText);
      expect(mockOnResolutionChange).toHaveBeenCalledTimes(1);
    });

    it("multiple clicks on Write Custom call onResolutionChange multiple times", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const button = screen.getByRole("button", { name: /write custom/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(3);
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(1, "");
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(2, "");
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(3, "");
    });

    it("Use AI Solution passes exact suggestedSolution text", () => {
      const solution = "Fix the issue by updating configuration.";
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={solution} />,
      );

      const button = screen.getByRole("button", { name: /use ai solution/i });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledWith(solution);
    });
  });

  describe("Textarea Properties", () => {
    it("displays current resolutionText value", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("This is a test resolution.");
    });

    it("has correct placeholder text", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      expect(
        screen.getByPlaceholderText(
          "Enter resolution for this ticket... (required)",
        ),
      ).toBeInTheDocument();
    });

    it("has 6 rows", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("rows", "6");
    });

    it("has font-mono styling", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("font-mono");
      expect(textarea).toHaveClass("text-sm");
    });

    it("displays empty string when resolutionText is empty", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
    });

    it("displays very long resolution text", () => {
      const longText = "A".repeat(5000);
      render(<ResolutionEditor {...defaultProps} resolutionText={longText} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(longText);
    });

    it("displays resolution text with newlines", () => {
      const textWithNewlines = `Line 1
Line 2
Line 3`;
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText={textWithNewlines}
        />,
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(textWithNewlines);
    });

    it("displays resolution text with special characters", () => {
      const specialText = "Resolution: @#$%^&*() <tag>content</tag>";
      render(
        <ResolutionEditor {...defaultProps} resolutionText={specialText} />,
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(specialText);
    });
  });

  describe("Textarea Interaction", () => {
    it("calls onResolutionChange when text is entered", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "New resolution" } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith("New resolution");
      expect(mockOnResolutionChange).toHaveBeenCalledTimes(1);
    });

    it("calls onResolutionChange when text is cleared", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "" } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith("");
    });

    it("calls onResolutionChange with multiline text", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const textarea = screen.getByRole("textbox");
      const multilineText = `Line 1
Line 2
Line 3`;
      fireEvent.change(textarea, { target: { value: multilineText } });

      expect(mockOnResolutionChange).toHaveBeenCalledWith(multilineText);
    });

    it("calls onResolutionChange multiple times for multiple edits", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "First" } });
      fireEvent.change(textarea, { target: { value: "Second" } });
      fireEvent.change(textarea, { target: { value: "Third" } });

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(3);
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(1, "First");
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(2, "Second");
      expect(mockOnResolutionChange).toHaveBeenNthCalledWith(3, "Third");
    });
  });

  describe("Character Counter", () => {
    it("displays character count when text is present", () => {
      render(
        <ResolutionEditor {...defaultProps} resolutionText="Hello World" />,
      );

      expect(screen.getByText("✓ 11 characters")).toBeInTheDocument();
    });

    it("displays warning when text is empty", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });

    it("displays warning when text contains only whitespace", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="   " />);

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });

    it("displays character count for text with leading/trailing whitespace", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="  Hello  " />);

      // Text has 9 characters total (including spaces), but trim() removes them
      expect(screen.getByText("✓ 9 characters")).toBeInTheDocument();
    });

    it("displays correct count for very long text", () => {
      const longText = "A".repeat(1000);
      render(<ResolutionEditor {...defaultProps} resolutionText={longText} />);

      expect(screen.getByText("✓ 1000 characters")).toBeInTheDocument();
    });

    it("displays correct count for single character", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="X" />);

      expect(screen.getByText("✓ 1 characters")).toBeInTheDocument();
    });

    it("displays count including newlines and special characters", () => {
      const textWithNewlines = `Line1
Line2
!@#`;
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText={textWithNewlines}
        />,
      );

      // Real newlines: 5 + 1 + 5 + 1 + 3 = 15 characters
      expect(screen.getByText("✓ 15 characters")).toBeInTheDocument();
    });

    it("counts emoji correctly", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="🚀🎉" />);

      // Emoji can be 2 code units each, but length counts code units
      const text = "🚀🎉";
      expect(
        screen.getByText(`✓ ${text.length} characters`),
      ).toBeInTheDocument();
    });
  });

  describe("Character Counter Styling", () => {
    it("displays green text when resolution is present", () => {
      render(
        <ResolutionEditor {...defaultProps} resolutionText="Valid text" />,
      );

      const counter = screen.getByText(/✓ \d+ characters/);
      expect(counter).toHaveClass("text-green-600");
      expect(counter).toHaveClass("font-medium");
    });

    it("displays red text when resolution is empty", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const warning = screen.getByText("⚠️ Resolution required");
      expect(warning).toHaveClass("text-red-500");
    });

    it("displays red text when resolution contains only whitespace", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="   " />);

      const warning = screen.getByText("⚠️ Resolution required");
      expect(warning).toHaveClass("text-red-500");
    });

    it("displays green text for text with leading/trailing whitespace but valid content", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="  valid  " />);

      const counter = screen.getByText(/✓ \d+ characters/);
      expect(counter).toHaveClass("text-green-600");
    });

    it("counter has xs text size", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="Some text" />);

      const counter = screen.getByText(/✓ \d+ characters/);
      expect(counter).toHaveClass("text-xs");
    });
  });

  describe("Button Variants", () => {
    it("Write Custom button has secondary variant", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const button = screen.getByRole("button", { name: /write custom/i });
      expect(button).toHaveClass("bg-white");
      expect(button).toHaveClass("text-gray-700");
    });

    it("Use AI Solution button has secondary variant", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      const button = screen.getByRole("button", { name: /use ai solution/i });
      expect(button).toHaveClass("bg-white");
      expect(button).toHaveClass("text-gray-700");
    });

    it("buttons have small text size", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      const writeButton = screen.getByRole("button", { name: /write custom/i });
      const aiButton = screen.getByRole("button", { name: /use ai solution/i });

      expect(writeButton).toHaveClass("text-sm");
      expect(aiButton).toHaveClass("text-sm");
    });
  });

  describe("Layout", () => {
    it("renders header with flexbox layout", () => {
      render(<ResolutionEditor {...defaultProps} />);
      const header = screen
        .getByText("✍️ Resolution")
        .closest("div.flex.items-center");

      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("justify-between");
      expect(header).toHaveClass("mb-4");
    });

    it("renders buttons in flex container", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      const writeButton = screen.getByRole("button", { name: /write custom/i });
      const buttonContainer = writeButton.parentElement;

      expect(buttonContainer).toHaveClass("flex");
      expect(buttonContainer).toHaveClass("gap-2");
    });

    it("character counter is in flex container", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="Text" />);

      const counter = screen.getByText(/✓ \d+ characters/);
      const counterContainer = counter.parentElement;

      expect(counterContainer).toHaveClass("flex");
      expect(counterContainer).toHaveClass("items-center");
      expect(counterContainer).toHaveClass("justify-between");
      expect(counterContainer).toHaveClass("mt-2");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long suggestedSolution", () => {
      const longSolution = "A".repeat(10000);
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={longSolution} />,
      );

      const button = screen.getByRole("button", { name: /use ai solution/i });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledWith(longSolution);
    });

    it("handles suggestedSolution with special characters", () => {
      const specialSolution = "<script>alert('xss')</script>";
      render(
        <ResolutionEditor
          {...defaultProps}
          suggestedSolution={specialSolution}
        />,
      );

      const button = screen.getByRole("button", { name: /use ai solution/i });
      fireEvent.click(button);

      expect(mockOnResolutionChange).toHaveBeenCalledWith(specialSolution);
    });

    it("handles rapid text changes", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const textarea = screen.getByRole("textbox");
      for (let i = 0; i < 100; i++) {
        fireEvent.change(textarea, { target: { value: `Text ${i}` } });
      }

      expect(mockOnResolutionChange).toHaveBeenCalledTimes(100);
    });

    it("handles text with only newlines", () => {
      const onlyNewlines = `


`;
      render(
        <ResolutionEditor {...defaultProps} resolutionText={onlyNewlines} />,
      );

      // trim() removes newlines, so should show warning
      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
    });

    it("handles text with unicode characters", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText="Hello world with emoji 🌍"
        />,
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Hello world with emoji 🌍");
    });

    it("handles undefined suggestedSolution gracefully", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution={undefined} />,
      );

      expect(
        screen.queryByRole("button", { name: /use ai solution/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("textarea is accessible with role textbox", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("buttons are accessible with role button", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(2);
    });

    it("has descriptive button text", () => {
      render(
        <ResolutionEditor {...defaultProps} suggestedSolution="AI solution" />,
      );

      expect(
        screen.getByRole("button", { name: /write custom/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /use ai solution/i }),
      ).toBeInTheDocument();
    });

    it("heading is accessible", () => {
      render(<ResolutionEditor {...defaultProps} />);

      const heading = screen.getByRole("heading", { name: /resolution/i });
      expect(heading).toBeInTheDocument();
    });

    it("placeholder provides context for textarea", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      const textarea = screen.getByPlaceholderText(/required/i);
      expect(textarea).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("accepts and uses all props correctly", () => {
      const customProps = {
        resolutionText: "Custom resolution",
        onResolutionChange: jest.fn(),
        suggestedSolution: "AI suggested text",
      };

      render(<ResolutionEditor {...customProps} />);

      expect(screen.getByRole("textbox")).toHaveValue("Custom resolution");
      expect(
        screen.getByRole("button", { name: /use ai solution/i }),
      ).toBeInTheDocument();
    });

    it("re-renders when resolutionText prop changes", () => {
      const { rerender } = render(<ResolutionEditor {...defaultProps} />);

      expect(screen.getByRole("textbox")).toHaveValue(
        "This is a test resolution.",
      );

      rerender(
        <ResolutionEditor {...defaultProps} resolutionText="Updated text" />,
      );

      expect(screen.getByRole("textbox")).toHaveValue("Updated text");
    });

    it("re-renders when suggestedSolution prop changes", () => {
      const { rerender } = render(<ResolutionEditor {...defaultProps} />);

      expect(
        screen.queryByRole("button", { name: /use ai solution/i }),
      ).not.toBeInTheDocument();

      rerender(
        <ResolutionEditor {...defaultProps} suggestedSolution="New solution" />,
      );

      expect(
        screen.getByRole("button", { name: /use ai solution/i }),
      ).toBeInTheDocument();
    });

    it("updates character counter when resolutionText changes", () => {
      const { rerender } = render(
        <ResolutionEditor {...defaultProps} resolutionText="" />,
      );

      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();

      rerender(
        <ResolutionEditor {...defaultProps} resolutionText="New text" />,
      );

      expect(screen.getByText("✓ 8 characters")).toBeInTheDocument();
    });
  });

  describe("State Combinations", () => {
    it("handles empty resolution without suggestedSolution", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="" />);

      expect(screen.getByRole("textbox")).toHaveValue("");
      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /use ai solution/i }),
      ).not.toBeInTheDocument();
    });

    it("handles empty resolution with suggestedSolution", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText=""
          suggestedSolution="AI solution"
        />,
      );

      expect(screen.getByRole("textbox")).toHaveValue("");
      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /use ai solution/i }),
      ).toBeInTheDocument();
    });

    it("handles valid resolution without suggestedSolution", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="Valid" />);

      expect(screen.getByRole("textbox")).toHaveValue("Valid");
      expect(screen.getByText("✓ 5 characters")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /use ai solution/i }),
      ).not.toBeInTheDocument();
    });

    it("handles valid resolution with suggestedSolution", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText="Valid"
          suggestedSolution="AI solution"
        />,
      );

      expect(screen.getByRole("textbox")).toHaveValue("Valid");
      expect(screen.getByText("✓ 5 characters")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /use ai solution/i }),
      ).toBeInTheDocument();
    });
  });
});
