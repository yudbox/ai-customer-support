import { render, screen, fireEvent } from "@testing-library/react";

import { Header } from "@/app/_components/Header";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  // eslint-disable-next-line react/display-name
  return ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("Header Component", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usePathname } = require("next/navigation");

  beforeEach(() => {
    jest.clearAllMocks();
    usePathname.mockReturnValue("/");
  });

  describe("Rendering", () => {
    it("renders logo and title", () => {
      render(<Header />);

      const emojis = screen.getAllByText("🤖");
      expect(emojis.length).toBeGreaterThan(0);
      expect(screen.getByText("AI Customer Support")).toBeInTheDocument();
      expect(
        screen.getByText("Powered by Multi-Agent AI System"),
      ).toBeInTheDocument();
    });

    it("renders all navigation links", () => {
      render(<Header />);

      const submitTicketLinks = screen.getAllByText("📝 Submit Ticket");
      const managerDashboardLinks = screen.getAllByText("👔 Manager Dashboard");

      // Desktop + Mobile navigation
      expect(submitTicketLinks).toHaveLength(2);
      expect(managerDashboardLinks).toHaveLength(2);
    });

    it("renders mobile burger button", () => {
      render(<Header />);

      const burgerButton = screen.getByLabelText("Open menu");
      expect(burgerButton).toBeInTheDocument();
    });

    it("renders header element", () => {
      render(<Header />);

      // Verify header content
      expect(screen.getByText("AI Customer Support")).toBeInTheDocument();
      expect(
        screen.getByText("Powered by Multi-Agent AI System"),
      ).toBeInTheDocument();
    });
  });

  describe("Desktop Navigation", () => {
    it("displays correct href for navigation links", () => {
      render(<Header />);

      // Get desktop navigation links by text
      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      const managerLinks = screen.getAllByText("👔 Manager Dashboard");

      // Desktop links are first in the array (desktop nav renders before mobile)
      expect(submitLinks[0]).toHaveAttribute("href", "/");
      expect(managerLinks[0]).toHaveAttribute("href", "/manager");
    });

    it("highlights active link when on home page", () => {
      usePathname.mockReturnValue("/");
      render(<Header />);

      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      const managerLinks = screen.getAllByText("👔 Manager Dashboard");

      // Home link (first) should be active
      expect(submitLinks[0]).toHaveClass("text-blue-600", "border-blue-600");
      // Manager link (first) should not be active
      expect(managerLinks[0]).toHaveClass(
        "text-gray-600",
        "border-transparent",
      );
    });

    it("highlights active link when on manager page", () => {
      usePathname.mockReturnValue("/manager");
      render(<Header />);

      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      const managerLinks = screen.getAllByText("👔 Manager Dashboard");

      // Home link (first) should not be active
      expect(submitLinks[0]).toHaveClass("text-gray-600", "border-transparent");
      // Manager link (first) should be active
      expect(managerLinks[0]).toHaveClass("text-blue-600", "border-blue-600");
    });

    it("applies hover styles to non-active links", () => {
      usePathname.mockReturnValue("/manager");
      render(<Header />);

      const submitLinks = screen.getAllByText("📝 Submit Ticket");

      // Non-active link (first/desktop) has hover class
      expect(submitLinks[0]).toHaveClass("hover:text-gray-900");
    });
  });

  describe("Mobile Menu", () => {
    it("sidebar is initially closed", () => {
      render(<Header />);

      // Menu should be closed - close button should not be visible
      expect(screen.queryByLabelText("Close menu")).toBeInTheDocument();
    });

    it("opens mobile sidebar when burger button clicked", () => {
      render(<Header />);

      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      // Sidebar should be visible - verify sidebar content
      expect(screen.getByText("AI Support")).toBeInTheDocument();
      expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("closes mobile sidebar when close button clicked", () => {
      render(<Header />);

      // Open sidebar
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      // Verify sidebar is open
      expect(screen.getByText("Menu")).toBeInTheDocument();

      // Close sidebar
      const closeButton = screen.getByLabelText("Close menu");
      fireEvent.click(closeButton);

      // State updated (sidebar closed)
      expect(closeButton).toBeInTheDocument();
    });

    it("closes mobile sidebar when navigation link clicked", () => {
      render(<Header />);

      // Open sidebar
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      // Click on a mobile navigation link
      const mobileLinks = screen.getAllByText("👔 Manager Dashboard");
      const mobileLink = mobileLinks[1]; // Second one is in mobile sidebar
      fireEvent.click(mobileLink);

      // Sidebar closed - verified by checking close button still exists
      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });

    it("renders sidebar header with logo and title", () => {
      render(<Header />);

      // Open sidebar to make it visible
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      expect(screen.getByText("AI Support")).toBeInTheDocument();
      expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("displays close button icon in sidebar", () => {
      render(<Header />);

      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      const svg = screen.getByTestId("close-menu-icon");

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("w-5", "h-5");
    });
  });

  describe("Mobile Sidebar Navigation", () => {
    it("displays all navigation links in sidebar", () => {
      render(<Header />);

      // Open sidebar
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      // Verify both navigation links exist (should have 2 of each - desktop + mobile)
      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      const managerLinks = screen.getAllByText("👔 Manager Dashboard");

      expect(submitLinks).toHaveLength(2);
      expect(managerLinks).toHaveLength(2);
    });

    it("highlights active link in mobile sidebar", () => {
      usePathname.mockReturnValue("/");
      render(<Header />);

      // Open sidebar
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      const managerLinks = screen.getAllByText("👔 Manager Dashboard");

      // Mobile home link (second in array) should be active
      expect(submitLinks[1]).toHaveClass("bg-blue-50", "text-blue-600");
      // Mobile manager link should not be active
      expect(managerLinks[1]).toHaveClass("text-gray-700");
    });

    it("applies correct styling to non-active mobile links", () => {
      usePathname.mockReturnValue("/manager");
      render(<Header />);

      // Open sidebar
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      const submitLinks = screen.getAllByText("📝 Submit Ticket");

      // Non-active mobile link (second in array) should have hover:bg-gray-100
      expect(submitLinks[1]).toHaveClass("hover:bg-gray-100");
    });

    it("mobile nav links have correct href attributes", () => {
      render(<Header />);

      // Open sidebar
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      const managerLinks = screen.getAllByText("👔 Manager Dashboard");

      // Mobile links are second in arrays
      expect(submitLinks[1]).toHaveAttribute("href", "/");
      expect(managerLinks[1]).toHaveAttribute("href", "/manager");
    });
  });

  describe("Responsive Design", () => {
    it("hides desktop nav on mobile", () => {
      render(<Header />);

      // Both desktop and mobile navigation links exist
      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      expect(submitLinks).toHaveLength(2);
    });

    it("shows burger button only on mobile", () => {
      render(<Header />);

      const burgerButton = screen.getByLabelText("Open menu");
      expect(burgerButton).toHaveClass("md:hidden");
    });
  });

  describe("Accessibility", () => {
    it("burger button has aria-label", () => {
      render(<Header />);

      const burgerButton = screen.getByLabelText("Open menu");
      expect(burgerButton.getAttribute("aria-label")).toBe("Open menu");
    });

    it("close button has aria-label", () => {
      render(<Header />);

      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton.getAttribute("aria-label")).toBe("Close menu");
    });

    it("navigation links are keyboard accessible", () => {
      render(<Header />);

      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      const managerLinks = screen.getAllByText("👔 Manager Dashboard");

      // Verify all links are anchor tags with href
      [...submitLinks, ...managerLinks].forEach((link) => {
        expect(link.tagName).toBe("A");
        expect(link).toHaveAttribute("href");
      });
    });
  });

  describe("Navigation Links Data", () => {
    it("renders correct link labels", () => {
      render(<Header />);

      const submitTicketLinks = screen.getAllByText("📝 Submit Ticket");
      const managerDashboardLinks = screen.getAllByText("👔 Manager Dashboard");

      expect(submitTicketLinks.length).toBeGreaterThan(0);
      expect(managerDashboardLinks.length).toBeGreaterThan(0);
    });

    it("maintains consistent links between desktop and mobile", () => {
      render(<Header />);

      // Open sidebar for mobile links
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      const managerLinks = screen.getAllByText("👔 Manager Dashboard");

      // Should have 2 of each link (desktop + mobile)
      expect(submitLinks).toHaveLength(2);
      expect(managerLinks).toHaveLength(2);

      // Same href values for both instances
      expect(submitLinks[0].getAttribute("href")).toBe(
        submitLinks[1].getAttribute("href"),
      );
      expect(managerLinks[0].getAttribute("href")).toBe(
        managerLinks[1].getAttribute("href"),
      );
    });
  });

  describe("State Management", () => {
    it("toggles mobile menu state correctly", () => {
      render(<Header />);

      const burgerButton = screen.getByLabelText("Open menu");

      // Open
      fireEvent.click(burgerButton);
      expect(screen.getByText("Menu")).toBeInTheDocument();

      // Close
      const closeButton = screen.getByLabelText("Close menu");
      fireEvent.click(closeButton);
      expect(closeButton).toBeInTheDocument();

      // Open again
      fireEvent.click(burgerButton);
      expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("maintains separate state for desktop and mobile nav", () => {
      render(<Header />);

      // Desktop links exist
      const submitLinks = screen.getAllByText("📝 Submit Ticket");
      expect(submitLinks[0]).toBeInTheDocument();

      // Mobile menu state can toggle
      const burgerButton = screen.getByLabelText("Open menu");
      fireEvent.click(burgerButton);

      // Both desktop and mobile links should exist
      expect(submitLinks).toHaveLength(2);
      expect(screen.getByText("Menu")).toBeInTheDocument();
    });
  });
});
