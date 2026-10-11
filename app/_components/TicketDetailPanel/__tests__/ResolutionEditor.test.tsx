import { render, screen, fireEvent } from "@testing-library/react";

import { ResolutionEditor } from "@/app/_components/TicketDetailPanel/ResolutionEditor";
import { RESOLUTION_MAX_LENGTH } from "@/lib/constants/resolution";

const MAX = RESOLUTION_MAX_LENGTH;

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

      expect(screen.getByText(`11 / ${MAX}`)).toBeInTheDocument();
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
      expect(screen.getByText(`9 / ${MAX}`)).toBeInTheDocument();
    });

    it("displays correct count for very long text", () => {
      const longText = "A".repeat(1000);
      render(<ResolutionEditor {...defaultProps} resolutionText={longText} />);

      expect(screen.getByText(`1000 / ${MAX}`)).toBeInTheDocument();
    });

    it("displays correct count for single character", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="X" />);

      expect(screen.getByText(`1 / ${MAX}`)).toBeInTheDocument();
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
      expect(screen.getByText(`15 / ${MAX}`)).toBeInTheDocument();
    });

    it("counts emoji correctly", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="🚀🎉" />);

      // Emoji can be 2 code units each, but length counts code units
      const text = "🚀🎉";
      expect(screen.getByText(`${text.length} / ${MAX}`)).toBeInTheDocument();
    });
  });

  describe("Character Counter Styling", () => {
    it("displays neutral text when resolution is present", () => {
      render(
        <ResolutionEditor {...defaultProps} resolutionText="Valid text" />,
      );

      const counter = screen.getByText(/^\d+ \/ \d+$/);
      expect(counter).toHaveClass("text-gray-600");
      expect(counter).not.toHaveClass("text-red-500");
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

    it("displays neutral text for text with leading/trailing whitespace but valid content", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="  valid  " />);

      const counter = screen.getByText(/^\d+ \/ \d+$/);
      expect(counter).toHaveClass("text-gray-600");
    });

    it("counter has xs text size", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText="Some text" />);

      const counter = screen.getByText(/^\d+ \/ \d+$/);
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

      const counter = screen.getByText(/^\d+ \/ \d+$/);
      const counterContainer = counter.closest("div");

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

      expect(mockOnResolutionChange).toHaveBeenCalledWith(
        longSolution.slice(0, MAX),
      );
      expect(mockOnResolutionChange.mock.calls[0][0]).toHaveLength(MAX);
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

      expect(screen.getByText(`8 / ${MAX}`)).toBeInTheDocument();
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
      expect(screen.getByText(`5 / ${MAX}`)).toBeInTheDocument();
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
      expect(screen.getByText(`5 / ${MAX}`)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /use ai solution/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Resolution limit (AC-1 to AC-18)", () => {
    const ai = (n: number) => "B".repeat(n);
    const liveText = () => screen.getByRole("status").textContent;

    it("AC-1/AC-2: textarea has maxlength from the shared constant", () => {
      render(<ResolutionEditor {...defaultProps} />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "maxlength",
        String(RESOLUTION_MAX_LENGTH),
      );
    });

    describe("Use AI Solution", () => {
      it("AC-4/AC-6: truncates a long suggestion and shows the notice", () => {
        const { rerender } = render(
          <ResolutionEditor
            {...defaultProps}
            resolutionText=""
            suggestedSolution={ai(10000)}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: /use ai/i }));
        expect(mockOnResolutionChange).toHaveBeenCalledWith(ai(MAX));

        rerender(
          <ResolutionEditor
            {...defaultProps}
            resolutionText={ai(MAX)}
            suggestedSolution={ai(10000)}
          />,
        );
        const notice = screen.getByText(
          `AI solution shortened to ${MAX} characters`,
        );
        expect(notice).toBeInTheDocument();
        expect(
          screen.getByRole("textbox").getAttribute("aria-describedby"),
        ).toContain(notice.id);
        expect(liveText()).toContain(
          `AI solution shortened to ${MAX} characters`,
        );
        expect(screen.getByText("Limit reached")).toBeInTheDocument();
      });

      it("AC-5: exactly-limit suggestion is passed unchanged, no notice", () => {
        const { rerender } = render(
          <ResolutionEditor
            {...defaultProps}
            resolutionText=""
            suggestedSolution={ai(MAX)}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: /use ai/i }));
        expect(mockOnResolutionChange).toHaveBeenCalledWith(ai(MAX));
        rerender(
          <ResolutionEditor
            {...defaultProps}
            resolutionText={ai(MAX)}
            suggestedSolution={ai(MAX)}
          />,
        );
        expect(
          screen.queryByText(`AI solution shortened to ${MAX} characters`),
        ).not.toBeInTheDocument();
      });

      it("AC-5: short suggestion is passed unchanged, no notice", () => {
        render(
          <ResolutionEditor
            {...defaultProps}
            resolutionText=""
            suggestedSolution={ai(100)}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: /use ai/i }));
        expect(mockOnResolutionChange).toHaveBeenCalledWith(ai(100));
        expect(
          screen.queryByText(`AI solution shortened to ${MAX} characters`),
        ).not.toBeInTheDocument();
      });

      it("AC-6: notice disappears after a change event", () => {
        const { rerender } = render(
          <ResolutionEditor
            {...defaultProps}
            resolutionText=""
            suggestedSolution={ai(10000)}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: /use ai/i }));
        rerender(
          <ResolutionEditor
            {...defaultProps}
            resolutionText={ai(MAX)}
            suggestedSolution={ai(10000)}
          />,
        );
        expect(
          screen.getByText(`AI solution shortened to ${MAX} characters`),
        ).toBeInTheDocument();
        fireEvent.change(screen.getByRole("textbox"), {
          target: { value: ai(MAX - 1) },
        });
        expect(
          screen.queryByText(`AI solution shortened to ${MAX} characters`),
        ).not.toBeInTheDocument();
      });

      it("AC-6: notice disappears after Write Custom", () => {
        const { rerender } = render(
          <ResolutionEditor
            {...defaultProps}
            resolutionText=""
            suggestedSolution={ai(10000)}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: /use ai/i }));
        rerender(
          <ResolutionEditor
            {...defaultProps}
            resolutionText={ai(MAX)}
            suggestedSolution={ai(10000)}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: /write custom/i }));
        expect(
          screen.queryByText(`AI solution shortened to ${MAX} characters`),
        ).not.toBeInTheDocument();
      });

      it("AC-6: notice clears when the parent replaces the text", () => {
        const { rerender } = render(
          <ResolutionEditor
            {...defaultProps}
            resolutionText=""
            suggestedSolution={ai(10000)}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: /use ai/i }));
        rerender(
          <ResolutionEditor
            {...defaultProps}
            resolutionText={ai(MAX)}
            suggestedSolution={ai(10000)}
          />,
        );
        rerender(
          <ResolutionEditor
            {...defaultProps}
            resolutionText="other"
            suggestedSolution={ai(10000)}
          />,
        );
        expect(
          screen.queryByText(`AI solution shortened to ${MAX} characters`),
        ).not.toBeInTheDocument();
      });
    });

    it("AC-7: Write Custom calls onResolutionChange with empty string", () => {
      render(<ResolutionEditor {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /write custom/i }));
      expect(mockOnResolutionChange).toHaveBeenCalledWith("");
    });

    it("AC-8: over-limit text shows true length, label and red color", () => {
      render(<ResolutionEditor {...defaultProps} resolutionText={ai(6200)} />);
      const counter = screen.getByText(`6200 / ${MAX}`);
      expect(counter).toHaveClass("text-red-700");
      expect(screen.getByText("Over limit")).toHaveClass("text-red-700");
    });

    describe("AC-11/AC-13: thresholds", () => {
      it("4500 is normal with no label", () => {
        render(
          <ResolutionEditor {...defaultProps} resolutionText={ai(4500)} />,
        );
        expect(screen.getByText(`4500 / ${MAX}`)).toHaveClass("text-gray-600");
        expect(screen.queryByText("Approaching limit")).not.toBeInTheDocument();
        expect(screen.queryByText("Limit reached")).not.toBeInTheDocument();
      });

      it.each([4501, 4600, 4999])("%i is warning", (n) => {
        render(<ResolutionEditor {...defaultProps} resolutionText={ai(n)} />);
        expect(screen.getByText(`${n} / ${MAX}`)).toHaveClass(
          "text-orange-700",
        );
        expect(screen.getByText("Approaching limit")).toBeInTheDocument();
      });

      it("5000 is limit reached", () => {
        render(
          <ResolutionEditor {...defaultProps} resolutionText={ai(5000)} />,
        );
        expect(screen.getByText(`5000 / ${MAX}`)).toHaveClass("text-red-700");
        expect(screen.getByText("Limit reached")).toBeInTheDocument();
      });

      it("100 shows neither label", () => {
        render(<ResolutionEditor {...defaultProps} resolutionText={ai(100)} />);
        expect(screen.queryByText("Approaching limit")).not.toBeInTheDocument();
        expect(screen.queryByText("Limit reached")).not.toBeInTheDocument();
      });
    });

    describe("AC-12: length measure", () => {
      it.each([
        ["😀", 2],
        ["Hello\nWorld", 11],
        ["  abc  ", 7],
      ])("%j counts as %i", (text, n) => {
        render(<ResolutionEditor {...defaultProps} resolutionText={text} />);
        expect(screen.getByText(`${n} / ${MAX}`)).toBeInTheDocument();
      });
    });

    it("AC-10: whitespace near the limit still shows required, no counter", () => {
      render(
        <ResolutionEditor
          {...defaultProps}
          resolutionText={" ".repeat(4600)}
        />,
      );
      expect(screen.getByText("⚠️ Resolution required")).toBeInTheDocument();
      expect(screen.queryByText(/ \/ \d+/)).not.toBeInTheDocument();
    });

    describe("AC-14/AC-15: live region", () => {
      const renderAt = (n: number) => (
        <ResolutionEditor {...defaultProps} resolutionText={ai(n)} />
      );

      it("AC-15: does not change between keystrokes within a state", () => {
        const { rerender } = render(renderAt(4600));
        const before = liveText();
        rerender(renderAt(4601));
        rerender(renderAt(4602));
        expect(liveText()).toBe(before);
      });

      it("announces normal to warning", () => {
        const { rerender } = render(renderAt(4500));
        rerender(renderAt(4501));
        expect(liveText()).toBe(
          `Approaching limit: 4501 of ${MAX} characters used`,
        );
      });

      it("announces warning to limit", () => {
        const { rerender } = render(renderAt(4999));
        rerender(renderAt(5000));
        expect(liveText()).toBe(
          `Limit reached: 5000 of ${MAX} characters used`,
        );
      });

      it("announces limit to warning", () => {
        const { rerender } = render(renderAt(5000));
        rerender(renderAt(4999));
        expect(liveText()).toBe(
          `Approaching limit: 4999 of ${MAX} characters used`,
        );
      });

      it("announces warning to normal", () => {
        const { rerender } = render(renderAt(4501));
        rerender(renderAt(4500));
        expect(liveText()).toBe(`Within limit: 4500 of ${MAX} characters used`);
      });

      it("announces limit to over", () => {
        const { rerender } = render(renderAt(5000));
        rerender(renderAt(6200));
        expect(liveText()).toBe(`Over limit: 6200 of ${MAX} characters used`);
      });

      it("does not announce required to first character", () => {
        const { rerender } = render(
          <ResolutionEditor {...defaultProps} resolutionText="" />,
        );
        rerender(<ResolutionEditor {...defaultProps} resolutionText="a" />);
        expect(liveText()).toBe("");
      });
    });

    describe("AC-16/AC-17: name and description", () => {
      it("textbox has the accessible name Resolution", () => {
        render(
          <ResolutionEditor {...defaultProps} resolutionText="Hello world" />,
        );
        expect(
          screen.getByRole("textbox", { name: /resolution/i }),
        ).toBeInTheDocument();
      });

      it("aria-describedby references the counter", () => {
        render(
          <ResolutionEditor {...defaultProps} resolutionText="Hello world" />,
        );
        const box = screen.getByRole("textbox", { name: /resolution/i });
        const counterId = screen.getByText(`11 / ${MAX}`).parentElement?.id;
        expect(counterId).toBeTruthy();
        expect(box.getAttribute("aria-describedby")).toContain(counterId);
        expect(box).toHaveAccessibleDescription(
          new RegExp(`11 of ${MAX} characters`),
        );
      });
    });
  });
});
