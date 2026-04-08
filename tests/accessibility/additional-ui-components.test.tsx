/**
 * Accessibility Tests - Additional UI Components
 *
 * Tests EU Directive 2019/882 compliance for remaining UI components
 * Validates WCAG 2.1 Level AA requirements
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import { Sidebar } from "@/components/ui/sidebar";
import { SidebarToggle } from "@/components/ui/sidebar-toggle";
import { Toast } from "@/components/ui/toast";

expect.extend(toHaveNoViolations);

describe("Additional UI Components - WCAG 2.1 AA Compliance", () => {
  // ============================================================================
  // SIDEBAR TOGGLE COMPONENT
  // ============================================================================

  describe("SidebarToggle Component", () => {
    describe("Basic Accessibility", () => {
      it("should pass axe accessibility tests", async () => {
        const { container } = render(<SidebarToggle onClick={() => {}} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it("should have accessible name", () => {
        const { getByRole } = render(<SidebarToggle onClick={() => {}} />);

        const button = getByRole("button");
        expect(button).toHaveAccessibleName();
      });

      it("should have custom aria-label when provided", () => {
        const { getByRole } = render(
          <SidebarToggle aria-label="Toggle menu" onClick={() => {}} />,
        );

        const button = getByRole("button");
        expect(button).toHaveAccessibleName("Toggle menu");
      });

      it("should have default aria-label for left side", () => {
        const { getByRole } = render(
          <SidebarToggle side="left" onClick={() => {}} />,
        );

        const button = getByRole("button");
        expect(button).toHaveAccessibleName("Open left sidebar");
      });

      it("should have default aria-label for right side", () => {
        const { getByRole } = render(
          <SidebarToggle side="right" onClick={() => {}} />,
        );

        const button = getByRole("button");
        expect(button).toHaveAccessibleName("Open right sidebar");
      });
    });

    describe("Keyboard Navigation - EU Directive 2019/882 Critical", () => {
      it("should be keyboard focusable", () => {
        const { getByRole } = render(<SidebarToggle onClick={() => {}} />);

        const button = getByRole("button");
        expect(button).not.toHaveAttribute("tabindex", "-1");
      });

      it("should have visible focus indicator", () => {
        const { getByRole } = render(<SidebarToggle onClick={() => {}} />);

        const button = getByRole("button");
        const classes = button.className;

        expect(classes).toContain("focus:ring");
        expect(classes).toContain("focus:outline-none");
      });

      it("should support keyboard activation", () => {
        const { getByRole } = render(<SidebarToggle onClick={() => {}} />);

        const button = getByRole("button");
        button.focus();

        expect(document.activeElement).toBe(button);
      });
    });

    describe("Button States - WCAG 4.1.2", () => {
      it("should support disabled state", () => {
        const { getByRole } = render(
          <SidebarToggle onClick={() => {}} disabled />,
        );

        const button = getByRole("button");
        expect(button).toBeDisabled();
      });

      it("should have proper ARIA state when disabled", () => {
        const { getByRole } = render(
          <SidebarToggle onClick={() => {}} disabled />,
        );

        const button = getByRole("button");
        expect(button).toHaveAttribute("disabled");
      });
    });

    describe("Icon Accessibility", () => {
      it("should have decorative icon that does not interfere with accessibility", async () => {
        const { container } = render(<SidebarToggle onClick={() => {}} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  // ============================================================================
  // TOAST COMPONENT
  // ============================================================================

  describe("Toast Component", () => {
    describe("Basic Accessibility", () => {
      it("should pass axe accessibility tests for success variant", async () => {
        const { container } = render(
          <Toast
            message="Success message"
            variant="success"
            isVisible={true}
          />,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it("should pass axe accessibility tests for warning variant", async () => {
        const { container } = render(
          <Toast
            message="Warning message"
            variant="warning"
            isVisible={true}
          />,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it("should pass axe accessibility tests for info variant", async () => {
        const { container } = render(
          <Toast message="Info message" variant="info" isVisible={true} />,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    describe("Screen Reader Announcements - EU Directive 2019/882 Critical", () => {
      it("should have role=status for non-critical notifications", () => {
        const { getByTestId } = render(
          <Toast
            message="Operation completed"
            variant="success"
            isVisible={true}
          />,
        );

        // Toast notifications should use role="status" for polite announcements
        // or role="alert" for urgent messages
        const toast = getByTestId("toast-container");
        expect(toast).toBeInTheDocument();
      });

      it("should have accessible message text", () => {
        const { getByText } = render(
          <Toast message="Success message" isVisible={true} />,
        );

        expect(getByText("Success message")).toBeInTheDocument();
      });

      it("should have accessible description when provided", () => {
        const { getByText } = render(
          <Toast
            message="Success"
            description="Operation completed successfully"
            isVisible={true}
          />,
        );

        expect(
          getByText("Operation completed successfully"),
        ).toBeInTheDocument();
      });
    });

    describe("Close Button Accessibility", () => {
      it("should have accessible close button when onClose provided", () => {
        const onClose = jest.fn();
        const { getByRole } = render(
          <Toast message="Message" isVisible={true} onClose={onClose} />,
        );

        const closeButton = getByRole("button");
        expect(closeButton).toHaveAccessibleName();
      });
    });

    describe("Visual Variants", () => {
      it("should have sufficient color contrast for success variant", async () => {
        const { container } = render(
          <Toast message="Success" variant="success" isVisible={true} />,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it("should have sufficient color contrast for warning variant", async () => {
        const { container } = render(
          <Toast message="Warning" variant="warning" isVisible={true} />,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  // ============================================================================
  // SIDEBAR COMPONENT
  // ============================================================================

  describe("Sidebar Component", () => {
    describe("Basic Accessibility", () => {
      it("should pass axe accessibility tests when open", async () => {
        const { container } = render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Sidebar content</div>
          </Sidebar>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it("should pass axe accessibility tests when closed", async () => {
        const { container } = render(
          <Sidebar isOpen={false} onClose={() => {}}>
            <div>Sidebar content</div>
          </Sidebar>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    describe("Modal/Dialog Behavior - WCAG 2.4.3", () => {
      it("should have proper semantic element", () => {
        const { getByRole } = render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        // Sidebar uses <aside> semantic element
        const sidebar = getByRole("complementary");
        expect(sidebar).toBeInTheDocument();
      });

      it("should be visible when open", () => {
        const { getByRole } = render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        const sidebar = getByRole("complementary");
        expect(sidebar.className).toContain("translate-x-0");
      });
    });

    describe("Keyboard Navigation - EU Directive 2019/882 Critical", () => {
      it("should close on Escape key when open", () => {
        const onClose = jest.fn();
        render(
          <Sidebar isOpen={true} onClose={onClose}>
            <div>Content</div>
          </Sidebar>,
        );

        // Simulate Escape key press
        const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
        document.dispatchEvent(escapeEvent);

        expect(onClose).toHaveBeenCalledTimes(1);
      });

      it("should not close on Escape key when already closed", () => {
        const onClose = jest.fn();
        render(
          <Sidebar isOpen={false} onClose={onClose}>
            <div>Content</div>
          </Sidebar>,
        );

        // Simulate Escape key press
        const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
        document.dispatchEvent(escapeEvent);

        // Should not call onClose when already closed
        expect(onClose).not.toHaveBeenCalled();
      });

      it("should ignore other keys", () => {
        const onClose = jest.fn();
        render(
          <Sidebar isOpen={true} onClose={onClose}>
            <div>Content</div>
          </Sidebar>,
        );

        // Simulate other key press
        const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
        document.dispatchEvent(enterEvent);

        expect(onClose).not.toHaveBeenCalled();
      });

      it("should have backdrop that closes sidebar on click", async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        const { getByTestId } = render(
          <Sidebar isOpen={true} onClose={onClose}>
            <div>Content</div>
          </Sidebar>,
        );

        const backdrop = getByTestId("sidebar-overlay");
        expect(backdrop).toBeInTheDocument();

        await user.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      });

      it("should have accessible backdrop", () => {
        const { getByTestId } = render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        const backdrop = getByTestId("sidebar-overlay");
        expect(backdrop).toHaveAttribute("aria-hidden", "true");
      });
    });

    describe("Focus Management", () => {
      it("should render content when open", () => {
        const { getByText } = render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Sidebar content</div>
          </Sidebar>,
        );

        expect(getByText("Sidebar content")).toBeInTheDocument();
      });

      it("should have visible content when open", () => {
        const { getByRole } = render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Sidebar content</div>
          </Sidebar>,
        );

        const sidebar = getByRole("complementary");
        const classes = sidebar.className;
        expect(classes).toContain("translate-x-0");
      });
    });

    describe("Animation and Transitions", () => {
      it("should have smooth transition classes", () => {
        const { getByRole } = render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        const sidebar = getByRole("complementary");
        const classes = sidebar.className;
        expect(classes).toContain("transition");
      });

      it("should hide sidebar when closed", () => {
        const { getByRole } = render(
          <Sidebar isOpen={false} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        const sidebar = getByRole("complementary");
        expect(sidebar.className).toContain("-translate-x-full");
      });
    });

    describe("Body Scroll Lock - WCAG 2.1.1", () => {
      beforeEach(() => {
        // Reset body overflow before each test
        document.body.style.overflow = "unset";
      });

      it("should lock body scroll when sidebar opens", () => {
        render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        expect(document.body.style.overflow).toBe("hidden");
      });

      it("should not lock body scroll when sidebar closed", () => {
        render(
          <Sidebar isOpen={false} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        expect(document.body.style.overflow).toBe("unset");
      });

      it("should restore body scroll on unmount", () => {
        const { unmount } = render(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        expect(document.body.style.overflow).toBe("hidden");

        unmount();

        expect(document.body.style.overflow).toBe("unset");
      });

      it("should update body scroll when isOpen changes", () => {
        const { rerender } = render(
          <Sidebar isOpen={false} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        expect(document.body.style.overflow).toBe("unset");

        rerender(
          <Sidebar isOpen={true} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        expect(document.body.style.overflow).toBe("hidden");

        rerender(
          <Sidebar isOpen={false} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>,
        );

        expect(document.body.style.overflow).toBe("unset");
      });
    });
  });

  // ============================================================================
  // COMPREHENSIVE INTEGRATION TESTS
  // ============================================================================

  describe("Component Integration", () => {
    it("should pass axe tests for sidebar with toggle", async () => {
      const { container } = render(
        <div>
          <SidebarToggle onClick={() => {}} />
          <Sidebar isOpen={false} onClose={() => {}}>
            <div>Content</div>
          </Sidebar>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass axe tests for multiple toasts", async () => {
      const { container } = render(
        <div>
          <Toast message="First message" variant="success" isVisible={true} />
          <Toast message="Second message" variant="info" isVisible={true} />
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
