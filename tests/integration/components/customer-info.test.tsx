/**
 * Integration tests for CustomerInfo component
 *
 * Тестирует отображение информации о клиенте: email, имя, tier, заказы, lifetime value.
 */

import { render, screen } from "@testing-library/react";

import { CustomerInfo } from "@/app/_components/TicketDetailPanel/CustomerInfo";
import { CustomerTier } from "@/lib/types/common";

describe("CustomerInfo Integration Tests", () => {
  const defaultCustomer = {
    email: "test@example.com",
    name: "John Doe",
    tier: CustomerTier.REGULAR,
    total_orders: 10,
    lifetime_value: 1234.56,
  };

  describe("Initial Rendering", () => {
    it("should render CustomerInfo component", () => {
      render(<CustomerInfo customer={defaultCustomer} />);

      expect(screen.getByText("📋 Customer Info")).toBeInTheDocument();
    });

    it("should render header with emoji", () => {
      render(<CustomerInfo customer={defaultCustomer} />);

      expect(
        screen.getByRole("heading", { name: /Customer Info/i }),
      ).toBeInTheDocument();
    });

    it("should render all field labels", () => {
      render(<CustomerInfo customer={defaultCustomer} />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Tier")).toBeInTheDocument();
      expect(screen.getByText("Total Orders")).toBeInTheDocument();
      expect(screen.getByText("Lifetime Value")).toBeInTheDocument();
    });
  });

  describe("Email Display", () => {
    it("should display customer email", () => {
      render(<CustomerInfo customer={defaultCustomer} />);

      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("should display different email addresses", () => {
      const { rerender } = render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            email: "alice@example.com",
          }}
        />,
      );

      expect(screen.getByText("alice@example.com")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            email: "bob.smith@company.org",
          }}
        />,
      );

      expect(screen.getByText("bob.smith@company.org")).toBeInTheDocument();
    });

    it("should display email with special characters", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            email: "user+tag@sub.domain.com",
          }}
        />,
      );

      expect(screen.getByText("user+tag@sub.domain.com")).toBeInTheDocument();
    });

    it("should handle very long email addresses", () => {
      const longEmail =
        "verylongemailaddress@verylongdomainname.corporate.example.com";
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            email: longEmail,
          }}
        />,
      );

      expect(screen.getByText(longEmail)).toBeInTheDocument();
    });
  });

  describe("Name Display", () => {
    it("should display customer name", () => {
      render(<CustomerInfo customer={defaultCustomer} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should display different customer names", () => {
      const { rerender } = render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            name: "Alice Smith",
          }}
        />,
      );

      expect(screen.getByText("Alice Smith")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            name: "Bob Johnson",
          }}
        />,
      );

      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("should display single name", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            name: "Madonna",
          }}
        />,
      );

      expect(screen.getByText("Madonna")).toBeInTheDocument();
    });

    it("should display names with special characters", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            name: "O'Brien-Smith Jr.",
          }}
        />,
      );

      expect(screen.getByText("O'Brien-Smith Jr.")).toBeInTheDocument();
    });

    it("should handle very long names", () => {
      const longName = "Christopher Alexander Montgomery-Richardson III";
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            name: longName,
          }}
        />,
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });

  describe("Tier Display - VIP", () => {
    it("should display VIP tier with star emoji", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.VIP,
          }}
        />,
      );

      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
    });

    it("should add star emoji only for VIP tier", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.VIP,
          }}
        />,
      );

      const tierText = screen.getByText("⭐ VIP");
      expect(tierText).toBeInTheDocument();
      expect(tierText.textContent).toContain("⭐");
    });

    it("should not display plain VIP without emoji", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.VIP,
          }}
        />,
      );

      // Should have the star
      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
      // Should not have plain "VIP" without the star
      expect(
        screen.queryByText("VIP", { exact: true }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Tier Display - Regular", () => {
    it("should display Regular tier without emoji", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.REGULAR,
          }}
        />,
      );

      expect(screen.getByText("Regular")).toBeInTheDocument();
    });

    it("should not add star emoji to Regular tier", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.REGULAR,
          }}
        />,
      );

      const tierElements = screen.getAllByText(/Regular/i);
      const tierValue = tierElements.find((el) =>
        el.className.includes("text-gray-900"),
      );

      expect(tierValue?.textContent).toBe("Regular");
      expect(tierValue?.textContent).not.toContain("⭐");
    });
  });

  describe("Tier Display - New", () => {
    it("should display New tier without emoji", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.NEW,
          }}
        />,
      );

      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("should not add star emoji to New tier", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.NEW,
          }}
        />,
      );

      const tierElements = screen.getAllByText(/New/i);
      const tierValue = tierElements.find((el) =>
        el.className.includes("text-gray-900"),
      );

      expect(tierValue?.textContent).toBe("New");
      expect(tierValue?.textContent).not.toContain("⭐");
    });
  });

  describe("Tier Display - All Types", () => {
    it("should handle transitions between tier types", () => {
      const { rerender } = render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.NEW,
          }}
        />,
      );

      expect(screen.getByText("New")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.REGULAR,
          }}
        />,
      );

      expect(screen.getByText("Regular")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.VIP,
          }}
        />,
      );

      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
    });

    it("should display tier as string when not VIP", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: "Custom Tier",
          }}
        />,
      );

      expect(screen.getByText("Custom Tier")).toBeInTheDocument();
    });
  });

  describe("Total Orders Display", () => {
    it("should display total orders count", () => {
      render(<CustomerInfo customer={defaultCustomer} />);

      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should display different order counts", () => {
      const { rerender } = render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            total_orders: 5,
          }}
        />,
      );

      expect(screen.getByText("5")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            total_orders: 100,
          }}
        />,
      );

      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("should display zero orders", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            total_orders: 0,
          }}
        />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should display large order counts", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            total_orders: 9999,
          }}
        />,
      );

      expect(screen.getByText("9999")).toBeInTheDocument();
    });

    it("should display single order", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            total_orders: 1,
          }}
        />,
      );

      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("Lifetime Value Display", () => {
    it("should display lifetime value with 2 decimal places", () => {
      render(<CustomerInfo customer={defaultCustomer} />);

      expect(screen.getByText("$1234.56")).toBeInTheDocument();
    });

    it("should format different lifetime values", () => {
      const { rerender } = render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 99.99,
          }}
        />,
      );

      expect(screen.getByText("$99.99")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 5000.5,
          }}
        />,
      );

      expect(screen.getByText("$5000.50")).toBeInTheDocument();
    });

    it("should display zero lifetime value", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 0,
          }}
        />,
      );

      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("should always show 2 decimal places", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 100,
          }}
        />,
      );

      expect(screen.getByText("$100.00")).toBeInTheDocument();
    });

    it("should round to 2 decimal places", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 123.456,
          }}
        />,
      );

      expect(screen.getByText("$123.46")).toBeInTheDocument();
    });

    it("should handle very large lifetime values", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 999999.99,
          }}
        />,
      );

      expect(screen.getByText("$999999.99")).toBeInTheDocument();
    });

    it("should handle small decimal values", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 0.01,
          }}
        />,
      );

      expect(screen.getByText("$0.01")).toBeInTheDocument();
    });

    it("should handle values with one decimal place", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 42.5,
          }}
        />,
      );

      expect(screen.getByText("$42.50")).toBeInTheDocument();
    });
  });

  describe("Complete Customer Profiles", () => {
    it("should display complete VIP customer profile", () => {
      render(
        <CustomerInfo
          customer={{
            email: "vip@luxury.com",
            name: "Elizabeth VanDerMeer",
            tier: CustomerTier.VIP,
            total_orders: 250,
            lifetime_value: 50000.99,
          }}
        />,
      );

      expect(screen.getByText("vip@luxury.com")).toBeInTheDocument();
      expect(screen.getByText("Elizabeth VanDerMeer")).toBeInTheDocument();
      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
      expect(screen.getByText("250")).toBeInTheDocument();
      expect(screen.getByText("$50000.99")).toBeInTheDocument();
    });

    it("should display complete Regular customer profile", () => {
      render(
        <CustomerInfo
          customer={{
            email: "regular@example.com",
            name: "Michael Johnson",
            tier: CustomerTier.REGULAR,
            total_orders: 15,
            lifetime_value: 1500.0,
          }}
        />,
      );

      expect(screen.getByText("regular@example.com")).toBeInTheDocument();
      expect(screen.getByText("Michael Johnson")).toBeInTheDocument();
      expect(screen.getByText("Regular")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("$1500.00")).toBeInTheDocument();
    });

    it("should display complete New customer profile", () => {
      render(
        <CustomerInfo
          customer={{
            email: "newbie@gmail.com",
            name: "Sarah Williams",
            tier: CustomerTier.NEW,
            total_orders: 1,
            lifetime_value: 49.99,
          }}
        />,
      );

      expect(screen.getByText("newbie@gmail.com")).toBeInTheDocument();
      expect(screen.getByText("Sarah Williams")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("$49.99")).toBeInTheDocument();
    });

    it("should display customer with no orders and no value", () => {
      render(
        <CustomerInfo
          customer={{
            email: "new@example.com",
            name: "First Timer",
            tier: CustomerTier.NEW,
            total_orders: 0,
            lifetime_value: 0,
          }}
        />,
      );

      expect(screen.getByText("new@example.com")).toBeInTheDocument();
      expect(screen.getByText("First Timer")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("should display high-value regular customer", () => {
      render(
        <CustomerInfo
          customer={{
            email: "whale@business.com",
            name: "Corporate Buyer",
            tier: CustomerTier.REGULAR,
            total_orders: 500,
            lifetime_value: 100000.0,
          }}
        />,
      );

      expect(screen.getByText("whale@business.com")).toBeInTheDocument();
      expect(screen.getByText("Corporate Buyer")).toBeInTheDocument();
      expect(screen.getByText("Regular")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("$100000.00")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render with proper container classes", () => {
      const { container } = render(<CustomerInfo customer={defaultCustomer} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass("bg-white", "rounded-lg", "shadow", "p-6");
    });

    it("should use grid layout for fields", () => {
      render(<CustomerInfo customer={defaultCustomer} />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Tier")).toBeInTheDocument();
      expect(screen.getByText("Total Orders")).toBeInTheDocument();
      expect(screen.getByText("Lifetime Value")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string email", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            email: "",
          }}
        />,
      );

      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("should handle empty string name", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            name: "",
          }}
        />,
      );

      expect(screen.getByText("Name")).toBeInTheDocument();
    });

    it("should handle negative lifetime value", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: -50.0,
          }}
        />,
      );

      expect(screen.getByText("$-50.00")).toBeInTheDocument();
    });

    it("should handle very small fractional lifetime value", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 0.001,
          }}
        />,
      );

      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("should handle value that needs rounding up", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 99.995,
          }}
        />,
      );

      expect(screen.getByText("$100.00")).toBeInTheDocument();
    });

    it("should handle value that needs rounding down", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            lifetime_value: 99.994,
          }}
        />,
      );

      expect(screen.getByText("$99.99")).toBeInTheDocument();
    });
  });

  describe("Data Updates", () => {
    it("should update when customer data changes", () => {
      const { rerender } = render(<CustomerInfo customer={defaultCustomer} />);

      expect(screen.getByText("test@example.com")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            email: "updated@example.com",
            name: "Updated Name",
            tier: CustomerTier.VIP,
            total_orders: 50,
            lifetime_value: 5000.0,
          }}
        />,
      );

      expect(screen.getByText("updated@example.com")).toBeInTheDocument();
      expect(screen.getByText("Updated Name")).toBeInTheDocument();
      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("$5000.00")).toBeInTheDocument();
    });

    it("should update tier from Regular to VIP correctly", () => {
      const { rerender } = render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.REGULAR,
          }}
        />,
      );

      expect(screen.getByText("Regular")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.VIP,
          }}
        />,
      );

      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
      expect(screen.queryByText("Regular")).not.toBeInTheDocument();
    });

    it("should update tier from VIP to Regular correctly", () => {
      const { rerender } = render(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.VIP,
          }}
        />,
      );

      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();

      rerender(
        <CustomerInfo
          customer={{
            ...defaultCustomer,
            tier: CustomerTier.REGULAR,
          }}
        />,
      );

      expect(screen.getByText("Regular")).toBeInTheDocument();
      expect(screen.queryByText("⭐ VIP")).not.toBeInTheDocument();
    });
  });
});
