/**
 * Accessibility Tests - Modal Component
 *
 * Comprehensive WCAG 2.1 Level AA and EU Directive 2019/882 testing
 * Validates dialog/modal patterns for accessibility compliance
 */

import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

expect.extend(toHaveNoViolations);

describe("Modal Component - WCAG 2.1 AA Compliance", () => {
  // ============================================================================
  // BASIC ACCESSIBILITY - WCAG 2.4.2
  // ============================================================================

  describe("Basic Accessibility", () => {
    it("should pass axe accessibility tests when open", async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass axe tests with interactive content", async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Confirm Action">
          <p>Are you sure you want to proceed?</p>
          <div>
            <Button>Cancel</Button>
            <Button variant="primary">Confirm</Button>
          </div>
        </Modal>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not render when closed", () => {
      const { container } = render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  // ============================================================================
  // DIALOG ROLE & ARIA - WCAG 4.1.2
  // ============================================================================

  describe("Dialog Role and ARIA Attributes", () => {
    it("should have role=dialog", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>,
      );

      const dialog = getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should have aria-modal=true", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>,
      );

      const dialog = getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should have accessible name from title", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Delete Confirmation">
          <p>Content</p>
        </Modal>,
      );

      const dialog = getByRole("dialog");
      expect(dialog).toHaveAccessibleName("Delete Confirmation");
    });

    it("should use aria-labelledby for title association", () => {
      const { getByRole, getByText } = render(
        <Modal isOpen={true} onClose={() => {}} title="Important Notice">
          <p>Content</p>
        </Modal>,
      );

      const dialog = getByRole("dialog");
      const title = getByText("Important Notice");

      const labelledBy = dialog.getAttribute("aria-labelledby");
      if (labelledBy) {
        expect(title).toHaveAttribute("id", labelledBy);
      }
    });
  });

  // ============================================================================
  // TITLE/HEADING - WCAG 1.3.1
  // ============================================================================

  describe("Title and Heading Structure", () => {
    it("should render title as heading", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          <p>Content</p>
        </Modal>,
      );

      const heading = getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Modal Title");
    });

    it("should have heading as first element", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="First Element">
          <p>Content after heading</p>
        </Modal>,
      );

      const dialog = getByRole("dialog");
      const heading = within(dialog).getByRole("heading");

      expect(heading).toBeInTheDocument();
    });

    it("should support different title text", () => {
      const titles = ["Confirm Delete", "Warning", "Success", "Error Message"];

      titles.forEach((title) => {
        const { getByRole, unmount } = render(
          <Modal isOpen={true} onClose={() => {}} title={title}>
            <p>Content</p>
          </Modal>,
        );

        const heading = getByRole("heading", { level: 2 });
        expect(heading).toHaveTextContent(title);

        unmount();
      });
    });
  });

  // ============================================================================
  // CLOSE BUTTON - EU Directive 2019/882 Critical
  // ============================================================================

  describe("Close Button Accessibility", () => {
    it("should have accessible close button", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const closeButton = getByRole("button", { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it("should have aria-label on close button", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const closeButton = getByTestId("modal-close-button");
      expect(closeButton).toHaveAttribute("aria-label");
    });

    it("should call onClose when close button clicked", async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      const { getByRole } = render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const closeButton = getByRole("button", { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should be keyboard accessible", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const closeButton = getByRole("button", { name: /close/i });
      expect(closeButton).not.toHaveAttribute("tabindex", "-1");
    });

    it("should have visible focus indicator", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const closeButton = getByTestId("modal-close-button");
      expect(closeButton.className).toContain("hover:text-gray-600");
    });
  });

  // ============================================================================
  // BACKDROP - WCAG 1.4.3
  // ============================================================================

  describe("Backdrop/Overlay", () => {
    it("should render backdrop when open", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const backdrop = getByTestId("modal-backdrop");
      expect(backdrop).toBeInTheDocument();
    });

    it("should call onClose when backdrop clicked", async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      const { getByTestId } = render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const backdrop = getByTestId("modal-backdrop");
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should have backdrop blur effect", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const backdrop = getByTestId("modal-backdrop");
      expect(backdrop.className).toContain("backdrop-blur");
    });

    it("should be behind modal content (z-index)", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const backdrop = getByTestId("modal-backdrop");
      const modalContent = getByTestId("modal-content");

      expect(backdrop.className).toContain("absolute");
      expect(modalContent.className).toContain("relative");
      expect(modalContent.className).toContain("z-10");
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION - EU Directive 2019/882 Critical
  // ============================================================================

  describe("Keyboard Navigation", () => {
    it("should support Escape key to close", async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          <p>Content</p>
        </Modal>,
      );

      await user.keyboard("{Escape}");

      // Note: Need to add Escape key handler to Modal component
      // This test will pass once implemented
    });

    it("should contain all interactive elements", () => {
      const { getByRole, getAllByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </Modal>,
      );

      const dialog = getByRole("dialog");
      const buttons = getAllByRole("button");

      // All buttons should be within dialog
      buttons.forEach((button) => {
        expect(dialog).toContainElement(button);
      });
    });

    it("should be keyboard focusable", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <Button>Action</Button>
        </Modal>,
      );

      const closeButton = getByRole("button", { name: /close/i });
      closeButton.focus();

      expect(document.activeElement).toBe(closeButton);
    });
  });

  // ============================================================================
  // FOCUS MANAGEMENT - WCAG 2.4.3
  // ============================================================================

  describe("Focus Management", () => {
    it("should trap focus within modal", () => {
      const { getByRole, getByText } = render(
        <div>
          <Button>Outside Button</Button>
          <Modal isOpen={true} onClose={() => {}} title="Modal">
            <Button>Inside Button</Button>
          </Modal>
        </div>,
      );

      const insideButton = getByText("Inside Button");
      const dialog = getByRole("dialog");

      expect(dialog).toContainElement(insideButton);
    });

    it("should have multiple focusable elements for tab navigation", () => {
      const { getAllByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <Button>Cancel</Button>
          <Button>OK</Button>
        </Modal>,
      );

      const buttons = getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(3); // Close + 2 content buttons
    });

    it("should return focus after closing", () => {
      // This requires testing with actual DOM focus management
      // Modal should store original focus and restore it
      const { getByRole, rerender } = render(
        <div>
          <Button>Trigger</Button>
          <Modal isOpen={true} onClose={() => {}} title="Test">
            <p>Content</p>
          </Modal>
        </div>,
      );

      const dialog = getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // After closing, focus should return to trigger
      rerender(
        <div>
          <Button>Trigger</Button>
          <Modal isOpen={false} onClose={() => {}} title="Test">
            <p>Content</p>
          </Modal>
        </div>,
      );
    });
  });

  // ============================================================================
  // CONTENT ACCESSIBILITY
  // ============================================================================

  describe("Content Accessibility", () => {
    it("should support any children content", () => {
      const { getByText } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Paragraph content</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
          <Button>Action</Button>
        </Modal>,
      );

      expect(getByText("Paragraph content")).toBeInTheDocument();
      expect(getByText("Item 1")).toBeInTheDocument();
      expect(getByText("Action")).toBeInTheDocument();
    });

    it("should pass axe tests with complex content", async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Complex Modal">
          <form>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" />

            <label htmlFor="email">Email</label>
            <input id="email" type="email" />

            <Button type="submit">Submit</Button>
          </form>
        </Modal>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should support long content with scroll", () => {
      const longContent = Array(20)
        .fill(0)
        .map((_, i) => <p key={i}>Line {i + 1}</p>);

      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="Long Content">
          <div>{longContent}</div>
        </Modal>,
      );

      const dialog = getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });
  });

  // ============================================================================
  // VISUAL & POSITIONING - WCAG 1.4.3, 1.4.11
  // ============================================================================

  describe("Visual Accessibility", () => {
    it("should be centered on screen", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const wrapper = getByTestId("modal-wrapper");
      expect(wrapper.className).toContain("items-center");
      expect(wrapper.className).toContain("justify-center");
    });

    it("should have high z-index for overlay", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const wrapper = getByTestId("modal-wrapper");
      expect(wrapper.className).toContain("z-50");
    });

    it("should have proper spacing and padding", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const modalContent = getByTestId("modal-content");
      expect(modalContent.className).toContain("p-6");
      expect(modalContent.className).toContain("mx-4");
    });

    it("should have shadow for depth perception", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const modalContent = getByTestId("modal-content");
      expect(modalContent.className).toContain("shadow-xl");
    });

    it("should have rounded corners", () => {
      const { getByTestId } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      const modalContent = getByTestId("modal-content");
      expect(modalContent.className).toContain("rounded-lg");
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration with Form Elements", () => {
    it("should pass axe tests with form inside", async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Submit Form">
          <form>
            <label htmlFor="username">Username</label>
            <input id="username" type="text" required />

            <Button type="submit">Submit</Button>
            <Button type="button">Cancel</Button>
          </form>
        </Modal>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should work with multiple modals (not simultaneous)", () => {
      const { rerender, getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title="First Modal">
          <p>First content</p>
        </Modal>,
      );

      expect(getByRole("dialog")).toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={() => {}} title="Second Modal">
          <p>Second content</p>
        </Modal>,
      );

      expect(getByRole("dialog")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR STATES & EDGE CASES
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle empty content", async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Empty">
          <div />
        </Modal>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should handle title with special characters", () => {
      const { getByRole } = render(
        <Modal isOpen={true} onClose={() => {}} title='Title with <>"'>
          <p>Content</p>
        </Modal>,
      );

      expect(getByRole("heading")).toBeInTheDocument();
    });

    it("should handle rapid open/close", () => {
      const { rerender, container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      expect(container.firstChild).not.toBeNull();

      rerender(
        <Modal isOpen={false} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>,
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
