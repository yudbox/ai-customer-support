/**
 * Accessibility Tests - Select Component
 *
 * Tests EU Directive 2019/882 compliance for Select (dropdown) component
 * Validates WCAG 2.1 Level AA requirements
 */

import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import { Select } from "@/components/ui/select";

expect.extend(toHaveNoViolations);

describe("Select Component - WCAG 2.1 AA Compliance", () => {
  const mockOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  describe("Basic Accessibility", () => {
    it("should pass axe accessibility tests", async () => {
      const { container } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible name from label", () => {
      const { getByLabelText } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByLabelText("Country");
      expect(select).toBeInTheDocument();
      expect(select).toHaveAccessibleName("Country");
    });

    it("should have proper semantic role", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByRole("combobox");
      expect(select).toBeInTheDocument();
    });
  });

  describe("Form Labels - EU Directive 2019/882 Critical", () => {
    it("should associate label with select via htmlFor/id", () => {
      const { getByLabelText } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByLabelText("Country");
      expect(select).toHaveAttribute("id", "country");
    });

    it("should work without label (using placeholder)", async () => {
      const { container } = render(
        <Select
          options={mockOptions}
          placeholder="Choose a country"
          aria-label="Country selection"
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should generate id from label text", () => {
      const { getByLabelText } = render(
        <Select label="User Country" options={mockOptions} />,
      );

      const select = getByLabelText("User Country");
      expect(select).toHaveAttribute("id", "user-country");
    });
  });

  describe("Keyboard Navigation - EU Directive 2019/882 Critical", () => {
    it("should be keyboard focusable", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByRole("combobox");
      expect(select).not.toHaveAttribute("tabindex", "-1");
    });

    it("should support keyboard navigation when focused", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByRole("combobox") as HTMLSelectElement;
      select.focus();

      expect(document.activeElement).toBe(select);
    });

    it("should have visible focus indicator", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByRole("combobox");
      const classes = select.className;

      // Check for focus ring classes
      expect(classes).toContain("focus:ring");
      expect(classes).toContain("focus:outline-none");
    });
  });

  describe("ARIA Attributes - EU Directive 2019/882 Critical", () => {
    it("should have aria-invalid when error present", () => {
      const { getByRole } = render(
        <Select
          label="Country"
          options={mockOptions}
          error="Please select a country"
        />,
      );

      const select = getByRole("combobox");
      expect(select).toHaveAttribute("aria-invalid", "true");
    });

    it("should not have aria-invalid when no error", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByRole("combobox");
      expect(select).toHaveAttribute("aria-invalid", "false");
    });

    it("should associate error message with aria-describedby", () => {
      const { getByRole } = render(
        <Select
          label="Country"
          options={mockOptions}
          error="Please select a country"
        />,
      );

      const select = getByRole("combobox");
      const errorId = select.getAttribute("aria-describedby");

      expect(errorId).toBe("country-error");

      const errorElement = getByRole("alert");
      expect(errorElement).toHaveTextContent("Please select a country");
      expect(errorElement).toHaveAttribute("id", errorId);
    });

    it("should have role=alert for error messages", () => {
      const { getByRole } = render(
        <Select
          label="Country"
          options={mockOptions}
          error="Please select a country"
        />,
      );

      const alert = getByRole("alert");
      expect(alert).toHaveTextContent("Please select a country");
    });
  });

  describe("Required Fields - EU Directive 2019/882", () => {
    it("should indicate required fields visually", () => {
      const { getByText } = render(
        <Select label="Country" options={mockOptions} required />,
      );

      const asterisk = getByText("*");
      expect(asterisk).toHaveClass("text-red-500");
    });

    it("should have required attribute on select element", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} required />,
      );

      const select = getByRole("combobox");
      expect(select).toBeRequired();
    });

    it("should pass axe tests with required field", async () => {
      const { container } = render(
        <Select label="Country" options={mockOptions} required />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Disabled State - EU Directive 2019/882", () => {
    it("should be keyboard inaccessible when disabled", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} disabled />,
      );

      const select = getByRole("combobox");
      expect(select).toBeDisabled();
    });

    it("should have proper ARIA state when disabled", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} disabled />,
      );

      const select = getByRole("combobox");
      expect(select).toHaveAttribute("disabled");
    });

    it("should have disabled cursor styling", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} disabled />,
      );

      const select = getByRole("combobox");
      expect(select.className).toContain("disabled:cursor-not-allowed");
    });

    it("should pass axe tests when disabled", async () => {
      const { container } = render(
        <Select label="Country" options={mockOptions} disabled />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Options and Values", () => {
    it("should render all options", () => {
      const { getAllByRole } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const options = getAllByRole("option");
      // +1 for placeholder option
      expect(options).toHaveLength(mockOptions.length + 1);
    });

    it("should render options with icons", () => {
      const optionsWithIcons = [
        { value: "us", label: "United States", icon: "🇺🇸" },
        { value: "uk", label: "United Kingdom", icon: "🇬🇧" },
        { value: "fr", label: "France", icon: "🇫🇷" },
      ];

      const { getByRole } = render(
        <Select label="Country" options={optionsWithIcons} />,
      );

      const option = getByRole("option", { name: /United States/ });
      expect(option).toHaveTextContent("🇺🇸 United States");
    });

    it("should have accessible placeholder option", () => {
      const { getByRole } = render(
        <Select
          label="Country"
          options={mockOptions}
          placeholder="Choose your country"
        />,
      );

      const placeholder = getByRole("option", { name: "Choose your country" });
      expect(placeholder).toHaveAttribute("disabled");
    });
  });

  describe("Error State - Screen Reader Announcements", () => {
    it("should announce error to screen readers via role=alert", () => {
      const { getByRole } = render(
        <Select
          label="Country"
          options={mockOptions}
          error="This field is required"
        />,
      );

      const alert = getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("should pass axe tests with error state", async () => {
      const { container } = render(
        <Select
          label="Country"
          options={mockOptions}
          error="Invalid selection"
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Color Contrast - WCAG 1.4.3 (AA)", () => {
    it("should have proper text color classes", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByRole("combobox");
      expect(select.className).toContain("text-");
    });

    it("should have proper border color classes", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} />,
      );

      const select = getByRole("combobox");
      expect(select.className).toContain("border-gray");
    });

    it("should have error color with sufficient contrast", () => {
      const { getByRole } = render(
        <Select label="Country" options={mockOptions} error="Please select" />,
      );

      const select = getByRole("combobox");
      expect(select.className).toContain("border-red-500");
    });

    // Note: Actual contrast ratio testing requires jest-canvas-mock
    // Install with: npm install -D jest-canvas-mock
    // Then add to jest.setup.js: import 'jest-canvas-mock';
  });

  describe("Complete Form Flow", () => {
    it("should pass axe tests in complete form context", async () => {
      const { container } = render(
        <form>
          <Select
            label="Country"
            options={mockOptions}
            required
            placeholder="Select your country"
          />
          <Select
            label="State"
            options={[
              { value: "ca", label: "California" },
              { value: "ny", label: "New York" },
            ]}
          />
        </form>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
