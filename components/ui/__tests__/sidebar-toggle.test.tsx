import { render, screen, fireEvent } from "@testing-library/react";

import { SidebarToggle } from "@/components/ui/sidebar-toggle";

describe("SidebarToggle Component", () => {
  describe("Rendering", () => {
    it("renders toggle button", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toBeInTheDocument();
    });

    it("renders with default aria-label for left side", () => {
      render(<SidebarToggle />);
      const button = screen.getByLabelText("Open left sidebar");

      expect(button).toBeInTheDocument();
    });

    it("renders with default aria-label for right side", () => {
      render(<SidebarToggle side="right" />);
      const button = screen.getByLabelText("Open right sidebar");

      expect(button).toBeInTheDocument();
    });

    it("renders with custom aria-label", () => {
      render(<SidebarToggle aria-label="Toggle navigation" />);
      const button = screen.getByLabelText("Toggle navigation");

      expect(button).toBeInTheDocument();
    });

    it("renders SVG icon", () => {
      render(<SidebarToggle />);

      const svg = screen.getByTestId("sidebar-toggle-icon");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("w-5");
      expect(svg).toHaveClass("h-5");
    });
  });

  describe("Side Positioning", () => {
    it("applies left side styles by default", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("left-0");
      expect(button).toHaveClass("rounded-r-lg");
    });

    it("applies left side styles when side='left'", () => {
      render(<SidebarToggle side="left" />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("left-0");
      expect(button).toHaveClass("rounded-r-lg");
    });

    it("applies right side styles when side='right'", () => {
      render(<SidebarToggle side="right" />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("right-0");
      expect(button).toHaveClass("rounded-l-lg");
    });

    it("does not have left-0 when side='right'", () => {
      render(<SidebarToggle side="right" />);
      const button = screen.getByRole("button");

      expect(button).not.toHaveClass("left-0");
    });

    it("does not have right-0 when side='left'", () => {
      render(<SidebarToggle side="left" />);
      const button = screen.getByRole("button");

      expect(button).not.toHaveClass("right-0");
    });
  });

  describe("Base Styles", () => {
    it("has fixed positioning", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("fixed");
    });

    it("is vertically centered", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("top-1/2");
      expect(button).toHaveClass("-translate-y-1/2");
    });

    it("has correct background and text colors", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-blue-600");
      expect(button).toHaveClass("text-white");
    });

    it("has correct padding", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("p-3");
    });

    it("has shadow and z-index", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("shadow-lg");
      expect(button).toHaveClass("z-30");
    });

    it("has hover styles", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("hover:bg-blue-700");
    });

    it("has active styles", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("active:bg-blue-800");
    });

    it("has transition classes", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("transition-colors");
    });
  });

  describe("Mobile Only Functionality", () => {
    it("hides on large screens by default (mobileOnly=true)", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("lg:hidden");
    });

    it("hides on large screens when mobileOnly=true", () => {
      render(<SidebarToggle mobileOnly={true} />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("lg:hidden");
    });

    it("visible on all screens when mobileOnly=false", () => {
      render(<SidebarToggle mobileOnly={false} />);
      const button = screen.getByRole("button");

      expect(button).not.toHaveClass("lg:hidden");
    });
  });

  describe("Icon Path", () => {
    it("renders chevron right icon for left side", () => {
      render(<SidebarToggle side="left" />);

      const path = screen.getByTestId("sidebar-toggle-path");
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute("d", "M9 5l7 7-7 7");
    });

    it("renders chevron left icon for right side", () => {
      render(<SidebarToggle side="right" />);

      const path = screen.getByTestId("sidebar-toggle-path");
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute("d", "M15 19l-7-7 7-7");
    });
  });

  describe("Custom className", () => {
    it("merges custom className with default styles", () => {
      render(<SidebarToggle className="custom-class" />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("fixed"); // Still has default styles
    });

    it("allows Tailwind override via custom className", () => {
      render(<SidebarToggle className="bg-red-500" />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-red-500");
    });

    it("custom className works with different sides", () => {
      render(<SidebarToggle side="right" className="opacity-50" />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("opacity-50");
      expect(button).toHaveClass("right-0");
    });
  });

  describe("Event Handlers", () => {
    it("triggers onClick handler when clicked", () => {
      const handleClick = jest.fn();
      render(<SidebarToggle onClick={handleClick} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("passes event object to onClick handler", () => {
      const handleClick = jest.fn();
      render(<SidebarToggle onClick={handleClick} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it("supports multiple clicks", () => {
      const handleClick = jest.fn();
      render(<SidebarToggle onClick={handleClick} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it("supports onMouseEnter handler", () => {
      const handleMouseEnter = jest.fn();
      render(<SidebarToggle onMouseEnter={handleMouseEnter} />);
      const button = screen.getByRole("button");

      fireEvent.mouseEnter(button);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it("supports onMouseLeave handler", () => {
      const handleMouseLeave = jest.fn();
      render(<SidebarToggle onMouseLeave={handleMouseLeave} />);
      const button = screen.getByRole("button");

      fireEvent.mouseLeave(button);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it("supports onFocus handler", () => {
      const handleFocus = jest.fn();
      render(<SidebarToggle onFocus={handleFocus} />);
      const button = screen.getByRole("button");

      fireEvent.focus(button);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has correct focus styles", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("focus:outline-none");
      expect(button).toHaveClass("focus:ring-2");
      expect(button).toHaveClass("focus:ring-blue-500");
      expect(button).toHaveClass("focus:ring-offset-2");
    });

    it("is focusable with keyboard", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).toHaveFocus();
    });

    it("aria-label is accessible to screen readers", () => {
      render(<SidebarToggle aria-label="Toggle menu" />);
      const button = screen.getByLabelText("Toggle menu");

      expect(button).toBeInTheDocument();
    });

    it("button has role='button'", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button.tagName).toBe("BUTTON");
    });
  });

  describe("Button Attributes", () => {
    it("supports type attribute", () => {
      render(<SidebarToggle type="button" />);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("type", "button");
    });

    it("supports disabled attribute", () => {
      render(<SidebarToggle disabled />);
      const button = screen.getByRole("button");

      expect(button).toBeDisabled();
    });

    it("does not trigger onClick when disabled", () => {
      const handleClick = jest.fn();
      render(<SidebarToggle disabled onClick={handleClick} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("supports id attribute", () => {
      render(<SidebarToggle id="sidebar-toggle-btn" />);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("id", "sidebar-toggle-btn");
    });

    it("supports data attributes", () => {
      render(<SidebarToggle data-testid="custom-toggle" />);
      const button = screen.getByTestId("custom-toggle");

      expect(button).toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("renders correctly with all props combined", () => {
      const handleClick = jest.fn();
      render(
        <SidebarToggle
          side="right"
          mobileOnly={false}
          className="custom-z-index"
          aria-label="Custom toggle"
          onClick={handleClick}
        />,
      );

      const button = screen.getByLabelText("Custom toggle");
      expect(button).toHaveClass("right-0");
      expect(button).toHaveClass("custom-z-index");
      expect(button).not.toHaveClass("lg:hidden");

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);

      const path = screen.getByTestId("sidebar-toggle-path");
      expect(path).toHaveAttribute("d", "M15 19l-7-7 7-7");
    });

    it("works in a responsive layout scenario", () => {
      const { rerender } = render(<SidebarToggle mobileOnly={true} />);
      let button = screen.getByRole("button");

      expect(button).toHaveClass("lg:hidden");

      rerender(<SidebarToggle mobileOnly={false} />);
      button = screen.getByRole("button");

      expect(button).not.toHaveClass("lg:hidden");
    });

    it("can toggle between left and right sides", () => {
      const { rerender } = render(<SidebarToggle side="left" />);
      let button = screen.getByRole("button");

      expect(button).toHaveClass("left-0");
      expect(button).toHaveClass("rounded-r-lg");

      rerender(<SidebarToggle side="right" />);
      button = screen.getByRole("button");

      expect(button).toHaveClass("right-0");
      expect(button).toHaveClass("rounded-l-lg");
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid multiple clicks", () => {
      const handleClick = jest.fn();
      render(<SidebarToggle onClick={handleClick} />);
      const button = screen.getByRole("button");

      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(handleClick).toHaveBeenCalledTimes(10);
    });

    it("renders without any optional props", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("left-0");
      expect(button).toHaveClass("lg:hidden");
    });

    it("handles focus and blur events correctly", () => {
      render(<SidebarToggle />);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).toHaveFocus();

      button.blur();
      expect(button).not.toHaveFocus();
    });
  });

  describe("SVG Icon Details", () => {
    it("SVG has correct viewBox", () => {
      render(<SidebarToggle />);

      const svg = screen.getByTestId("sidebar-toggle-icon");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("SVG has no fill (outlined icon)", () => {
      render(<SidebarToggle />);

      const svg = screen.getByTestId("sidebar-toggle-icon");
      expect(svg).toHaveAttribute("fill", "none");
    });

    it("SVG uses currentColor for stroke", () => {
      render(<SidebarToggle />);

      const svg = screen.getByTestId("sidebar-toggle-icon");
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });

    it("SVG has correct xmlns", () => {
      render(<SidebarToggle />);

      const svg = screen.getByTestId("sidebar-toggle-icon");
      expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
    });
  });
});
