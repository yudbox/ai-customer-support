/**
 * Integration tests for Header component
 *
 * Тестирует основную функциональность Header (без тестов Sidebar).
 */

import { render, screen } from "@testing-library/react";import { usePathname } from "next/navigation";

import { Header } from "@/app/_components/Header";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: React.ComponentProps<'a'>) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("Header Integration Tests", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("should render header with title", () => {
      render(<Header />);

      expect(screen.getByText("AI Customer Support")).toBeInTheDocument();
      expect(
        screen.getByText("Powered by Multi-Agent AI System"),
      ).toBeInTheDocument();
    });

    it("should render mobile menu button", () => {
      render(<Header />);

      const menuButton = screen.getByLabelText("Open menu");
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe("Desktop Navigation - Active Links", () => {
    it("should highlight Submit Ticket link when on home page", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<Header />);

      const links = screen.getAllByRole("link", { name: "📝 Submit Ticket" });
      const desktopLink = links[0]; // First link is desktop

      expect(desktopLink).toHaveClass("text-blue-600");
      expect(desktopLink).toHaveClass("border-blue-600");
    });

    it("should highlight Manager Dashboard link when on manager page", () => {
      (usePathname as jest.Mock).mockReturnValue("/manager");

      render(<Header />);

      const links = screen.getAllByRole("link", {
        name: "👔 Manager Dashboard",
      });
      const desktopLink = links[0]; // First link is desktop

      expect(desktopLink).toHaveClass("text-blue-600");
      expect(desktopLink).toHaveClass("border-blue-600");
    });

    it("should show inactive style for non-active links", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<Header />);

      const links = screen.getAllByRole("link", {
        name: "👔 Manager Dashboard",
      });
      const desktopLink = links[0]; // First link is desktop

      expect(desktopLink).toHaveClass("text-gray-600");
      expect(desktopLink).toHaveClass("border-transparent");
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-label for open menu button", () => {
      render(<Header />);

      const openButton = screen.getByLabelText("Open menu");
      expect(openButton.getAttribute("aria-label")).toBe("Open menu");
    });

    it("should have semantic HTML structure", () => {
      render(<Header />);

      const header = screen.getByRole("banner");
      expect(header.tagName).toBe("HEADER");
    });
  });
});
