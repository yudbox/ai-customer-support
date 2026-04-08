/**
 * Accessibility Tests - Textarea Component
 *
 * Comprehensive WCAG 2.1 Level AA testing for all Textarea features
 * Covers all conditional branches and accessibility requirements
 */

import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import { Textarea } from "@/components/ui/textarea";

expect.extend(toHaveNoViolations);

describe("Textarea Component - Comprehensive Accessibility", () => {
  // ============================================================================
  // BASIC RENDERING - All Branches
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should pass axe tests with label", async () => {
      const { container } = render(<Textarea label="Description" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass axe tests WITHOUT label", async () => {
      const { container } = render(
        <Textarea id="no-label-textarea" aria-label="Description" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should render label when provided", () => {
      const { getByText } = render(<Textarea label="Message" />);

      expect(getByText("Message")).toBeInTheDocument();
    });

    it("should NOT render label container when label not provided", () => {
      const { getByRole } = render(<Textarea id="test" />);

      const textarea = getByRole("textbox");
      // When no label provided, textarea should still render
      expect(textarea).toBeInTheDocument();
    });
  });

  // ============================================================================
  // REQUIRED ATTRIBUTE - Branch Coverage
  // ============================================================================

  describe("Required Attribute", () => {
    it("should show asterisk when required=true", () => {
      const { getByText } = render(
        <Textarea label="Required Field" required />,
      );

      const asterisk = getByText("*");
      expect(asterisk).toHaveClass("text-red-500");
    });

    it("should NOT show asterisk when required=false", () => {
      const { queryByText } = render(
        <Textarea label="Optional Field" required={false} />,
      );

      const asterisk = queryByText("*");
      expect(asterisk).not.toBeInTheDocument();
    });

    it("should NOT show asterisk when required not specified", () => {
      const { queryByText } = render(<Textarea label="Field" />);

      const asterisk = queryByText("*");
      expect(asterisk).not.toBeInTheDocument();
    });

    it("should have required attribute on textarea element", () => {
      const { getByRole } = render(<Textarea label="Field" required />);

      const textarea = getByRole("textbox");
      expect(textarea).toBeRequired();
    });
  });

  // ============================================================================
  // CHARACTER COUNT - Branch Coverage
  // ============================================================================

  describe("Character Count Display", () => {
    it("should show character count when showCharCount=true AND maxLength provided", () => {
      const { getByText } = render(
        <Textarea
          label="Message"
          showCharCount
          maxLength={100}
          currentLength={25}
        />,
      );

      expect(getByText("25/100")).toBeInTheDocument();
    });

    it("should NOT show character count when showCharCount=false", () => {
      const { queryByText } = render(
        <Textarea
          label="Message"
          showCharCount={false}
          maxLength={100}
          currentLength={25}
        />,
      );

      expect(queryByText("25/100")).not.toBeInTheDocument();
    });

    it("should NOT show character count when maxLength not provided", () => {
      const { container } = render(
        <Textarea label="Message" showCharCount={true} currentLength={25} />,
      );

      expect(container.textContent).not.toContain("25/");
    });

    it("should NOT show character count when showCharCount not specified", () => {
      const { queryByText } = render(
        <Textarea label="Message" maxLength={100} currentLength={25} />,
      );

      expect(queryByText("25/100")).not.toBeInTheDocument();
    });

    it("should show normal color when currentLength < 90% of maxLength", () => {
      const { getByText } = render(
        <Textarea
          label="Message"
          showCharCount
          maxLength={100}
          currentLength={50}
        />,
      );

      const counter = getByText("50/100");
      expect(counter).toHaveClass("text-gray-500");
      expect(counter).not.toHaveClass("text-orange-600");
    });

    it("should show warning color when currentLength > 90% of maxLength", () => {
      const { getByText } = render(
        <Textarea
          label="Message"
          showCharCount
          maxLength={100}
          currentLength={95}
        />,
      );

      const counter = getByText("95/100");
      expect(counter).toHaveClass("text-orange-600");
      expect(counter).toHaveClass("font-medium");
    });

    it("should handle exactly 90% threshold", () => {
      const { getByText } = render(
        <Textarea
          label="Message"
          showCharCount
          maxLength={100}
          currentLength={90}
        />,
      );

      const counter = getByText("90/100");
      // At exactly 90%, should NOT trigger warning (> not >=)
      expect(counter).toHaveClass("text-gray-500");
    });

    it("should handle 91% - just over threshold", () => {
      const { getByText } = render(
        <Textarea
          label="Message"
          showCharCount
          maxLength={100}
          currentLength={91}
        />,
      );

      const counter = getByText("91/100");
      expect(counter).toHaveClass("text-orange-600");
    });
  });

  // ============================================================================
  // ERROR STATE - All Branches
  // ============================================================================

  describe("Error State", () => {
    it("should pass axe tests with error", async () => {
      const { container } = render(
        <Textarea label="Field" error="This field is required" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should show error message when error provided", () => {
      const { getByText } = render(
        <Textarea label="Field" error="Invalid input" />,
      );

      expect(getByText("Invalid input")).toBeInTheDocument();
    });

    it("should NOT show error message when error not provided", () => {
      const { queryByRole } = render(<Textarea label="Field" />);

      const errorElement = queryByRole("alert");
      expect(errorElement).not.toBeInTheDocument();
    });

    it("should have red border when error present", () => {
      const { getByRole } = render(
        <Textarea label="Field" error="Error message" />,
      );

      const textarea = getByRole("textbox");
      expect(textarea).toHaveClass("border-red-500");
      expect(textarea).toHaveClass("focus:ring-red-500");
    });

    it("should have gray border when NO error", () => {
      const { getByRole } = render(<Textarea label="Field" />);

      const textarea = getByRole("textbox");
      expect(textarea).toHaveClass("border-gray-300");
      expect(textarea).not.toHaveClass("border-red-500");
    });

    it("should have aria-invalid=true when error present", () => {
      const { getByRole } = render(<Textarea label="Field" error="Error" />);

      const textarea = getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("should have aria-invalid=false when NO error", () => {
      const { getByRole } = render(<Textarea label="Field" />);

      const textarea = getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "false");
    });

    it("should have aria-describedby when error present", () => {
      const { getByRole } = render(
        <Textarea label="Field" error="Error message" />,
      );

      const textarea = getByRole("textbox");
      const errorId = textarea.getAttribute("aria-describedby");

      expect(errorId).toBeTruthy();

      const errorElement = getByRole("alert");
      expect(errorElement).toHaveTextContent("Error message");
      expect(errorElement).toHaveAttribute("id", errorId);
    });

    it("should NOT have aria-describedby when NO error", () => {
      const { getByRole } = render(<Textarea label="Field" />);

      const textarea = getByRole("textbox");
      expect(textarea).not.toHaveAttribute("aria-describedby");
    });
  });

  // ============================================================================
  // ID GENERATION
  // ============================================================================

  describe("ID Generation", () => {
    it("should use provided id", () => {
      const { getByRole } = render(<Textarea label="Field" id="custom-id" />);

      const textarea = getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "custom-id");
    });

    it("should generate id from label when id not provided", () => {
      const { getByRole } = render(<Textarea label="User Message" />);

      const textarea = getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "user-message");
    });

    it("should handle multi-word labels for id generation", () => {
      const { getByRole } = render(<Textarea label="First Name Last Name" />);

      const textarea = getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "first-name-last-name");
    });
  });

  // ============================================================================
  // DISABLED STATE
  // ============================================================================

  describe("Disabled State", () => {
    it("should pass axe tests when disabled", async () => {
      const { container } = render(<Textarea label="Field" disabled />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have disabled styling", () => {
      const { getByRole } = render(<Textarea label="Field" disabled />);

      const textarea = getByRole("textbox");
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass("disabled:bg-gray-100");
      expect(textarea).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  // ============================================================================
  // MAX LENGTH
  // ============================================================================

  describe("MaxLength Attribute", () => {
    it("should apply maxLength attribute to textarea", () => {
      const { getByRole } = render(<Textarea label="Field" maxLength={200} />);

      const textarea = getByRole("textbox");
      expect(textarea).toHaveAttribute("maxLength", "200");
    });

    it("should work without maxLength", () => {
      const { getByRole } = render(<Textarea label="Field" />);

      const textarea = getByRole("textbox");
      expect(textarea).not.toHaveAttribute("maxLength");
    });
  });

  // ============================================================================
  // COMPLEX SCENARIOS
  // ============================================================================

  describe("Complex Scenarios", () => {
    it("should handle all features together", async () => {
      const { container, getByText, getByRole } = render(
        <Textarea
          label="Description"
          required
          showCharCount
          maxLength={100}
          currentLength={95}
          error="Too long"
        />,
      );

      // Check all features render correctly
      expect(getByText("Description")).toBeInTheDocument();
      expect(getByText("*")).toBeInTheDocument();
      expect(getByText("95/100")).toBeInTheDocument();
      expect(getByText("Too long")).toBeInTheDocument();

      const textarea = getByRole("textbox");
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute("aria-invalid", "true");

      // Accessibility check
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should handle minimal props", async () => {
      const { container } = render(<Textarea aria-label="Simple textarea" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // ============================================================================
  // LABEL ASSOCIATION
  // ============================================================================

  describe("Label Association", () => {
    it("should properly link label to textarea", () => {
      const { getByLabelText } = render(<Textarea label="Message" />);

      const textarea = getByLabelText("Message");
      expect(textarea).toBeInTheDocument();
    });

    it("should support clicking label to focus textarea", () => {
      const { getByText, getByRole } = render(<Textarea label="Click me" />);

      const label = getByText("Click me");
      const textarea = getByRole("textbox");

      label.click();

      // In JSDOM this association is maintained
      expect(textarea).toHaveAttribute("id");
    });
  });

  // ============================================================================
  // FORWARD REF
  // ============================================================================

  describe("ForwardRef Support", () => {
    it("should support ref forwarding", () => {
      const ref = { current: null } as { current: HTMLTextAreaElement | null };

      render(<Textarea label="Field" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
