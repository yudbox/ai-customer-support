import * as React from "react";
import { createRef } from "react";

import { render, screen, fireEvent } from "@testing-library/react";

import { Textarea } from "@/components/ui/textarea";

describe("Textarea Component", () => {
  describe("Rendering", () => {
    it("renders textarea element", () => {
      render(<Textarea placeholder="Enter text" />);
      const textarea = screen.getByPlaceholderText("Enter text");

      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("renders with default styles", () => {
      render(<Textarea placeholder="Enter text" />);
      const textarea = screen.getByPlaceholderText("Enter text");

      expect(textarea).toHaveClass("w-full");
      expect(textarea).toHaveClass("px-4");
      expect(textarea).toHaveClass("py-2");
      expect(textarea).toHaveClass("border");
      expect(textarea).toHaveClass("rounded-lg");
    });

    it("renders without label", () => {
      render(<Textarea placeholder="No label" />);
      const textarea = screen.getByPlaceholderText("No label");

      expect(textarea).toBeInTheDocument();
      expect(screen.queryByRole("label")).not.toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(<Textarea placeholder="Type something..." />);
      const textarea = screen.getByPlaceholderText("Type something...");

      expect(textarea).toHaveAttribute("placeholder", "Type something...");
    });
  });

  describe("Label", () => {
    it("renders with label", () => {
      render(<Textarea label="Description" />);
      const label = screen.getByText("Description");

      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe("LABEL");
    });

    it("generates id from label text", () => {
      render(<Textarea label="User Bio" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea).toHaveAttribute("id", "user-bio");
    });

    it("associates label with textarea using htmlFor", () => {
      render(<Textarea label="Comment" />);
      const label = screen.getByText("Comment");
      const textarea = screen.getByRole("textbox");

      expect(label).toHaveAttribute("for", textarea.id);
    });

    it("uses explicit id prop over generated id", () => {
      render(<Textarea label="Message" id="custom-id" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea).toHaveAttribute("id", "custom-id");
    });

    it("renders required asterisk when required=true", () => {
      render(<Textarea label="Message" required />);
      const asterisk = screen.getByText("*");

      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass("text-red-500");
      expect(asterisk).toHaveClass("ml-1");
    });

    it("does not render asterisk when not required", () => {
      render(<Textarea label="Message" />);

      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("label has correct styling", () => {
      render(<Textarea label="Message" />);
      const label = screen.getByText("Message");

      expect(label).toHaveClass("block");
      expect(label).toHaveClass("text-sm");
      expect(label).toHaveClass("font-medium");
      expect(label).toHaveClass("text-gray-700");
    });
  });

  describe("Error State", () => {
    it("displays error message", () => {
      render(<Textarea label="Message" error="This field is required" />);
      const error = screen.getByText("This field is required");

      expect(error).toBeInTheDocument();
      expect(error.tagName).toBe("P");
    });

    it("error message has correct styling", () => {
      render(<Textarea label="Message" error="Error occurred" />);
      const error = screen.getByText("Error occurred");

      expect(error).toHaveClass("mt-1.5");
      expect(error).toHaveClass("text-sm");
      expect(error).toHaveClass("text-red-600");
    });

    it("error message has role='alert'", () => {
      render(<Textarea label="Message" error="Invalid input" />);
      const error = screen.getByRole("alert");

      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent("Invalid input");
    });

    it("applies error border styling", () => {
      render(<Textarea label="Message" error="Error" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea).toHaveClass("border-red-500");
      expect(textarea).toHaveClass("focus:ring-red-500");
    });

    it("sets aria-invalid when error exists", () => {
      render(<Textarea label="Message" error="Error" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("sets aria-describedby to error id", () => {
      render(<Textarea label="Message" error="Error" id="msg-textarea" />);
      const textarea = screen.getByRole("textbox");
      const error = screen.getByRole("alert");

      expect(textarea).toHaveAttribute(
        "aria-describedby",
        "msg-textarea-error",
      );
      expect(error).toHaveAttribute("id", "msg-textarea-error");
    });

    it("does not have aria-describedby when no error", () => {
      render(<Textarea label="Message" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea).not.toHaveAttribute("aria-describedby");
    });

    it("aria-invalid is false when no error", () => {
      render(<Textarea label="Message" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea).toHaveAttribute("aria-invalid", "false");
    });

    it("has normal border styling when no error", () => {
      render(<Textarea label="Message" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea).toHaveClass("border-gray-300");
      expect(textarea).toHaveClass("hover:border-gray-400");
    });
  });

  describe("Character Counter", () => {
    it("displays character counter when showCharCount=true and maxLength provided", () => {
      render(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={45}
        />,
      );
      const counter = screen.getByText("45/100");

      expect(counter).toBeInTheDocument();
    });

    it("does not display counter when showCharCount=false", () => {
      render(<Textarea label="Bio" maxLength={100} currentLength={45} />);

      expect(screen.queryByText("45/100")).not.toBeInTheDocument();
    });

    it("does not display counter when maxLength not provided", () => {
      render(<Textarea label="Bio" showCharCount currentLength={45} />);

      expect(screen.queryByText(/45/)).not.toBeInTheDocument();
    });

    it("counter has default gray styling when below 90% limit", () => {
      render(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={50}
        />,
      );
      const counter = screen.getByText("50/100");

      expect(counter).toHaveClass("text-xs");
      expect(counter).toHaveClass("text-gray-500");
    });

    it("counter has warning styling when above 90% limit", () => {
      render(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={95}
        />,
      );
      const counter = screen.getByText("95/100");

      expect(counter).toHaveClass("text-orange-600");
      expect(counter).toHaveClass("font-medium");
    });

    it("counter has warning styling when above 90% limit (91%)", () => {
      render(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={91}
        />,
      );
      const counter = screen.getByText("91/100");

      expect(counter).not.toHaveClass("text-gray-500");
      expect(counter).toHaveClass("text-orange-600");
    });

    it("counter has warning styling when at maxLength", () => {
      render(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={100}
        />,
      );
      const counter = screen.getByText("100/100");

      expect(counter).toHaveClass("text-orange-600");
    });

    it("counter has warning styling when over maxLength", () => {
      render(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={105}
        />,
      );
      const counter = screen.getByText("105/100");

      expect(counter).toHaveClass("text-orange-600");
    });

    it("counter defaults to 0 when currentLength not provided", () => {
      render(<Textarea label="Bio" showCharCount maxLength={100} />);
      const counter = screen.getByText("0/100");

      expect(counter).toBeInTheDocument();
    });

    it("counter is positioned in label row", () => {
      render(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={50}
        />,
      );

      const labelRow = screen.getByTestId("textarea-label-row");
      expect(labelRow).toBeInTheDocument();
      expect(labelRow).toContainElement(screen.getByText("Bio"));
      expect(labelRow).toContainElement(screen.getByText("50/100"));
    });
  });

  describe("Disabled State", () => {
    it("applies disabled attribute", () => {
      render(<Textarea placeholder="Disabled" disabled />);
      const textarea = screen.getByPlaceholderText("Disabled");

      expect(textarea).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<Textarea placeholder="Disabled" disabled />);
      const textarea = screen.getByPlaceholderText("Disabled");

      expect(textarea).toHaveClass("disabled:bg-gray-100");
      expect(textarea).toHaveClass("disabled:cursor-not-allowed");
      expect(textarea).toHaveClass("disabled:text-gray-500");
    });

    it("is not focusable when disabled", () => {
      render(<Textarea placeholder="Disabled" disabled />);
      const textarea = screen.getByPlaceholderText("Disabled");

      textarea.focus();
      expect(textarea).not.toHaveFocus();
    });
  });

  describe("ForwardRef", () => {
    it("forwards ref to textarea element", () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} placeholder="Ref test" />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current?.placeholder).toBe("Ref test");
    });

    it("ref can be used to access textarea value", () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} defaultValue="Initial value" />);

      expect(ref.current?.value).toBe("Initial value");
    });

    it("ref can be used to focus textarea", () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} placeholder="Focus test" />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("ref can be used to set value programmatically", () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);

      if (ref.current) {
        ref.current.value = "Programmatic value";
      }

      expect(ref.current?.value).toBe("Programmatic value");
    });
  });

  describe("Textarea Attributes", () => {
    it("applies rows attribute", () => {
      render(<Textarea placeholder="Rows" rows={5} />);
      const textarea = screen.getByPlaceholderText("Rows");

      expect(textarea).toHaveAttribute("rows", "5");
    });

    it("applies cols attribute", () => {
      render(<Textarea placeholder="Cols" cols={50} />);
      const textarea = screen.getByPlaceholderText("Cols");

      expect(textarea).toHaveAttribute("cols", "50");
    });

    it("applies maxLength attribute", () => {
      render(<Textarea placeholder="Max length" maxLength={200} />);
      const textarea = screen.getByPlaceholderText("Max length");

      expect(textarea).toHaveAttribute("maxLength", "200");
    });

    it("applies required attribute", () => {
      render(<Textarea placeholder="Required" required />);
      const textarea = screen.getByPlaceholderText("Required");

      expect(textarea).toBeRequired();
    });

    it("applies name attribute", () => {
      render(<Textarea placeholder="Name" name="message" />);
      const textarea = screen.getByPlaceholderText("Name");

      expect(textarea).toHaveAttribute("name", "message");
    });

    it("applies defaultValue", () => {
      render(<Textarea placeholder="Default" defaultValue="Initial text" />);
      const textarea = screen.getByPlaceholderText("Default");

      expect(textarea).toHaveValue("Initial text");
    });

    it("applies value (controlled)", () => {
      render(
        <Textarea
          placeholder="Controlled"
          value="Controlled text"
          onChange={() => {}}
        />,
      );
      const textarea = screen.getByPlaceholderText("Controlled");

      expect(textarea).toHaveValue("Controlled text");
    });

    it("supports readOnly attribute", () => {
      render(
        <Textarea placeholder="Readonly" readOnly value="Read only text" />,
      );
      const textarea = screen.getByPlaceholderText("Readonly");

      expect(textarea).toHaveAttribute("readonly");
    });

    it("has vertical resize by default", () => {
      render(<Textarea placeholder="Resize" />);
      const textarea = screen.getByPlaceholderText("Resize");

      expect(textarea).toHaveClass("resize-vertical");
    });
  });

  describe("Event Handlers", () => {
    it("triggers onChange when text is entered", () => {
      const handleChange = jest.fn();
      render(<Textarea placeholder="Type here" onChange={handleChange} />);
      const textarea = screen.getByPlaceholderText("Type here");

      fireEvent.change(textarea, { target: { value: "New text" } });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(textarea).toHaveValue("New text");
    });

    it("passes event object to onChange handler", () => {
      const handleChange = jest.fn();
      render(<Textarea placeholder="Type here" onChange={handleChange} />);
      const textarea = screen.getByPlaceholderText("Type here");

      fireEvent.change(textarea, { target: { value: "Test" } });

      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
      expect(handleChange.mock.calls[0][0].target.value).toBe("Test");
    });

    it("triggers onFocus when focused", () => {
      const handleFocus = jest.fn();
      render(<Textarea placeholder="Focus test" onFocus={handleFocus} />);
      const textarea = screen.getByPlaceholderText("Focus test");

      fireEvent.focus(textarea);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("triggers onBlur when blurred", () => {
      const handleBlur = jest.fn();
      render(<Textarea placeholder="Blur test" onBlur={handleBlur} />);
      const textarea = screen.getByPlaceholderText("Blur test");

      fireEvent.focus(textarea);
      fireEvent.blur(textarea);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("triggers onKeyDown when key is pressed", () => {
      const handleKeyDown = jest.fn();
      render(<Textarea placeholder="Key test" onKeyDown={handleKeyDown} />);
      const textarea = screen.getByPlaceholderText("Key test");

      fireEvent.keyDown(textarea, { key: "Enter" });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it("supports multiple onChange events", () => {
      const handleChange = jest.fn();
      render(<Textarea placeholder="Multiple" onChange={handleChange} />);
      const textarea = screen.getByPlaceholderText("Multiple");

      fireEvent.change(textarea, { target: { value: "First" } });
      fireEvent.change(textarea, { target: { value: "Second" } });
      fireEvent.change(textarea, { target: { value: "Third" } });

      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe("Custom className", () => {
    it("merges custom className with default styles", () => {
      render(<Textarea placeholder="Custom" className="custom-class" />);
      const textarea = screen.getByPlaceholderText("Custom");

      expect(textarea).toHaveClass("custom-class");
      expect(textarea).toHaveClass("w-full"); // Still has default styles
    });

    it("allows Tailwind override via custom className", () => {
      render(<Textarea placeholder="Override" className="bg-yellow-100" />);
      const textarea = screen.getByPlaceholderText("Override");

      expect(textarea).toHaveClass("bg-yellow-100");
    });

    it("custom className works with error state", () => {
      render(
        <Textarea
          placeholder="Custom error"
          className="min-h-32"
          error="Error message"
        />,
      );
      const textarea = screen.getByPlaceholderText("Custom error");

      expect(textarea).toHaveClass("min-h-32");
      expect(textarea).toHaveClass("border-red-500");
    });
  });

  describe("Accessibility", () => {
    it("has correct focus styles", () => {
      render(<Textarea placeholder="Focus" />);
      const textarea = screen.getByPlaceholderText("Focus");

      expect(textarea).toHaveClass("focus:outline-none");
      expect(textarea).toHaveClass("focus:ring-2");
      expect(textarea).toHaveClass("focus:ring-blue-500");
      expect(textarea).toHaveClass("focus:border-transparent");
    });

    it("is keyboard accessible", () => {
      render(<Textarea placeholder="Keyboard" />);
      const textarea = screen.getByPlaceholderText("Keyboard");

      textarea.focus();
      expect(textarea).toHaveFocus();
    });

    it("supports aria-label", () => {
      render(<Textarea placeholder="Aria" aria-label="Custom aria label" />);
      const textarea = screen.getByLabelText("Custom aria label");

      expect(textarea).toBeInTheDocument();
    });

    it("has placeholder styling", () => {
      render(<Textarea placeholder="Placeholder test" />);
      const textarea = screen.getByPlaceholderText("Placeholder test");

      expect(textarea).toHaveClass("placeholder:text-gray-400");
    });
  });

  describe("Complex Scenarios", () => {
    it("renders with label, error, and required together", () => {
      render(
        <Textarea
          label="Message"
          error="This field is required"
          required
          placeholder="Type here"
        />,
      );

      expect(screen.getByText("Message")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(
        "This field is required",
      );
      expect(screen.getByPlaceholderText("Type here")).toHaveClass(
        "border-red-500",
      );
    });

    it("renders with label, character counter, and required", () => {
      render(
        <Textarea
          label="Bio"
          required
          showCharCount
          maxLength={200}
          currentLength={150}
        />,
      );

      expect(screen.getByText("Bio")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("150/200")).toBeInTheDocument();
    });

    it("character counter turns orange near limit with error state", () => {
      render(
        <Textarea
          label="Description"
          showCharCount
          maxLength={100}
          currentLength={95}
          error="Too long"
        />,
      );

      const counter = screen.getByText("95/100");
      expect(counter).toHaveClass("text-orange-600");
      expect(screen.getByRole("alert")).toHaveTextContent("Too long");
    });

    it("works in controlled mode", () => {
      const Component = () => {
        const [value, setValue] = React.useState("");
        return (
          <Textarea
            label="Controlled"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      render(<Component />);
      const textarea = screen.getByRole("textbox");

      fireEvent.change(textarea, { target: { value: "Controlled text" } });
      expect(textarea).toHaveValue("Controlled text");
    });

    it("error state changes can be toggled", () => {
      const { rerender } = render(
        <Textarea label="Message" placeholder="test" />,
      );
      let textarea = screen.getByPlaceholderText("test");

      expect(textarea).toHaveClass("border-gray-300");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      rerender(
        <Textarea label="Message" placeholder="test" error="Error occurred" />,
      );
      textarea = screen.getByPlaceholderText("test");

      expect(textarea).toHaveClass("border-red-500");
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("character counter updates dynamically", () => {
      const { rerender } = render(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={50}
        />,
      );

      expect(screen.getByText("50/100")).toBeInTheDocument();

      rerender(
        <Textarea
          label="Bio"
          showCharCount
          maxLength={100}
          currentLength={95}
        />,
      );

      expect(screen.getByText("95/100")).toBeInTheDocument();
      expect(screen.getByText("95/100")).toHaveClass("text-orange-600");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty label string", () => {
      render(<Textarea label="" placeholder="Empty label" />);

      expect(screen.queryByRole("label")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Empty label")).toBeInTheDocument();
    });

    it("handles very long error messages", () => {
      const longError =
        "This is a very long error message that might wrap to multiple lines in the UI and should still be displayed correctly with proper styling.";
      render(<Textarea label="Message" error={longError} />);

      expect(screen.getByRole("alert")).toHaveTextContent(longError);
    });

    it("handles label with special characters", () => {
      render(<Textarea label="User's Comment (Optional)" />);
      const textarea = screen.getByRole("textbox");

      expect(textarea).toHaveAttribute("id", "user's-comment-(optional)");
    });

    it("handles zero maxLength (counter doesn't render)", () => {
      render(
        <Textarea showCharCount maxLength={0} currentLength={0} label="Zero" />,
      );

      // When maxLength is 0 (falsy), counter doesn't render
      expect(screen.queryByText("0/0")).not.toBeInTheDocument();
    });

    it("handles negative currentLength gracefully", () => {
      render(
        <Textarea
          label="Negative"
          showCharCount
          maxLength={100}
          currentLength={-5}
        />,
      );

      expect(screen.getByText("-5/100")).toBeInTheDocument();
    });

    it("handles currentLength exceeding maxLength", () => {
      render(
        <Textarea
          label="Exceeded"
          showCharCount
          maxLength={50}
          currentLength={75}
        />,
      );

      const counter = screen.getByText("75/50");
      expect(counter).toHaveClass("text-orange-600");
    });
  });

  describe("Display Name", () => {
    it("has correct displayName for debugging", () => {
      expect(Textarea.displayName).toBe("Textarea");
    });
  });
});
