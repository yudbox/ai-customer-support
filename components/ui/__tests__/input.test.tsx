import { createRef } from "react";

import { render, screen, fireEvent } from "@testing-library/react";

import { Input } from "@/components/ui/input";

describe("Input Component", () => {
  describe("Rendering", () => {
    it("renders input element", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("renders with default styles", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("w-full");
      expect(input).toHaveClass("px-4");
      expect(input).toHaveClass("py-2");
      expect(input).toHaveClass("border");
      expect(input).toHaveClass("rounded-lg");
    });

    it("renders wrapper div with full width", () => {
      const { container } = render(<Input />);
      const wrapper = container.firstChild;

      expect(wrapper).toHaveClass("w-full");
    });
  });

  describe("Label", () => {
    it("renders label when provided", () => {
      render(<Input label="Email Address" />);
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    });

    it("links label to input via htmlFor", () => {
      render(<Input label="Username" />);
      const label = screen.getByText("Username");
      const input = screen.getByLabelText("Username");

      expect(label).toHaveAttribute("for", input.id);
    });

    it("generates ID from label when id not provided", () => {
      render(<Input label="Full Name" />);
      const input = screen.getByLabelText("Full Name");

      expect(input).toHaveAttribute("id", "full-name");
    });

    it("uses custom id when provided", () => {
      render(<Input label="Email" id="custom-email-id" />);
      const input = screen.getByLabelText("Email");

      expect(input).toHaveAttribute("id", "custom-email-id");
    });

    it("shows required asterisk when required prop is true", () => {
      render(<Input label="Password" required />);
      const asterisk = screen.getByText("*");

      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass("text-red-500");
    });

    it("does not show asterisk when required prop is false", () => {
      render(<Input label="Optional Field" />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
      render(<Input placeholder="No label" />);

      expect(screen.queryByRole("label")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("displays error message when error prop is provided", () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error border style when error exists", () => {
      render(<Input error="Invalid email" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("border-red-500");
      expect(input).toHaveClass("focus:ring-red-500");
    });

    it("applies default border style when no error", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("border-gray-300");
      expect(input).not.toHaveClass("border-red-500");
    });

    it("sets aria-invalid to true when error exists", () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("sets aria-invalid to false when no error", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("links error message with aria-describedby", () => {
      render(<Input label="Email" error="Invalid email format" />);
      const input = screen.getByLabelText("Email");
      const errorMessage = screen.getByText("Invalid email format");

      expect(input).toHaveAttribute("aria-describedby", "email-error");
      expect(errorMessage).toHaveAttribute("id", "email-error");
    });

    it("error message has role='alert' for screen readers", () => {
      render(<Input error="Error!" />);
      const errorElement = screen.getByText("Error!");

      expect(errorElement).toHaveAttribute("role", "alert");
    });

    it("does not set aria-describedby when no error", () => {
      render(<Input label="Name" />);
      const input = screen.getByLabelText("Name");

      expect(input).not.toHaveAttribute("aria-describedby");
    });
  });

  describe("Disabled State", () => {
    it("renders disabled input", () => {
      render(<Input disabled />);
      const input = screen.getByRole("textbox");

      expect(input).toBeDisabled();
    });

    it("applies disabled styles", () => {
      render(<Input disabled />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("disabled:bg-gray-100");
      expect(input).toHaveClass("disabled:cursor-not-allowed");
      expect(input).toHaveClass("disabled:text-gray-500");
    });

    it("is not focusable when disabled", () => {
      render(<Input disabled />);
      const input = screen.getByRole("textbox");

      input.focus();
      expect(input).not.toHaveFocus();
    });
  });

  describe("Custom className", () => {
    it("merges custom className with default styles", () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("custom-class");
      expect(input).toHaveClass("w-full"); // Still has default styles
    });

    it("allows Tailwind override via custom className", () => {
      render(<Input className="bg-yellow-100" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("bg-yellow-100");
    });
  });

  describe("forwardRef", () => {
    it("forwards ref to input element", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe("INPUT");
    });

    it("allows focus() through ref", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("allows value access through ref", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} defaultValue="test value" />);

      expect(ref.current?.value).toBe("test value");
    });
  });

  describe("Input Type and Attributes", () => {
    it("supports type='email'", () => {
      render(<Input type="email" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveAttribute("type", "email");
    });

    it("supports type='password'", () => {
      render(<Input type="password" data-testid="password-input" />);

      const input = screen.getByTestId("password-input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "password");
    });

    it("supports type='number'", () => {
      render(<Input type="number" data-testid="number-input" />);

      // Note: type="number" doesn't have role="textbox"
      const input = screen.getByTestId("number-input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "number");
    });

    it("supports placeholder attribute", () => {
      render(<Input placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText("Enter your name");

      expect(input).toBeInTheDocument();
    });

    it("supports defaultValue attribute", () => {
      render(<Input defaultValue="Default text" />);
      const input = screen.getByDisplayValue("Default text");

      expect(input).toBeInTheDocument();
    });

    it("supports value attribute (controlled)", () => {
      const { rerender } = render(
        <Input value="Controlled" onChange={() => {}} />,
      );
      const input = screen.getByDisplayValue("Controlled") as HTMLInputElement;

      expect(input.value).toBe("Controlled");

      rerender(<Input value="Updated" onChange={() => {}} />);
      expect(input.value).toBe("Updated");
    });

    it("supports name attribute", () => {
      render(<Input name="username" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveAttribute("name", "username");
    });

    it("supports required attribute", () => {
      render(<Input required />);
      const input = screen.getByRole("textbox");

      expect(input).toBeRequired();
    });

    it("supports maxLength attribute", () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveAttribute("maxLength", "10");
    });

    it("supports readOnly attribute", () => {
      render(<Input readOnly value="Read only text" onChange={() => {}} />);
      const input = screen.getByDisplayValue("Read only text");

      expect(input).toHaveAttribute("readOnly");
    });
  });

  describe("Event Handlers", () => {
    it("triggers onChange handler", () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole("textbox");

      fireEvent.change(input, { target: { value: "new value" } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("passes event object to onChange", () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole("textbox");

      fireEvent.change(input, { target: { value: "test" } });
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    });

    it("triggers onFocus handler", () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole("textbox");

      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("triggers onBlur handler", () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole("textbox");

      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("triggers onKeyDown handler", () => {
      const handleKeyDown = jest.fn();
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole("textbox");

      fireEvent.keyDown(input, { key: "Enter" });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has correct focus styles", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("focus:outline-none");
      expect(input).toHaveClass("focus:ring-2");
      expect(input).toHaveClass("focus:ring-blue-500");
    });

    it("is focusable with keyboard", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");

      input.focus();
      expect(input).toHaveFocus();
    });

    it("supports aria-label", () => {
      render(<Input aria-label="Search query" />);
      const input = screen.getByLabelText("Search query");

      expect(input).toBeInTheDocument();
    });

    it("placeholder has correct styling", () => {
      render(<Input placeholder="Placeholder" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveClass("placeholder:text-gray-400");
    });
  });

  describe("Complex Scenarios", () => {
    it("renders with label, error, and required", () => {
      render(
        <Input
          label="Email"
          required
          error="Invalid email format"
          type="email"
        />,
      );

      // Use getByRole instead of getByLabelText when label has nested elements
      const input = screen.getByRole("textbox");
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("handles label with multiple words", () => {
      render(<Input label="First and Last Name" />);
      const input = screen.getByRole("textbox");

      expect(input).toHaveAttribute("id", "first-and-last-name");
    });

    it("works with form submission", () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Input name="test-input" />
          <button type="submit">Submit</button>
        </form>,
      );

      const input = screen.getByRole("textbox");
      const button = screen.getByRole("button");

      fireEvent.change(input, { target: { value: "test value" } });
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Component displayName", () => {
    it("has correct displayName for debugging", () => {
      expect(Input.displayName).toBe("Input");
    });
  });
});
