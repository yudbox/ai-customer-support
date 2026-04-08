/**
 * Accessibility Tests - Button Component
 *
 * Comprehensive WCAG 2.1 Level AA testing for all Button features
 * Covers all conditional branches and accessibility requirements
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import { Button } from "@/components/ui/button";

expect.extend(toHaveNoViolations);

describe("Button Component - Comprehensive Accessibility", () => {
  // ============================================================================
  // BASIC RENDERING
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should pass axe accessibility tests", async () => {
      const { container } = render(<Button>Click me</Button>);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should render children when NOT pending", () => {
      const { getByRole } = render(
        <Button isPending={false}>Submit Form</Button>,
      );

      const button = getByRole("button");
      expect(button).toHaveTextContent("Submit Form");
    });

    it("should render children by default (no isPending)", () => {
      const { getByRole } = render(<Button>Default Button</Button>);

      const button = getByRole("button");
      expect(button).toHaveTextContent("Default Button");
    });
  });

  // ============================================================================
  // PENDING STATE - Branch Coverage Line 53
  // ============================================================================

  describe("Pending State (isPending branch)", () => {
    it("should show spinner when isPending=true", () => {
      const { getByRole } = render(<Button isPending={true}>Submit</Button>);

      const button = getByRole("button");

      // Should show spinner SVG
      const spinner = getByRole("status");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("aria-label", "Loading");

      // Should NOT show children text
      expect(button).not.toHaveTextContent("Submit");
    });

    it("should hide children when isPending=true", () => {
      const { getByRole } = render(<Button isPending={true}>Click Me</Button>);

      const button = getByRole("button");

      // Text should not be visible (replaced by spinner)
      expect(button.textContent).toBe("");
    });

    it("should be disabled when isPending=true", () => {
      const { getByRole } = render(<Button isPending={true}>Submit</Button>);

      const button = getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should pass axe tests with spinner", async () => {
      const { container } = render(
        <Button isPending={true}>Loading Button</Button>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should switch from children to spinner", () => {
      const { getByRole, queryByRole, rerender } = render(
        <Button isPending={false}>Save</Button>,
      );

      let button = getByRole("button");
      expect(button).toHaveTextContent("Save");
      expect(queryByRole("status")).not.toBeInTheDocument();

      // Switch to pending
      rerender(<Button isPending={true}>Save</Button>);

      button = getByRole("button");
      expect(button).not.toHaveTextContent("Save");
      expect(getByRole("status")).toBeInTheDocument();
    });

    it("should have accessible spinner", () => {
      const { getByRole } = render(<Button isPending={true}>Submit</Button>);

      const spinner = getByRole("status");
      expect(spinner).toHaveAttribute("aria-label", "Loading");
    });
  });

  // ============================================================================
  // VARIANTS - All Options
  // ============================================================================

  describe("Variants", () => {
    it("should render primary variant by default", () => {
      const { getByRole } = render(<Button>Primary</Button>);

      const button = getByRole("button");
      expect(button).toHaveClass("bg-blue-600");
    });

    it("should render secondary variant", () => {
      const { getByRole } = render(
        <Button variant="secondary">Secondary</Button>,
      );

      const button = getByRole("button");
      expect(button).toHaveClass("bg-white");
      expect(button).toHaveClass("border");
    });

    it("should render ghost variant", () => {
      const { getByRole } = render(<Button variant="ghost">Ghost</Button>);

      const button = getByRole("button");
      expect(button).toHaveClass("bg-transparent");
    });

    it("should render destructive variant", () => {
      const { getByRole } = render(
        <Button variant="destructive">Delete</Button>,
      );

      const button = getByRole("button");
      expect(button).toHaveClass("bg-red-600");
    });

    it("should pass axe tests for all variants", async () => {
      const variants = [
        "primary",
        "secondary",
        "ghost",
        "destructive",
      ] as const;

      for (const variant of variants) {
        const { container, unmount } = render(
          <Button variant={variant}>Click</Button>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();

        unmount();
      }
    });
  });

  // ============================================================================
  // SIZES
  // ============================================================================

  describe("Sizes", () => {
    it("should render medium size by default", () => {
      const { getByRole } = render(<Button>Medium</Button>);

      const button = getByRole("button");
      expect(button).toHaveClass("px-6");
      expect(button).toHaveClass("py-3");
    });

    it("should render small size", () => {
      const { getByRole } = render(<Button size="sm">Small</Button>);

      const button = getByRole("button");
      expect(button).toHaveClass("px-3");
      expect(button).toHaveClass("py-1.5");
      expect(button).toHaveClass("text-sm");
    });

    it("should render large size", () => {
      const { getByRole } = render(<Button size="lg">Large</Button>);

      const button = getByRole("button");
      expect(button).toHaveClass("px-8");
      expect(button).toHaveClass("py-4");
      expect(button).toHaveClass("text-lg");
    });
  });

  // ============================================================================
  // DISABLED STATE
  // ============================================================================

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      const { getByRole } = render(<Button disabled>Disabled</Button>);

      const button = getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when isPending is true", () => {
      const { getByRole } = render(<Button isPending={true}>Loading</Button>);

      const button = getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when both disabled and isPending", () => {
      const { getByRole } = render(
        <Button disabled isPending={true}>
          Both
        </Button>,
      );

      const button = getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should have disabled styling", () => {
      const { getByRole } = render(<Button disabled>Disabled</Button>);

      const button = getByRole("button");
      expect(button).toHaveClass("disabled:cursor-not-allowed");
      expect(button).toHaveClass("disabled:opacity-60");
    });

    it("should pass axe tests when disabled", async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  describe("Keyboard Navigation", () => {
    it("should be focusable with keyboard", () => {
      const { getByRole } = render(<Button>Focus Me</Button>);

      const button = getByRole("button");
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it("should have visible focus indicator", () => {
      const { getByRole } = render(<Button>Focus</Button>);

      const button = getByRole("button");
      expect(button).toHaveClass("focus:ring-2");
      expect(button).toHaveClass("focus:outline-none");
    });

    it("should respond to Enter key", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const { getByRole } = render(<Button onClick={onClick}>Click</Button>);

      const button = getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should respond to Space key", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const { getByRole } = render(<Button onClick={onClick}>Click</Button>);

      const button = getByRole("button");
      button.focus();
      await user.keyboard(" ");

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // CLICK HANDLING
  // ============================================================================

  describe("Click Handling", () => {
    it("should call onClick when clicked", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const { getByRole } = render(<Button onClick={onClick}>Click Me</Button>);

      await user.click(getByRole("button"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const { getByRole } = render(
        <Button onClick={onClick} disabled>
          Click Me
        </Button>,
      );

      await user.click(getByRole("button"));

      expect(onClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when isPending", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const { getByRole } = render(
        <Button onClick={onClick} isPending={true}>
          Loading
        </Button>,
      );

      await user.click(getByRole("button"));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // CUSTOM PROPS
  // ============================================================================

  describe("Custom Props", () => {
    it("should accept custom className", () => {
      const { getByRole } = render(
        <Button className="custom-class">Custom</Button>,
      );

      const button = getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should accept type attribute", () => {
      const { getByRole } = render(<Button type="submit">Submit</Button>);

      const button = getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should accept aria-label", () => {
      const { getByRole } = render(
        <Button aria-label="Custom Label">Icon</Button>,
      );

      const button = getByRole("button", { name: "Custom Label" });
      expect(button).toBeInTheDocument();
    });
  });

  // ============================================================================
  // COMPLEX SCENARIOS
  // ============================================================================

  describe("Complex Scenarios", () => {
    it("should handle all props together", async () => {
      const onClick = jest.fn();
      const { container, getByRole } = render(
        <Button
          variant="destructive"
          size="lg"
          className="custom"
          onClick={onClick}
          type="button"
        >
          Delete Item
        </Button>,
      );

      const button = getByRole("button");
      expect(button).toHaveTextContent("Delete Item");
      expect(button).toHaveClass("bg-red-600");
      expect(button).toHaveClass("px-8");
      expect(button).toHaveClass("custom");
      expect(button).toHaveAttribute("type", "button");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should transition between pending states", () => {
      const { rerender, getByRole } = render(
        <Button isPending={false}>Save Changes</Button>,
      );

      let button = getByRole("button");
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent("Save Changes");

      rerender(<Button isPending={true}>Save Changes</Button>);

      button = getByRole("button");
      expect(button).toBeDisabled();
      expect(getByRole("status")).toBeInTheDocument();
    });
  });
});
