import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Sidebar } from "@/components/ui/sidebar";

describe("Sidebar Component", () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: false,
    onClose: mockOnClose,
    children: <div>Sidebar Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    document.body.style.overflow = "unset";
  });

  describe("Rendering", () => {
    it("renders sidebar with children", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(screen.getByText("Sidebar Content")).toBeInTheDocument();
    });

    it("renders aside element", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = document.querySelector("aside");

      expect(aside).toBeInTheDocument();
    });

    it("renders overlay div", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0.bg-black\\/50");

      expect(overlay).toBeInTheDocument();
    });

    it("renders when closed (hidden via transform)", () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(screen.getByText("Sidebar Content")).toBeInTheDocument();
    });

    it("renders multiple children", () => {
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Sidebar>,
      );

      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
      expect(screen.getByText("Child 3")).toBeInTheDocument();
    });
  });

  describe("Open/Closed State", () => {
    it("shows sidebar when isOpen=true", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("translate-x-0");
      expect(aside).not.toHaveClass("-translate-x-full");
    });

    it("hides sidebar when isOpen=false", () => {
      const { container } = render(
        <Sidebar {...defaultProps} isOpen={false} />,
      );
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("-translate-x-full");
      expect(aside).not.toHaveClass("translate-x-0");
    });

    it("shows overlay when isOpen=true", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toHaveClass("opacity-100");
      expect(overlay).not.toHaveClass("pointer-events-none");
    });

    it("hides overlay when isOpen=false", () => {
      const { container } = render(
        <Sidebar {...defaultProps} isOpen={false} />,
      );
      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toHaveClass("opacity-0");
      expect(overlay).toHaveClass("pointer-events-none");
    });

    it("toggles state when isOpen changes", () => {
      const { container, rerender } = render(
        <Sidebar {...defaultProps} isOpen={false} />,
      );
      let aside = container.querySelector("aside");

      expect(aside).toHaveClass("-translate-x-full");

      rerender(<Sidebar {...defaultProps} isOpen={true} />);
      aside = container.querySelector("aside");

      expect(aside).toHaveClass("translate-x-0");
    });
  });

  describe("Overlay Interaction", () => {
    it("calls onClose when overlay is clicked", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when sidebar content is clicked", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);
      const content = screen.getByText("Sidebar Content");

      fireEvent.click(content);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("overlay click works multiple times", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      fireEvent.click(overlay!);
      fireEvent.click(overlay!);
      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it("overlay has aria-hidden attribute", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Keyboard Interaction", () => {
    it("closes sidebar when Escape key is pressed while open", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when Escape pressed and sidebar is closed", () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not close on other keys", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: "Tab" });
      fireEvent.keyDown(document, { key: "Space" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("handles Escape key case-sensitively", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      mockOnClose.mockClear();
      fireEvent.keyDown(document, { key: "escape" });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("multiple Escape presses call onClose multiple times", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });

  describe("Body Scroll Lock", () => {
    it("locks body scroll when sidebar is open", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("unlocks body scroll when sidebar is closed", () => {
      render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe("unset");
    });

    it("toggles body scroll when isOpen changes", () => {
      const { rerender } = render(<Sidebar {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe("unset");

      rerender(<Sidebar {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<Sidebar {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("unset");
    });

    it("restores body scroll on unmount", () => {
      const { unmount } = render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("unset");
    });

    it("cleans up body scroll even if unmounted while open", () => {
      const { unmount } = render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("unset");
    });
  });

  describe("Sidebar Styles", () => {
    it("has fixed positioning", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("fixed");
    });

    it("is positioned at top-left", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("top-0");
      expect(aside).toHaveClass("left-0");
    });

    it("has full height", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("h-full");
    });

    it("has correct width", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("w-64");
    });

    it("has white background", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("bg-white");
    });

    it("has shadow", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("shadow-xl");
    });

    it("has correct z-index", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("z-50");
    });

    it("has transition classes", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = container.querySelector("aside");

      expect(aside).toHaveClass("transform");
      expect(aside).toHaveClass("transition-transform");
      expect(aside).toHaveClass("duration-300");
      expect(aside).toHaveClass("ease-in-out");
    });
  });

  describe("Overlay Styles", () => {
    it("overlay has fixed positioning covering full screen", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toHaveClass("fixed");
      expect(overlay).toHaveClass("inset-0");
    });

    it("overlay has backdrop color", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toHaveClass("bg-black/50");
    });

    it("overlay has correct z-index (below sidebar)", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toHaveClass("z-40");
    });

    it("overlay has transition classes", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toHaveClass("transition-opacity");
      expect(overlay).toHaveClass("duration-300");
    });
  });

  describe("Children Rendering", () => {
    it("renders text children", () => {
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          Simple text content
        </Sidebar>,
      );

      expect(screen.getByText("Simple text content")).toBeInTheDocument();
    });

    it("renders component children", () => {
      const CustomComponent = () => <div>Custom Component</div>;
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          <CustomComponent />
        </Sidebar>,
      );

      expect(screen.getByText("Custom Component")).toBeInTheDocument();
    });

    it("renders nested structure", () => {
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          <nav>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </nav>
        </Sidebar>,
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("renders with buttons in children", () => {
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          <button>Close</button>
          <button>Settings</button>
        </Sidebar>,
      );

      expect(screen.getByText("Close")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("children can have event handlers", () => {
      const handleClick = jest.fn();
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          <button onClick={handleClick}>Click Me</button>
        </Sidebar>,
      );

      const button = screen.getByText("Click Me");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid open/close toggles", () => {
      const { rerender } = render(<Sidebar {...defaultProps} isOpen={false} />);

      for (let i = 0; i < 5; i++) {
        rerender(<Sidebar {...defaultProps} isOpen={true} />);
        rerender(<Sidebar {...defaultProps} isOpen={false} />);
      }

      expect(document.body.style.overflow).toBe("unset");
    });

    it("handles onClose being called multiple times", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      for (let i = 0; i < 10; i++) {
        fireEvent.click(overlay!);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(10);
    });

    it("handles empty children", () => {
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          {null}
        </Sidebar>,
      );

      const aside = document.querySelector("aside");
      expect(aside).toBeInTheDocument();
    });

    it("handles fragment children", () => {
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          <>
            <div>Fragment Child 1</div>
            <div>Fragment Child 2</div>
          </>
        </Sidebar>,
      );

      expect(screen.getByText("Fragment Child 1")).toBeInTheDocument();
      expect(screen.getByText("Fragment Child 2")).toBeInTheDocument();
    });

    it("handles conditional children", () => {
      const showExtra = true;
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          <div>Always shown</div>
          {showExtra && <div>Conditionally shown</div>}
        </Sidebar>,
      );

      expect(screen.getByText("Always shown")).toBeInTheDocument();
      expect(screen.getByText("Conditionally shown")).toBeInTheDocument();
    });
  });

  describe("Event Cleanup", () => {
    it("removes keydown listener on unmount", () => {
      const addEventListenerSpy = jest.spyOn(document, "addEventListener");
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener",
      );

      const { unmount } = render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it("re-attaches listener when onClose changes", () => {
      const onClose1 = jest.fn();
      const onClose2 = jest.fn();

      const { rerender } = render(
        <Sidebar isOpen={true} onClose={onClose1}>
          <div>Content</div>
        </Sidebar>,
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose1).toHaveBeenCalledTimes(1);

      rerender(
        <Sidebar isOpen={true} onClose={onClose2}>
          <div>Content</div>
        </Sidebar>,
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose2).toHaveBeenCalledTimes(1);
    });

    it("re-attaches listener when isOpen changes", () => {
      const { rerender } = render(<Sidebar {...defaultProps} isOpen={false} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).not.toHaveBeenCalled();

      rerender(<Sidebar {...defaultProps} isOpen={true} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Complex Scenarios", () => {
    it("opens, closes via overlay, and reopens", () => {
      const { container, rerender } = render(
        <Sidebar {...defaultProps} isOpen={true} />,
      );

      expect(document.body.style.overflow).toBe("hidden");

      const overlay = container.querySelector(".fixed.inset-0");
      fireEvent.click(overlay!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      rerender(<Sidebar {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("unset");

      rerender(<Sidebar {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("opens, closes via Escape, and reopens", () => {
      const { rerender } = render(<Sidebar {...defaultProps} isOpen={true} />);

      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      rerender(<Sidebar {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("unset");

      rerender(<Sidebar {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("handles multiple sidebars (should each manage their own state)", () => {
      const onClose1 = jest.fn();
      const onClose2 = jest.fn();

      render(
        <>
          <Sidebar isOpen={true} onClose={onClose1}>
            <div>Sidebar 1</div>
          </Sidebar>
          <Sidebar isOpen={false} onClose={onClose2}>
            <div>Sidebar 2</div>
          </Sidebar>
        </>,
      );

      expect(screen.getByText("Sidebar 1")).toBeInTheDocument();
      expect(screen.getByText("Sidebar 2")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      // Both sidebars listen to Escape, but only open one should close
      expect(onClose1).toHaveBeenCalledTimes(1);
      expect(onClose2).not.toHaveBeenCalled();
    });

    it("changes children while sidebar is open", () => {
      const { rerender } = render(
        <Sidebar {...defaultProps} isOpen={true}>
          <div>Initial Content</div>
        </Sidebar>,
      );

      expect(screen.getByText("Initial Content")).toBeInTheDocument();

      rerender(
        <Sidebar {...defaultProps} isOpen={true}>
          <div>Updated Content</div>
        </Sidebar>,
      );

      expect(screen.queryByText("Initial Content")).not.toBeInTheDocument();
      expect(screen.getByText("Updated Content")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("sidebar uses semantic aside element", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);
      const aside = document.querySelector("aside");

      expect(aside).toBeInTheDocument();
      expect(aside?.tagName).toBe("ASIDE");
    });

    it("overlay has aria-hidden to hide from screen readers", () => {
      const { container } = render(<Sidebar {...defaultProps} isOpen={true} />);
      const overlay = container.querySelector(".fixed.inset-0");

      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });

    it("keyboard navigation works (Escape key)", () => {
      render(<Sidebar {...defaultProps} isOpen={true} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("focus trap should be managed by parent (sidebar itself doesn't trap focus)", () => {
      render(
        <Sidebar {...defaultProps} isOpen={true}>
          <button>Button 1</button>
          <button>Button 2</button>
        </Sidebar>,
      );

      const button1 = screen.getByText("Button 1");
      button1.focus();

      expect(button1).toHaveFocus();
    });
  });
});
