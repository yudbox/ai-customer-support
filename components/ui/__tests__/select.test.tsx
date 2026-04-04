import { createRef } from "react";

import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Select } from "@/components/ui/select";

describe("Select Component", () => {
  const defaultOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  describe("Rendering", () => {
    it("renders select element", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toBeInTheDocument();
    });

    it("renders with default styles", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveClass("w-full");
      expect(select).toHaveClass("px-4");
      expect(select).toHaveClass("py-2");
      expect(select).toHaveClass("border");
      expect(select).toHaveClass("rounded-lg");
      expect(select).toHaveClass("cursor-pointer");
    });

    it("renders wrapper div with full width", () => {
      const { container } = render(<Select options={defaultOptions} />);
      const wrapper = container.firstChild;

      expect(wrapper).toHaveClass("w-full");
    });

    it("has appearance-none class for custom styling", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveClass("appearance-none");
      expect(select).toHaveClass("bg-white");
    });
  });

  describe("Label", () => {
    it("renders label when provided", () => {
      render(<Select label="Choose Option" options={defaultOptions} />);
      expect(screen.getByText("Choose Option")).toBeInTheDocument();
    });

    it("links label to select via htmlFor", () => {
      render(<Select label="Country" options={defaultOptions} />);
      const label = screen.getByText("Country");
      const select = screen.getByRole("combobox");

      expect(label).toHaveAttribute("for", select.id);
    });

    it("generates ID from label when id not provided", () => {
      render(<Select label="Select Size" options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveAttribute("id", "select-size");
    });

    it("uses custom id when provided", () => {
      render(
        <Select
          label="Gender"
          id="custom-gender-id"
          options={defaultOptions}
        />,
      );
      const select = screen.getByRole("combobox");

      expect(select).toHaveAttribute("id", "custom-gender-id");
    });

    it("shows required asterisk when required prop is true", () => {
      render(<Select label="Category" required options={defaultOptions} />);
      const asterisk = screen.getByText("*");

      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass("text-red-500");
    });

    it("does not show asterisk when required prop is false", () => {
      render(<Select label="Optional Field" options={defaultOptions} />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("renders without label when not provided", () => {
      const { container } = render(<Select options={defaultOptions} />);
      const label = container.querySelector("label");

      expect(label).not.toBeInTheDocument();
    });
  });

  describe("Options", () => {
    it("renders all provided options", () => {
      render(<Select options={defaultOptions} />);

      expect(
        screen.getByRole("option", { name: "Option 1" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Option 2" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Option 3" }),
      ).toBeInTheDocument();
    });

    it("renders options with correct values", () => {
      render(<Select options={defaultOptions} />);

      const option1 = screen.getByRole("option", {
        name: "Option 1",
      }) as HTMLOptionElement;
      const option2 = screen.getByRole("option", {
        name: "Option 2",
      }) as HTMLOptionElement;

      expect(option1.value).toBe("option1");
      expect(option2.value).toBe("option2");
    });

    it("renders options with icons when provided", () => {
      const optionsWithIcons = [
        { value: "search", label: "Search", icon: "🔍" },
        { value: "settings", label: "Settings", icon: "⚙️" },
        { value: "profile", label: "Profile", icon: "👤" },
      ];

      render(<Select options={optionsWithIcons} />);

      expect(
        screen.getByRole("option", { name: "🔍 Search" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "⚙️ Settings" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "👤 Profile" }),
      ).toBeInTheDocument();
    });

    it("renders options without icons when icon is not provided", () => {
      const optionsWithoutIcons = [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ];

      render(<Select options={optionsWithoutIcons} />);

      expect(screen.getByRole("option", { name: "Yes" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "No" })).toBeInTheDocument();
    });

    it("renders mixed options (some with icons, some without)", () => {
      const mixedOptions = [
        { value: "home", label: "Home", icon: "🏠" },
        { value: "work", label: "Work" },
        { value: "other", label: "Other", icon: "📍" },
      ];

      render(<Select options={mixedOptions} />);

      expect(
        screen.getByRole("option", { name: "🏠 Home" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Work" })).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "📍 Other" }),
      ).toBeInTheDocument();
    });

    it("renders empty options array", () => {
      render(<Select options={[]} />);
      const select = screen.getByRole("combobox");

      expect(select).toBeInTheDocument();
      // Only placeholder option should exist
      expect(select.querySelectorAll("option")).toHaveLength(1);
    });

    it("uses correct key for options", () => {
      const { container } = render(<Select options={defaultOptions} />);
      const options = container.querySelectorAll(
        "option[value]:not([value=''])",
      );

      expect(options).toHaveLength(3);
    });
  });

  describe("Placeholder", () => {
    it("renders default placeholder", () => {
      render(<Select options={defaultOptions} />);

      expect(
        screen.getByRole("option", { name: "Select an option..." }),
      ).toBeInTheDocument();
    });

    it("renders custom placeholder", () => {
      render(<Select options={defaultOptions} placeholder="Choose one" />);

      expect(
        screen.getByRole("option", { name: "Choose one" }),
      ).toBeInTheDocument();
    });

    it("placeholder option has empty value", () => {
      render(<Select options={defaultOptions} placeholder="Pick one" />);

      const placeholderOption = screen.getByRole("option", {
        name: "Pick one",
      }) as HTMLOptionElement;
      expect(placeholderOption.value).toBe("");
    });

    it("placeholder option is disabled", () => {
      render(<Select options={defaultOptions} />);

      const placeholderOption = screen.getByRole("option", {
        name: "Select an option...",
      }) as HTMLOptionElement;
      expect(placeholderOption).toBeDisabled();
    });
  });

  describe("Error State", () => {
    it("displays error message when error prop is provided", () => {
      render(
        <Select options={defaultOptions} error="This field is required" />,
      );
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error border style when error exists", () => {
      render(<Select options={defaultOptions} error="Invalid selection" />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveClass("border-red-500");
      expect(select).toHaveClass("focus:ring-red-500");
    });

    it("applies default border style when no error", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveClass("border-gray-300");
      expect(select).not.toHaveClass("border-red-500");
    });

    it("sets aria-invalid to true when error exists", () => {
      render(<Select options={defaultOptions} error="Error message" />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveAttribute("aria-invalid", "true");
    });

    it("sets aria-invalid to false when no error", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveAttribute("aria-invalid", "false");
    });

    it("links error message with aria-describedby", () => {
      render(
        <Select
          label="Category"
          options={defaultOptions}
          error="Invalid category"
        />,
      );
      const select = screen.getByRole("combobox");
      const errorMessage = screen.getByText("Invalid category");

      expect(select).toHaveAttribute("aria-describedby", "category-error");
      expect(errorMessage).toHaveAttribute("id", "category-error");
    });

    it("error message has role='alert' for screen readers", () => {
      render(<Select options={defaultOptions} error="Error!" />);
      const errorElement = screen.getByText("Error!");

      expect(errorElement).toHaveAttribute("role", "alert");
    });

    it("does not set aria-describedby when no error", () => {
      render(<Select label="Type" options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).not.toHaveAttribute("aria-describedby");
    });
  });

  describe("Disabled State", () => {
    it("renders disabled select", () => {
      render(<Select options={defaultOptions} disabled />);
      const select = screen.getByRole("combobox");

      expect(select).toBeDisabled();
    });

    it("applies disabled styles", () => {
      render(<Select options={defaultOptions} disabled />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveClass("disabled:bg-gray-100");
      expect(select).toHaveClass("disabled:cursor-not-allowed");
      expect(select).toHaveClass("disabled:text-gray-500");
    });

    it("is not focusable when disabled", () => {
      render(<Select options={defaultOptions} disabled />);
      const select = screen.getByRole("combobox");

      select.focus();
      expect(select).not.toHaveFocus();
    });
  });

  describe("Custom className", () => {
    it("merges custom className with default styles", () => {
      render(<Select options={defaultOptions} className="custom-class" />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveClass("custom-class");
      expect(select).toHaveClass("w-full"); // Still has default styles
    });

    it("allows Tailwind override via custom className", () => {
      render(<Select options={defaultOptions} className="bg-yellow-100" />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveClass("bg-yellow-100");
    });
  });

  describe("forwardRef", () => {
    it("forwards ref to select element", () => {
      const ref = createRef<HTMLSelectElement>();
      render(<Select ref={ref} options={defaultOptions} />);

      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
      expect(ref.current?.tagName).toBe("SELECT");
    });

    it("allows focus() through ref", () => {
      const ref = createRef<HTMLSelectElement>();
      render(<Select ref={ref} options={defaultOptions} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("allows value access through ref", () => {
      const ref = createRef<HTMLSelectElement>();
      render(
        <Select ref={ref} options={defaultOptions} defaultValue="option2" />,
      );

      expect(ref.current?.value).toBe("option2");
    });
  });

  describe("Select Attributes", () => {
    it("supports name attribute", () => {
      render(<Select options={defaultOptions} name="category" />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveAttribute("name", "category");
    });

    it("supports required attribute", () => {
      render(<Select options={defaultOptions} required />);
      const select = screen.getByRole("combobox");

      expect(select).toBeRequired();
    });

    it("supports defaultValue attribute", () => {
      render(<Select options={defaultOptions} defaultValue="option2" />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;

      expect(select.value).toBe("option2");
    });

    it("supports value attribute (controlled)", () => {
      const { rerender } = render(
        <Select options={defaultOptions} value="option1" onChange={() => {}} />,
      );
      const select = screen.getByRole("combobox") as HTMLSelectElement;

      expect(select.value).toBe("option1");

      rerender(
        <Select options={defaultOptions} value="option3" onChange={() => {}} />,
      );
      expect(select.value).toBe("option3");
    });

    it("supports multiple attribute", () => {
      render(<Select options={defaultOptions} multiple />);
      const select = screen.getByRole("listbox"); // multiple select has role="listbox"

      expect(select).toHaveAttribute("multiple");
    });
  });

  describe("Event Handlers", () => {
    it("triggers onChange handler when selection changes", () => {
      const handleChange = jest.fn();
      render(<Select options={defaultOptions} onChange={handleChange} />);
      const select = screen.getByRole("combobox");

      fireEvent.change(select, { target: { value: "option2" } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("passes event object to onChange", () => {
      const handleChange = jest.fn();
      render(<Select options={defaultOptions} onChange={handleChange} />);
      const select = screen.getByRole("combobox");

      fireEvent.change(select, { target: { value: "option1" } });
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    });

    it("updates selected value on change", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;

      fireEvent.change(select, { target: { value: "option3" } });
      expect(select.value).toBe("option3");
    });

    it("triggers onFocus handler", () => {
      const handleFocus = jest.fn();
      render(<Select options={defaultOptions} onFocus={handleFocus} />);
      const select = screen.getByRole("combobox");

      fireEvent.focus(select);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("triggers onBlur handler", () => {
      const handleBlur = jest.fn();
      render(<Select options={defaultOptions} onBlur={handleBlur} />);
      const select = screen.getByRole("combobox");

      fireEvent.blur(select);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has correct focus styles", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveClass("focus:outline-none");
      expect(select).toHaveClass("focus:ring-2");
      expect(select).toHaveClass("focus:ring-blue-500");
    });

    it("is focusable with keyboard", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      select.focus();
      expect(select).toHaveFocus();
    });

    it("supports aria-label", () => {
      render(<Select options={defaultOptions} aria-label="Choose category" />);
      const select = screen.getByLabelText("Choose category");

      expect(select).toBeInTheDocument();
    });

    it("has role='combobox' for screen readers", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("renders with label, error, and required", () => {
      render(
        <Select
          label="Priority"
          required
          error="Please select a priority"
          options={defaultOptions}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(screen.getByText("Priority")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("Please select a priority")).toBeInTheDocument();
      expect(select).toHaveAttribute("aria-invalid", "true");
    });

    it("handles label with multiple words", () => {
      render(<Select label="Ticket Category Type" options={defaultOptions} />);
      const select = screen.getByRole("combobox");

      expect(select).toHaveAttribute("id", "ticket-category-type");
    });

    it("works with form submission", () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Select name="test-select" options={defaultOptions} />
          <button type="submit">Submit</button>
        </form>,
      );

      const select = screen.getByRole("combobox");
      const button = screen.getByRole("button");

      fireEvent.change(select, { target: { value: "option1" } });
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it("renders large number of options", () => {
      const manyOptions = Array.from({ length: 50 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      render(<Select options={manyOptions} />);
      const select = screen.getByRole("combobox");

      // +1 for placeholder option
      expect(select.querySelectorAll("option")).toHaveLength(51);
    });

    it("handles options with special characters", () => {
      const specialOptions = [
        { value: "email", label: "Email & Notifications" },
        { value: "privacy", label: "Privacy < Security" },
        { value: "terms", label: "Terms & Conditions" },
      ];

      render(<Select options={specialOptions} />);

      expect(
        screen.getByRole("option", { name: "Email & Notifications" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Privacy < Security" }),
      ).toBeInTheDocument();
    });
  });

  describe("Component displayName", () => {
    it("has correct displayName for debugging", () => {
      expect(Select.displayName).toBe("Select");
    });
  });

  describe("Edge Cases", () => {
    it("does not render label when empty string provided", () => {
      const { container } = render(
        <Select label="" options={defaultOptions} />,
      );
      const label = container.querySelector("label");

      // Empty string is falsy, so label should not render
      expect(label).not.toBeInTheDocument();
    });

    it("renders with very long option labels", () => {
      const longOptions = [{ value: "long", label: "A".repeat(100) }];

      render(<Select options={longOptions} />);
      expect(
        screen.getByRole("option", { name: "A".repeat(100) }),
      ).toBeInTheDocument();
    });

    it("handles duplicate option values (React warning expected)", () => {
      // This test expects a React warning about duplicate keys
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const duplicateOptions = [
        { value: "duplicate", label: "First" },
        { value: "duplicate", label: "Second" },
      ];

      render(<Select options={duplicateOptions} />);
      const select = screen.getByRole("combobox");

      expect(select.querySelectorAll("option[value='duplicate']")).toHaveLength(
        2,
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("renders with option value as empty string (not placeholder)", () => {
      const optionsWithEmpty = [
        { value: "", label: "None" },
        { value: "option1", label: "Option 1" },
      ];

      render(<Select options={optionsWithEmpty} placeholder="Select" />);

      // Should have 2 empty value options (placeholder + "None")
      const emptyOptions = screen
        .getAllByRole("option")
        .filter((opt) => (opt as HTMLOptionElement).value === "");
      expect(emptyOptions).toHaveLength(2);
    });
  });
});
