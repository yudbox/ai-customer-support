import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";
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
});
