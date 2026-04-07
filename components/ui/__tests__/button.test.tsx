import { render, screen, fireEvent, within } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("renders button with children", () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole("button", { name: "Click me" }),
      ).toBeInTheDocument();
    });

    it("renders with default variant (primary) and size (md)", () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-blue-600");
      expect(button).toHaveClass("px-6");
      expect(button).toHaveClass("py-3");
    });
  });

  describe("Variants", () => {
    it("renders primary variant with correct styles", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-blue-600");
      expect(button).toHaveClass("text-white");
    });

    it("renders secondary variant with correct styles", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-white");
      expect(button).toHaveClass("text-gray-700");
      expect(button).toHaveClass("border");
    });

    it("renders ghost variant with correct styles", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-transparent");
      expect(button).toHaveClass("text-gray-700");
    });

    it("renders destructive variant with correct styles", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-red-600");
      expect(button).toHaveClass("text-white");
    });
  });

  describe("Sizes", () => {
    it("renders small size with correct padding", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("px-3");
      expect(button).toHaveClass("py-1.5");
      expect(button).toHaveClass("text-sm");
    });

    it("renders medium size with correct padding", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("px-6");
      expect(button).toHaveClass("py-3");
      expect(button).toHaveClass("text-base");
    });

    it("renders large size with correct padding", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("px-8");
      expect(button).toHaveClass("py-4");
      expect(button).toHaveClass("text-lg");
    });
  });

  describe("Disabled State", () => {
    it("renders disabled button with correct attributes", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");

      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:cursor-not-allowed");
      expect(button).toHaveClass("disabled:opacity-60");
    });

    it("does not trigger onClick when disabled", () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Custom className", () => {
    it("merges custom className with default styles", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("bg-blue-600"); // Still has default primary styles
    });

    it("allows Tailwind override via custom className", () => {
      render(<Button className="bg-purple-500">Override</Button>);
      const button = screen.getByRole("button");

      // tailwind-merge should keep the last bg-* class
      expect(button).toHaveClass("bg-purple-500");
    });
  });

  describe("Event Handlers", () => {
    it("triggers onClick handler when clicked", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("passes event object to onClick handler", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it("supports other HTML button attributes", () => {
      const handleFocus = jest.fn();
      render(
        <Button type="submit" name="submitButton" onFocus={handleFocus}>
          Submit
        </Button>,
      );
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("name", "submitButton");

      fireEvent.focus(button);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has correct base styles for keyboard focus", () => {
      render(<Button>Focus me</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("focus:outline-none");
      expect(button).toHaveClass("focus:ring-2");
      expect(button).toHaveClass("focus:ring-offset-2");
    });

    it("is focusable by default", () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).toHaveFocus();
    });

    it("is not focusable when disabled", () => {
      render(<Button disabled>Not Focusable</Button>);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).not.toHaveFocus();
    });

    it("supports aria-label for screen readers", () => {
      render(<Button aria-label="Close dialog">×</Button>);
      const button = screen.getByLabelText("Close dialog");

      expect(button).toBeInTheDocument();
    });
  });

  describe("Complex Children", () => {
    it("renders with icon and text", () => {
      render(
        <Button>
          <span className="mr-2">🔍</span>
          Search
        </Button>,
      );

      expect(screen.getByRole("button")).toHaveTextContent("🔍");
      expect(screen.getByRole("button")).toHaveTextContent("Search");
    });

    it("renders with only icon", () => {
      render(<Button aria-label="Settings">⚙️</Button>);
      const button = screen.getByLabelText("Settings");

      expect(button).toHaveTextContent("⚙️");
    });
  });

  describe("Variant + Size Combinations", () => {
    it("renders small destructive button correctly", () => {
      render(
        <Button variant="destructive" size="sm">
          Delete
        </Button>,
      );
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-red-600");
      expect(button).toHaveClass("px-3");
      expect(button).toHaveClass("text-sm");
    });

    it("renders large secondary button correctly", () => {
      render(
        <Button variant="secondary" size="lg">
          Cancel
        </Button>,
      );
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-white");
      expect(button).toHaveClass("px-8");
      expect(button).toHaveClass("text-lg");
    });

    it("renders medium ghost button correctly", () => {
      render(
        <Button variant="ghost" size="md">
          Close
        </Button>,
      );
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-transparent");
      expect(button).toHaveClass("px-6");
      expect(button).toHaveClass("text-base");
    });
  });

  describe("Pending State", () => {
    it("renders spinner when isPending is true", () => {
      render(<Button isPending>Loading</Button>);
      const button = screen.getByRole("button");

      // Spinner should be accessible with role="status"
      const spinner = within(button).getByRole("status");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });

    it("hides children when isPending is true", () => {
      render(<Button isPending>Click me</Button>);

      // Text should not be visible
      expect(screen.queryByText("Click me")).not.toBeInTheDocument();
    });

    it("shows children when isPending is false", () => {
      render(<Button isPending={false}>Click me</Button>);

      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("shows children when isPending is undefined (default)", () => {
      render(<Button>Click me</Button>);

      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("disables button when isPending is true", () => {
      render(<Button isPending>Loading</Button>);
      const button = screen.getByRole("button");

      expect(button).toBeDisabled();
    });

    it("does not trigger onClick when isPending is true", () => {
      const handleClick = jest.fn();
      render(
        <Button isPending onClick={handleClick}>
          Loading
        </Button>,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("renders spinner with correct classes", () => {
      render(<Button isPending>Loading</Button>);
      const button = screen.getByRole("button");
      const spinner = within(button).getByRole("status");

      expect(spinner).toHaveClass("animate-spin");
      expect(spinner).toHaveClass("h-5");
      expect(spinner).toHaveClass("w-5");
    });

    it("renders spinner as SVG element", () => {
      render(<Button isPending>Loading</Button>);
      const button = screen.getByRole("button");
      const spinner = within(button).getByRole("status");

      expect(spinner.tagName).toBe("svg");
      expect(spinner).toHaveAttribute("fill", "none");
      expect(spinner).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("spinner has aria-label for accessibility", () => {
      render(<Button isPending>Loading</Button>);
      const button = screen.getByRole("button");
      const spinner = within(button).getByRole("status");

      expect(spinner).toHaveAttribute("aria-label", "Loading");
      expect(spinner).toHaveAttribute("role", "status");
    });

    it("can be both disabled and isPending", () => {
      render(
        <Button disabled isPending>
          Loading
        </Button>,
      );
      const button = screen.getByRole("button");

      expect(button).toBeDisabled();
      // Spinner should still show
      expect(within(button).getByRole("status")).toBeInTheDocument();
    });

    it("isPending=false allows button to be enabled", () => {
      render(<Button isPending={false}>Click me</Button>);
      const button = screen.getByRole("button");

      expect(button).not.toBeDisabled();
    });

    it("works with different variants while pending", () => {
      const { rerender } = render(
        <Button variant="primary" isPending>
          Loading
        </Button>,
      );
      let button = screen.getByRole("button");
      expect(button).toHaveClass("bg-blue-600");
      expect(within(button).getByRole("status")).toBeInTheDocument();

      rerender(
        <Button variant="destructive" isPending>
          Loading
        </Button>,
      );
      button = screen.getByRole("button");
      expect(button).toHaveClass("bg-red-600");
      expect(within(button).getByRole("status")).toBeInTheDocument();

      rerender(
        <Button variant="secondary" isPending>
          Loading
        </Button>,
      );
      button = screen.getByRole("button");
      expect(button).toHaveClass("bg-white");
      expect(within(button).getByRole("status")).toBeInTheDocument();

      rerender(
        <Button variant="ghost" isPending>
          Loading
        </Button>,
      );
      button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent");
      expect(within(button).getByRole("status")).toBeInTheDocument();
    });

    it("works with different sizes while pending", () => {
      const { rerender } = render(
        <Button size="sm" isPending>
          Loading
        </Button>,
      );
      let button = screen.getByRole("button");
      expect(button).toHaveClass("text-sm");
      expect(within(button).getByRole("status")).toBeInTheDocument();

      rerender(
        <Button size="md" isPending>
          Loading
        </Button>,
      );
      button = screen.getByRole("button");
      expect(button).toHaveClass("text-base");
      expect(within(button).getByRole("status")).toBeInTheDocument();

      rerender(
        <Button size="lg" isPending>
          Loading
        </Button>,
      );
      button = screen.getByRole("button");
      expect(button).toHaveClass("text-lg");
      expect(within(button).getByRole("status")).toBeInTheDocument();
    });

    it("transitions from pending to not pending", () => {
      const { rerender } = render(<Button isPending>Loading</Button>);
      let button = screen.getByRole("button");

      expect(button).toBeDisabled();
      expect(within(button).getByRole("status")).toBeInTheDocument();
      expect(screen.queryByText("Loading")).not.toBeInTheDocument();

      rerender(<Button isPending={false}>Loading</Button>);
      button = screen.getByRole("button");

      expect(button).not.toBeDisabled();
      expect(within(button).queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    it("transitions from not pending to pending", () => {
      const { rerender } = render(<Button isPending={false}>Submit</Button>);
      let button = screen.getByRole("button");

      expect(button).not.toBeDisabled();
      expect(screen.getByText("Submit")).toBeInTheDocument();

      rerender(<Button isPending>Submit</Button>);
      button = screen.getByRole("button");

      expect(button).toBeDisabled();
      expect(within(button).getByRole("status")).toBeInTheDocument();
      expect(screen.queryByText("Submit")).not.toBeInTheDocument();
    });

    it("preserves custom className when pending", () => {
      render(
        <Button className="custom-pending-class" isPending>
          Loading
        </Button>,
      );
      const button = screen.getByRole("button");

      expect(button).toHaveClass("custom-pending-class");
      expect(within(button).getByRole("status")).toBeInTheDocument();
    });

    it("spinner inherits text color from button variant", () => {
      const { rerender } = render(
        <Button variant="primary" isPending>
          Loading
        </Button>,
      );
      let button = screen.getByRole("button");
      expect(button).toHaveClass("text-white");
      expect(within(button).getByRole("status")).toBeInTheDocument();

      rerender(
        <Button variant="destructive" isPending>
          Loading
        </Button>,
      );
      button = screen.getByRole("button");
      expect(button).toHaveClass("text-white");
      expect(within(button).getByRole("status")).toBeInTheDocument();

      rerender(
        <Button variant="secondary" isPending>
          Loading
        </Button>,
      );
      button = screen.getByRole("button");
      expect(button).toHaveClass("text-gray-700");
      expect(within(button).getByRole("status")).toBeInTheDocument();
    });
  });
});
