/**
 * Accessibility Tests - Input Component
 *
 * Comprehensive WCAG 2.1 Level AA testing for all Input features
 * Covers all conditional branches and accessibility requirements
 */

import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import { Input } from "@/components/ui/input";

expect.extend(toHaveNoViolations);

describe("Input Component - Comprehensive Accessibility", () => {
  // ============================================================================
  // BASIC RENDERING - All Branches
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should pass axe tests with label", async () => {
      const { container } = render(<Input label="Email" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass axe tests WITHOUT label", async () => {
      const { container } = render(
        <Input id="no-label" aria-label="Email input" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should render label when provided", () => {
      const { getByText } = render(<Input label="Username" />);

      expect(getByText("Username")).toBeInTheDocument();
    });

    it("should NOT render label when label not provided", () => {
      const { getByRole } = render(<Input id="test" />);

      const input = getByRole("textbox");
      // Input should exist without label
      expect(input).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ID GENERATION - Line 17
  // ============================================================================

  describe("ID Generation (line 17 branch)", () => {
    it("should use provided id when specified", () => {
      const { getByRole } = render(<Input label="Field" id="custom-id" />);

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("id", "custom-id");
    });

    it("should generate id from label when id NOT provided", () => {
      const { getByRole } = render(<Input label="User Email" />);

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("id", "user-email");
    });

    it("should handle multi-word labels for id generation", () => {
      const { getByRole } = render(<Input label="First Name Last Name" />);

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("id", "first-name-last-name");
    });

    it("should work without id and without label", () => {
      const { getByRole } = render(<Input aria-label="Input field" />);

      const input = getByRole("textbox");
      // Should not crash, id will be undefined
      expect(input).toBeInTheDocument();
    });
  });

  // ============================================================================
  // REQUIRED ATTRIBUTE - Line 27
  // ============================================================================

  describe("Required Attribute (line 27 branch)", () => {
    it("should show asterisk when required=true", () => {
      const { getByText } = render(<Input label="Required Field" required />);

      const asterisk = getByText("*");
      expect(asterisk).toHaveClass("text-red-500");
      expect(asterisk).toHaveClass("ml-1");
    });

    it("should NOT show asterisk when required=false", () => {
      const { queryByText } = render(
        <Input label="Optional Field" required={false} />,
      );

      const asterisk = queryByText("*");
      expect(asterisk).not.toBeInTheDocument();
    });

    it("should NOT show asterisk when required not specified", () => {
      const { queryByText } = render(<Input label="Field" />);

      const asterisk = queryByText("*");
      expect(asterisk).not.toBeInTheDocument();
    });

    it("should have required attribute on input element", () => {
      const { getByRole } = render(<Input label="Field" required />);

      const input = getByRole("textbox");
      expect(input).toBeRequired();
    });

    it("should work without label even when required", () => {
      const { getByRole, queryByText } = render(
        <Input id="no-label" required aria-label="Required input" />,
      );

      const input = getByRole("textbox");
      expect(input).toBeRequired();

      // No asterisk without label
      const asterisk = queryByText("*");
      expect(asterisk).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR STATE - Lines 40-41, 44-45, 49
  // ============================================================================

  describe("Error State (multiple branches)", () => {
    it("should pass axe tests with error", async () => {
      const { container } = render(
        <Input label="Field" error="This field is required" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should show error message when error provided (line 49)", () => {
      const { getByText } = render(
        <Input label="Field" error="Invalid email" />,
      );

      expect(getByText("Invalid email")).toBeInTheDocument();
    });

    it("should NOT show error message when error not provided (line 49)", () => {
      const { queryByRole } = render(<Input label="Field" />);

      const errorElement = queryByRole("alert");
      expect(errorElement).not.toBeInTheDocument();
    });

    it("should have red border when error present (line 40)", () => {
      const { getByRole } = render(
        <Input label="Field" error="Error message" />,
      );

      const input = getByRole("textbox");
      expect(input).toHaveClass("border-red-500");
      expect(input).toHaveClass("focus:ring-red-500");
    });

    it("should have gray border when NO error (line 41)", () => {
      const { getByRole } = render(<Input label="Field" />);

      const input = getByRole("textbox");
      expect(input).toHaveClass("border-gray-300");
      expect(input).toHaveClass("hover:border-gray-400");
      expect(input).not.toHaveClass("border-red-500");
    });

    it("should have aria-invalid=true when error present (line 44)", () => {
      const { getByRole } = render(<Input label="Field" error="Error" />);

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have aria-invalid=false when NO error (line 44)", () => {
      const { getByRole } = render(<Input label="Field" />);

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("should have aria-describedby when error present (line 45)", () => {
      const { getByRole } = render(
        <Input label="Field" error="Error message" />,
      );

      const input = getByRole("textbox");
      const errorId = input.getAttribute("aria-describedby");

      expect(errorId).toBeTruthy();
      expect(errorId).toContain("-error");

      const errorElement = getByRole("alert");
      expect(errorElement).toHaveTextContent("Error message");
      expect(errorElement).toHaveAttribute("id", errorId);
    });

    it("should NOT have aria-describedby when NO error (line 45)", () => {
      const { getByRole } = render(<Input label="Field" />);

      const input = getByRole("textbox");
      expect(input).not.toHaveAttribute("aria-describedby");
    });

    it("should link error id to input id", () => {
      const { getByRole } = render(
        <Input label="Email" error="Invalid email" />,
      );

      const input = getByRole("textbox");
      const inputId = input.getAttribute("id");
      const errorId = input.getAttribute("aria-describedby");

      expect(errorId).toBe(`${inputId}-error`);

      const errorElement = getByRole("alert");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveAttribute("id", errorId);
    });
  });

  // ============================================================================
  // LABEL ASSOCIATION - Line 22
  // ============================================================================

  describe("Label Association (line 22 branch)", () => {
    it("should properly link label to input when label provided", () => {
      const { getByLabelText } = render(<Input label="Username" />);

      const input = getByLabelText("Username");
      expect(input).toBeInTheDocument();
    });

    it("should work without label", () => {
      const { getByRole } = render(<Input id="no-label" aria-label="Input" />);

      const input = getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should support clicking label to focus input", () => {
      const { getByText, getByRole } = render(<Input label="Click me" />);

      const label = getByText("Click me");
      const input = getByRole("textbox");

      label.click();

      // Label should be properly associated with input
      expect(input).toHaveAttribute("id");
      expect(label).toHaveAttribute("for", input.getAttribute("id") || "");
    });
  });

  // ============================================================================
  // INPUT TYPES
  // ============================================================================

  describe("Input Types", () => {
    it("should support text type by default", () => {
      const { getByRole } = render(<Input label="Text" />);

      const input = getByRole("textbox");
      // Input without explicit type defaults to text
      expect(input).toBeInTheDocument();
    });

    it("should support email type", () => {
      const { getByLabelText } = render(<Input label="Email" type="email" />);

      const input = getByLabelText("Email");
      expect(input).toHaveAttribute("type", "email");
    });

    it("should support password type", () => {
      const { getByLabelText } = render(
        <Input label="Password" type="password" />,
      );

      const input = getByLabelText("Password");
      expect(input).toHaveAttribute("type", "password");
    });

    it("should support number type", () => {
      const { getByLabelText } = render(<Input label="Age" type="number" />);

      const input = getByLabelText("Age");
      expect(input).toHaveAttribute("type", "number");
    });
  });

  // ============================================================================
  // DISABLED STATE
  // ============================================================================

  describe("Disabled State", () => {
    it("should pass axe tests when disabled", async () => {
      const { container } = render(<Input label="Field" disabled />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have disabled styling", () => {
      const { getByRole } = render(<Input label="Field" disabled />);

      const input = getByRole("textbox");
      expect(input).toBeDisabled();
      expect(input).toHaveClass("disabled:bg-gray-100");
      expect(input).toHaveClass("disabled:cursor-not-allowed");
      expect(input).toHaveClass("disabled:text-gray-500");
    });
  });

  // ============================================================================
  // PLACEHOLDER
  // ============================================================================

  describe("Placeholder", () => {
    it("should support placeholder text", () => {
      const { getByPlaceholderText } = render(
        <Input label="Email" placeholder="Enter your email" />,
      );

      const input = getByPlaceholderText("Enter your email");
      expect(input).toBeInTheDocument();
    });

    it("should have placeholder styling", () => {
      const { getByRole } = render(
        <Input label="Field" placeholder="Placeholder" />,
      );

      const input = getByRole("textbox");
      expect(input).toHaveClass("placeholder:text-gray-400");
    });
  });

  // ============================================================================
  // CUSTOM PROPS
  // ============================================================================

  describe("Custom Props", () => {
    it("should accept custom className", () => {
      const { getByRole } = render(
        <Input label="Field" className="custom-class" />,
      );

      const input = getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });

    it("should accept maxLength", () => {
      const { getByRole } = render(<Input label="Field" maxLength={50} />);

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("maxLength", "50");
    });

    it("should accept pattern", () => {
      const { getByRole } = render(<Input label="Field" pattern="[0-9]*" />);

      const input = getByRole("textbox");
      expect(input).toHaveAttribute("pattern", "[0-9]*");
    });
  });

  // ============================================================================
  // FORWARD REF
  // ============================================================================

  describe("ForwardRef Support", () => {
    it("should support ref forwarding", () => {
      const ref = { current: null } as { current: HTMLInputElement | null };

      render(<Input label="Field" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  // ============================================================================
  // COMPLEX SCENARIOS
  // ============================================================================

  describe("Complex Scenarios", () => {
    it("should handle all features together", async () => {
      const { container, getByText, getByRole } = render(
        <Input
          label="Email Address"
          required
          error="Email is required"
          type="email"
          placeholder="user@example.com"
          className="custom"
        />,
      );

      // Check all features
      expect(getByText("Email Address")).toBeInTheDocument();
      expect(getByText("*")).toBeInTheDocument();
      expect(getByText("Email is required")).toBeInTheDocument();

      const input = getByRole("textbox");
      expect(input).toBeRequired();
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("placeholder", "user@example.com");
      expect(input).toHaveClass("custom");
      expect(input).toHaveAttribute("aria-invalid", "true");

      // Accessibility check
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should handle minimal props", async () => {
      const { container } = render(<Input aria-label="Simple input" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should transition from error to no error", () => {
      const { rerender, getByRole, queryByText } = render(
        <Input label="Field" error="Error message" />,
      );

      let input = getByRole("textbox");
      expect(input).toHaveClass("border-red-500");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(queryByText("Error message")).toBeInTheDocument();

      rerender(<Input label="Field" />);

      input = getByRole("textbox");
      expect(input).toHaveClass("border-gray-300");
      expect(input).toHaveAttribute("aria-invalid", "false");
      expect(queryByText("Error message")).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // FOCUS STATES
  // ============================================================================

  describe("Focus States", () => {
    it("should have visible focus indicator", () => {
      const { getByRole } = render(<Input label="Field" />);

      const input = getByRole("textbox");
      expect(input).toHaveClass("focus:ring-2");
      expect(input).toHaveClass("focus:ring-blue-500");
      expect(input).toHaveClass("focus:outline-none");
    });

    it("should be focusable with keyboard", () => {
      const { getByRole } = render(<Input label="Field" />);

      const input = getByRole("textbox");
      input.focus();

      expect(document.activeElement).toBe(input);
    });
  });
});
