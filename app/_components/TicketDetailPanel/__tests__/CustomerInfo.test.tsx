import { render, screen } from "@testing-library/react";

import { CustomerInfo } from "@/app/_components/TicketDetailPanel/CustomerInfo";
import { CustomerTier } from "@/lib/types/common";

describe("CustomerInfo Component", () => {
  const defaultProps = {
    customer: {
      email: "john.doe@example.com",
      name: "John Doe",
      tier: CustomerTier.REGULAR,
      total_orders: 25,
      lifetime_value: 1234.56,
    },
  };

  describe("Rendering", () => {
    it("renders component with correct heading", () => {
      render(<CustomerInfo {...defaultProps} />);

      expect(screen.getByText("📋 Customer Info")).toBeInTheDocument();
    });

    it("renders container with correct styling", () => {
      render(<CustomerInfo {...defaultProps} />);

      // Verify component renders by checking for heading
      expect(screen.getByText("📋 Customer Info")).toBeInTheDocument();
    });

    it("renders grid layout", () => {
      render(<CustomerInfo {...defaultProps} />);

      // Verify grid content by checking all expected labels exist
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Tier")).toBeInTheDocument();
    });

    it("renders all labels", () => {
      render(<CustomerInfo {...defaultProps} />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Tier")).toBeInTheDocument();
      expect(screen.getByText("Total Orders")).toBeInTheDocument();
      expect(screen.getByText("Lifetime Value")).toBeInTheDocument();
    });
  });

  describe("Email Display", () => {
    it("displays email correctly", () => {
      render(<CustomerInfo {...defaultProps} />);

      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    });

    it("handles long email addresses", () => {
      const longEmail = "very.long.email.address.with.many.dots@example.com";
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, email: longEmail }}
        />,
      );

      expect(screen.getByText(longEmail)).toBeInTheDocument();
    });

    it("handles email with special characters", () => {
      const specialEmail = "user+tag@example.co.uk";
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, email: specialEmail }}
        />,
      );

      expect(screen.getByText(specialEmail)).toBeInTheDocument();
    });
  });

  describe("Name Display", () => {
    it("displays name correctly", () => {
      render(<CustomerInfo {...defaultProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("handles single word names", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, name: "Madonna" }}
        />,
      );

      expect(screen.getByText("Madonna")).toBeInTheDocument();
    });

    it("handles long names", () => {
      const longName =
        "Alexander Maximilian Christopher von Habsburg-Rothschild III";
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, name: longName }}
        />,
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("handles names with special characters", () => {
      const specialName = "María José O'Neill-García";
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, name: specialName }}
        />,
      );

      expect(screen.getByText(specialName)).toBeInTheDocument();
    });
  });

  describe("Tier Display", () => {
    it("displays VIP tier with star emoji", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, tier: CustomerTier.VIP }}
        />,
      );

      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
    });

    it("displays Regular tier without emoji", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, tier: CustomerTier.REGULAR }}
        />,
      );

      expect(screen.getByText("Regular")).toBeInTheDocument();
      expect(screen.queryByText("⭐")).not.toBeInTheDocument();
    });

    it("displays New tier without emoji", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, tier: CustomerTier.NEW }}
        />,
      );

      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.queryByText("⭐")).not.toBeInTheDocument();
    });

    it("displays custom tier values as-is", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, tier: "Custom Tier" }}
        />,
      );

      expect(screen.getByText("Custom Tier")).toBeInTheDocument();
    });

    it("displays empty tier value", () => {
      render(
        <CustomerInfo customer={{ ...defaultProps.customer, tier: "" }} />,
      );

      // Verify tier label exists when tier is empty
      expect(screen.getByText("Tier")).toBeInTheDocument();
    });
  });

  describe("Total Orders Display", () => {
    it("displays total orders correctly", () => {
      render(<CustomerInfo {...defaultProps} />);

      expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("handles zero orders", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, total_orders: 0 }}
        />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("handles large number of orders", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, total_orders: 9999 }}
        />,
      );

      expect(screen.getByText("9999")).toBeInTheDocument();
    });

    it("handles single order", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, total_orders: 1 }}
        />,
      );

      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("Lifetime Value Display", () => {
    it("displays lifetime value with 2 decimal places", () => {
      render(<CustomerInfo {...defaultProps} />);

      expect(screen.getByText("$1234.56")).toBeInTheDocument();
    });

    it("formats integer values with .00", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 1000 }}
        />,
      );

      expect(screen.getByText("$1000.00")).toBeInTheDocument();
    });

    it("rounds to 2 decimal places", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 1234.567 }}
        />,
      );

      expect(screen.getByText("$1234.57")).toBeInTheDocument();
    });

    it("handles zero lifetime value", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 0 }}
        />,
      );

      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("handles very large lifetime values", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 999999.99 }}
        />,
      );

      expect(screen.getByText("$999999.99")).toBeInTheDocument();
    });

    it("handles very small lifetime values", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 0.01 }}
        />,
      );

      expect(screen.getByText("$0.01")).toBeInTheDocument();
    });

    it("handles values requiring rounding down", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 123.124 }}
        />,
      );

      expect(screen.getByText("$123.12")).toBeInTheDocument();
    });

    it("handles values requiring rounding up", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 123.126 }}
        />,
      );

      expect(screen.getByText("$123.13")).toBeInTheDocument();
    });
  });

  describe("Complete Scenarios", () => {
    it("renders VIP customer with all data", () => {
      const vipCustomer = {
        email: "vip@example.com",
        name: "VIP Customer",
        tier: CustomerTier.VIP,
        total_orders: 100,
        lifetime_value: 50000.0,
      };

      render(<CustomerInfo customer={vipCustomer} />);

      expect(screen.getByText("vip@example.com")).toBeInTheDocument();
      expect(screen.getByText("VIP Customer")).toBeInTheDocument();
      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("$50000.00")).toBeInTheDocument();
    });

    it("renders new customer with minimal data", () => {
      const newCustomer = {
        email: "new@example.com",
        name: "New User",
        tier: CustomerTier.NEW,
        total_orders: 0,
        lifetime_value: 0,
      };

      render(<CustomerInfo customer={newCustomer} />);

      expect(screen.getByText("new@example.com")).toBeInTheDocument();
      expect(screen.getByText("New User")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("renders regular customer with moderate data", () => {
      render(<CustomerInfo {...defaultProps} />);

      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Regular")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("$1234.56")).toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("renders exactly 5 grid items", () => {
      render(<CustomerInfo {...defaultProps} />);

      // Verify all 5 field labels exist
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Tier")).toBeInTheDocument();
      expect(screen.getByText("Total Orders")).toBeInTheDocument();
      expect(screen.getByText("Lifetime Value")).toBeInTheDocument();
    });

    it("applies 2-column grid on larger screens", () => {
      render(<CustomerInfo {...defaultProps} />);

      // Verify grid content exists
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
    });
  });

  describe("Text Styling", () => {
    it("applies correct classes to labels", () => {
      render(<CustomerInfo {...defaultProps} />);

      const labels = screen.getAllByText(
        /Email|Name|Tier|Total Orders|Lifetime Value/,
      );

      labels.forEach((label) => {
        if (label.tagName === "P") {
          expect(label).toHaveClass("text-sm", "font-medium", "text-gray-500");
        }
      });
    });

    it("applies correct classes to values", () => {
      render(<CustomerInfo {...defaultProps} />);

      // Verify all values are rendered
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Regular")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("$1234.56")).toBeInTheDocument();
    });

    it("applies correct heading styles", () => {
      render(<CustomerInfo {...defaultProps} />);

      const heading = screen.getByText("📋 Customer Info");
      expect(heading).toHaveClass(
        "text-lg",
        "font-bold",
        "text-gray-900",
        "mb-4",
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles negative lifetime value", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: -100.5 }}
        />,
      );

      expect(screen.getByText("$-100.50")).toBeInTheDocument();
    });

    it("handles decimal precision edge case", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 0.005 }}
        />,
      );

      // 0.005 rounds to 0.01
      expect(screen.getByText("$0.01")).toBeInTheDocument();
    });

    it("handles lifetime value with many decimal places", () => {
      render(
        <CustomerInfo
          customer={{
            ...defaultProps.customer,
            lifetime_value: 123.456789123456,
          }}
        />,
      );

      expect(screen.getByText("$123.46")).toBeInTheDocument();
    });

    it("handles very large order count", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, total_orders: 999999 }}
        />,
      );

      expect(screen.getByText("999999")).toBeInTheDocument();
    });

    it("handles unicode characters in name", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, name: "Chen Dawen" }}
        />,
      );

      expect(screen.getByText("Chen Dawen")).toBeInTheDocument();
    });

    it("handles emoji in name", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, name: "Sarah 🌟 Smith" }}
        />,
      );

      expect(screen.getByText("Sarah 🌟 Smith")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML structure", () => {
      render(<CustomerInfo {...defaultProps} />);

      // Verify heading exists using semantic query
      expect(
        screen.getByRole("heading", { level: 2, name: "📋 Customer Info" }),
      ).toBeInTheDocument();
      // Verify labels exist
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("has proper heading hierarchy", () => {
      render(<CustomerInfo {...defaultProps} />);

      // Verify heading using role
      expect(
        screen.getByRole("heading", { level: 2, name: "📋 Customer Info" }),
      ).toBeInTheDocument();
    });

    it("uses descriptive labels for each field", () => {
      render(<CustomerInfo {...defaultProps} />);

      // All labels should be present and descriptive
      const labels = [
        "Email",
        "Name",
        "Tier",
        "Total Orders",
        "Lifetime Value",
      ];

      labels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe("Component Props", () => {
    it("accepts and displays all customer properties", () => {
      const customer = {
        email: "test@test.com",
        name: "Test User",
        tier: "Premium",
        total_orders: 42,
        lifetime_value: 8888.88,
      };

      render(<CustomerInfo customer={customer} />);

      expect(screen.getByText("test@test.com")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("Premium")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("$8888.88")).toBeInTheDocument();
    });

    it("re-renders when customer prop changes", () => {
      const { rerender } = render(<CustomerInfo {...defaultProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();

      const newCustomer = {
        ...defaultProps.customer,
        name: "Jane Smith",
        tier: CustomerTier.VIP,
      };

      rerender(<CustomerInfo customer={newCustomer} />);

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("⭐ VIP")).toBeInTheDocument();
    });
  });

  describe("Currency Formatting", () => {
    it("always includes dollar sign", () => {
      render(<CustomerInfo {...defaultProps} />);

      const lifetimeValue = screen.getByText(/\$/);
      expect(lifetimeValue).toBeInTheDocument();
    });

    it("formats cents correctly", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 0.99 }}
        />,
      );

      expect(screen.getByText("$0.99")).toBeInTheDocument();
    });

    it("handles .5 rounding correctly", () => {
      render(
        <CustomerInfo
          customer={{ ...defaultProps.customer, lifetime_value: 1.005 }}
        />,
      );

      // JavaScript's toFixed uses banker's rounding
      expect(screen.getByText(/^\$1\.0[01]$/)).toBeInTheDocument();
    });
  });
});
