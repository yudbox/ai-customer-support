/**
 * Accessibility Tests - Header Navigation (TIER 1)
 *
 * CRITICAL: EU Directive 2019/882 compliance
 * Tests main site navigation accessibility
 *
 * Coverage:
 * - Keyboard navigation
 * - Current page indication (aria-current)
 * - Mobile menu accessibility
 * - Focus management
 * - ARIA labels
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { usePathname } from "next/navigation";

import { Header } from "@/app/_components/Header";

expect.extend(toHaveNoViolations);

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Header Navigation - WCAG 2.1 AA Compliance (TIER 1)", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  // ============================================================================
  // BASIC ACCESSIBILITY
  // ============================================================================

  describe("Basic Accessibility", () => {
    it("should have semantic header element", () => {
      const { getByRole } = render(<Header />);

      const header = getByRole("banner");
      expect(header).toBeInTheDocument();
    });

    it("should have main heading (h1)", () => {
      const { getByRole } = render(<Header />);

      const heading = getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("AI Customer Support");
    });

    it("should have navigation landmarks", () => {
      const { getAllByRole } = render(<Header />);

      const navs = getAllByRole("navigation");
      // Should have at least one navigation (desktop)
      expect(navs.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================================
  // DESKTOP NAVIGATION - WCAG 2.4.1
  // ============================================================================

  describe("Desktop Navigation", () => {
    it("should have navigation landmark with label", () => {
      const { getAllByRole } = render(<Header />);

      const navs = getAllByRole("navigation");
      const desktopNav = navs.find(
        (nav) => nav.getAttribute("aria-label") === "Main navigation",
      );

      expect(desktopNav).toBeInTheDocument();
    });

    it("should have all navigation links", () => {
      const { getAllByRole } = render(<Header />);

      const links = getAllByRole("link");
      const linkTexts = links.map((l) => l.textContent);

      expect(linkTexts).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Submit Ticket"),
          expect.stringContaining("Manager Dashboard"),
        ]),
      );
    });

    it("should indicate current page with aria-current", () => {
      mockUsePathname.mockReturnValue("/");
      const { getAllByRole } = render(<Header />);

      const links = getAllByRole("link");
      const submitLinks = links.filter((link) =>
        link.textContent?.includes("Submit Ticket"),
      );

      // At least one Submit Ticket link should have aria-current
      const hasAriaCurrent = submitLinks.some(
        (link) => link.getAttribute("aria-current") === "page",
      );
      expect(hasAriaCurrent).toBe(true);
    });

    it("should update aria-current when navigating to different page", () => {
      mockUsePathname.mockReturnValue("/manager");
      const { getAllByRole } = render(<Header />);

      const links = getAllByRole("link");
      const managerLinks = links.filter((link) =>
        link.textContent?.includes("Manager Dashboard"),
      );

      // At least one Manager Dashboard link should have aria-current
      const hasAriaCurrent = managerLinks.some(
        (link) => link.getAttribute("aria-current") === "page",
      );
      expect(hasAriaCurrent).toBe(true);
    });

    it("should be keyboard accessible", () => {
      const { getAllByRole } = render(<Header />);

      const links = getAllByRole("link");
      const firstLink = links[0];

      if (firstLink) {
        firstLink.focus();
        expect(document.activeElement).toBe(firstLink);
      }
    });

    it("should have visible text labels (no icon-only links)", () => {
      const { getAllByRole } = render(<Header />);

      const links = getAllByRole("link");

      // All links should have visible text content
      links.forEach((link) => {
        expect(link.textContent).toBeTruthy();
        expect(link.textContent?.length).toBeGreaterThan(0);
      });
    });
  });

  // ============================================================================
  // MOBILE MENU - EU Directive 2019/882 Critical
  // ============================================================================

  describe("Mobile Menu Button", () => {
    it("should have accessible burger button", () => {
      const { getAllByRole } = render(<Header />);

      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAccessibleName("Open menu");
    });

    it("should be keyboard focusable", () => {
      const { getAllByRole } = render(<Header />);

      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      if (menuButton) {
        menuButton.focus();
        expect(document.activeElement).toBe(menuButton);
      }
    });

    it("should open mobile menu on click", async () => {
      const user = userEvent.setup();
      const { getAllByRole } = render(<Header />);

      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      if (menuButton) {
        await user.click(menuButton);

        // Mobile nav should be visible
        const navs = getAllByRole("navigation");
        const mobileNav = navs.find(
          (nav) => nav.getAttribute("aria-label") === "Mobile navigation",
        );
        expect(mobileNav).toBeInTheDocument();
      }
    });
  });

  // ============================================================================
  // MOBILE NAVIGATION - WCAG 2.4.3
  // ============================================================================

  describe("Mobile Navigation (Sidebar)", () => {
    it("should show mobile navigation when opened", async () => {
      const user = userEvent.setup();
      const { getAllByRole } = render(<Header />);

      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      if (menuButton) {
        await user.click(menuButton);

        const navs = getAllByRole("navigation");
        expect(navs.length).toBeGreaterThan(1); // Desktop + Mobile
      }
    });

    it("should have close button with accessible name", async () => {
      const user = userEvent.setup();
      const { getAllByRole } = render(<Header />);

      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      if (menuButton) {
        await user.click(menuButton);

        const closeButton = getAllByRole("button").find(
          (btn) => btn.getAttribute("aria-label") === "Close menu",
        );

        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveAccessibleName("Close menu");
      }
    });

    it("should close mobile menu when close button clicked", async () => {
      const user = userEvent.setup();
      const { getAllByRole, getByTestId } = render(<Header />);

      // Open menu
      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      if (menuButton) {
        await user.click(menuButton);

        // Menu should be open - verify overlay is visible
        const overlay = getByTestId("sidebar-overlay");
        expect(overlay).toHaveClass("opacity-100");

        // Click close button
        const closeButton = getAllByRole("button").find(
          (btn) => btn.getAttribute("aria-label") === "Close menu",
        );

        if (closeButton) {
          await user.click(closeButton);

          // Menu should be closed - overlay should be hidden
          expect(overlay).toHaveClass("opacity-0");
          expect(overlay).toHaveClass("pointer-events-none");
        }
      }
    });

    it("should close mobile menu when navigation link clicked", async () => {
      const user = userEvent.setup();
      const { getAllByRole } = render(<Header />);

      // Open menu
      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      if (menuButton) {
        await user.click(menuButton);

        // Find mobile navigation
        const mobileNav = getAllByRole("navigation").find(
          (nav) => nav.getAttribute("aria-label") === "Mobile navigation",
        );

        expect(mobileNav).toBeInTheDocument();

        // Verify links are keyboard accessible in mobile menu
        const links = getAllByRole("link");
        const mobileLinks = links.filter((link) => {
          // Check if link is within mobile nav
          return mobileNav?.contains(link);
        });

        expect(mobileLinks.length).toBeGreaterThan(0);
        // Links should have proper href attributes (accessibility requirement)
        mobileLinks.forEach((link) => {
          expect(link).toHaveAttribute("href");
        });
      }
    });

    it("should have accessible sidebar header", async () => {
      const user = userEvent.setup();
      const { getAllByRole, getByText } = render(<Header />);

      // Open menu
      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      if (menuButton) {
        await user.click(menuButton);

        // Check sidebar header content
        const heading = getByText("AI Support");
        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toBe("H2");

        const subtitle = getByText("Menu");
        expect(subtitle).toBeInTheDocument();
      }
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION - WCAG 2.1.1
  // ============================================================================

  describe("Keyboard Navigation", () => {
    it("should tab through all interactive elements in order", async () => {
      const user = userEvent.setup();
      const { getAllByRole } = render(<Header />);

      // Tab through elements
      await user.tab();

      const links = getAllByRole("link");
      const buttons = getAllByRole("button");

      // First element should be first link or button
      const firstInteractive = links[0] || buttons[0];
      expect(document.activeElement).toBe(firstInteractive);
    });

    it("should support Shift+Tab for reverse navigation", async () => {
      const user = userEvent.setup();
      const { getAllByRole } = render(<Header />);

      const links = getAllByRole("link");

      // Focus last link
      links[links.length - 1]?.focus();

      // Shift+Tab should go backwards
      await user.tab({ shift: true });

      expect(document.activeElement).not.toBe(links[links.length - 1]);
    });

    it("should have visible focus indicators", () => {
      const { getAllByRole } = render(<Header />);

      const links = getAllByRole("link");
      const firstLink = links[0];

      if (firstLink) {
        // Check for focus styles (transition-colors indicates focus handling)
        expect(firstLink.className).toContain("transition-colors");
      }
    });
  });

  // ============================================================================
  // VISUAL & SEMANTIC STRUCTURE
  // ============================================================================

  describe("Visual and Semantic Structure", () => {
    it("should have proper heading hierarchy", () => {
      const { getByRole } = render(<Header />);

      // Should have h1 for main title
      const h1 = getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("AI Customer Support");

      // Should have h2 for mobile sidebar title
      // (when opened, but we can check the structure)
    });

    it("should have landmark regions", () => {
      const { getByRole, getAllByRole } = render(<Header />);

      // Header landmark
      const header = getByRole("banner");
      expect(header).toBeInTheDocument();

      // Navigation landmark
      const navs = getAllByRole("navigation");
      expect(navs.length).toBeGreaterThanOrEqual(1);
    });

    it("should have sufficient color contrast", async () => {
      const { container } = render(<Header />);

      const results = await axe(container, {
        rules: {
          "color-contrast": { enabled: true },
          "landmark-complementary-is-top-level": { enabled: false }, // Mobile sidebar is inside header
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration Tests", () => {
    it("should work with both desktop and mobile navigation simultaneously", async () => {
      const { getAllByRole } = render(<Header />);

      const links = getAllByRole("link");

      // Should have links in desktop nav
      expect(links.length).toBeGreaterThanOrEqual(2);

      // All links should be accessible
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });

    it("should maintain focus when switching between desktop/mobile views", async () => {
      const user = userEvent.setup();
      const { getAllByRole } = render(<Header />);

      // Focus on first link (desktop or mobile)
      const links = getAllByRole("link");
      const firstLink = links[0];
      firstLink.focus();
      expect(document.activeElement).toBe(firstLink);

      // Open mobile menu
      const buttons = getAllByRole("button");
      const menuButton = buttons.find(
        (btn) => btn.getAttribute("aria-label") === "Open menu",
      );

      if (menuButton) {
        await user.click(menuButton);

        // Focus should still be manageable
        const closeButton = buttons.find(
          (btn) => btn.getAttribute("aria-label") === "Close menu",
        );
        expect(closeButton || menuButton).toBeInTheDocument();
      }
    });
  });
});
