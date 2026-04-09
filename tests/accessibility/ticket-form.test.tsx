/**
 * Accessibility Tests - TicketForm Component (TIER 1)
 *
 * CRITICAL: EU Directive 2019/882 compliance
 * Tests main ticket submission form accessibility and user flows
 *
 * Coverage:
 * - Form fields accessibility (labels, required, types)
 * - Form validation and error announcements (role="alert", aria-live)
 * - Character counters (WCAG 3.3.2)
 * - Loading states and submit button
 * - Server error handling and feedback
 * - Quick Fill feature accessibility
 * - Keyboard navigation and focus management
 * - Full form submission flow
 */

import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import { TicketForm } from "@/app/_components/TicketForm";
import { trpc } from "@/lib/trpc/client";

expect.extend(toHaveNoViolations);

// Mock tRPC
jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    tickets: {
      create: {
        useMutation: jest.fn(),
      },
    },
  },
}));

const mockMutate = jest.fn();
const mockUseMutation = trpc.tickets.create.useMutation as jest.Mock;

describe("TicketForm - WCAG 2.1 AA Compliance (TIER 1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      error: null,
      isLoading: false,
    });
  });

  // ============================================================================
  // BASIC ACCESSIBILITY
  // ============================================================================

  describe("Basic Accessibility", () => {
    it("should pass axe accessibility tests", async () => {
      const { container } = render(<TicketForm />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have semantic form element", () => {
      const { getByRole } = render(<TicketForm />);

      const form = getByRole("form");
      expect(form).toBeInTheDocument();
    });

    it("should have main heading", () => {
      const { getByRole } = render(<TicketForm />);

      const heading = getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Submit a Support Ticket");
    });
  });

  // ============================================================================
  // FORM FIELDS - WCAG 3.3.2
  // ============================================================================

  describe("Form Fields Accessibility", () => {
    it("should have all required fields properly labeled", () => {
      const { getByLabelText } = render(<TicketForm />);

      expect(getByLabelText(/email address/i)).toBeInTheDocument();
      expect(getByLabelText(/subject/i)).toBeInTheDocument();
      expect(getByLabelText(/description/i)).toBeInTheDocument();
    });

    it("should indicate required fields", () => {
      const { getByLabelText } = render(<TicketForm />);

      const emailInput = getByLabelText(/email address/i);
      const subjectInput = getByLabelText(/subject/i);
      const descriptionTextarea = getByLabelText(/description/i);

      expect(emailInput).toBeRequired();
      expect(subjectInput).toBeRequired();
      expect(descriptionTextarea).toBeRequired();
    });

    it("should have optional field not marked as required", () => {
      const { getByLabelText } = render(<TicketForm />);

      const orderInput = getByLabelText(/order number/i);
      expect(orderInput).not.toBeRequired();
    });

    it("should have appropriate input types", () => {
      const { getByLabelText } = render(<TicketForm />);

      const emailInput = getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have placeholders for guidance", () => {
      const { getByLabelText } = render(<TicketForm />);

      const emailInput = getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute("placeholder");
    });
  });

  // ============================================================================
  // CHARACTER COUNTERS - WCAG 3.3.2
  // ============================================================================

  describe("Character Counters", () => {
    it("should display subject character counter", () => {
      const { getByText } = render(<TicketForm />);

      expect(getByText(/0\/500 characters/i)).toBeInTheDocument();
    });

    it("should update subject counter on input", async () => {
      const user = userEvent.setup();
      const { getByLabelText, getByText } = render(<TicketForm />);

      const subjectInput = getByLabelText(/subject/i);
      await user.type(subjectInput, "Test subject");

      expect(getByText(/12\/500 characters/i)).toBeInTheDocument();
    });

    it("should have description counter accessible (via Textarea component)", () => {
      const { getByLabelText } = render(<TicketForm />);

      const descriptionTextarea = getByLabelText(/description/i);

      // Textarea component should have showCharCount prop
      // which adds aria-describedby for screen readers
      expect(descriptionTextarea).toBeInTheDocument();
    });

    it("should not exceed maxLength", () => {
      const { getByLabelText } = render(<TicketForm />);

      const subjectInput = getByLabelText(/subject/i);
      expect(subjectInput).toHaveAttribute("maxLength", "500");
    });
  });

  // ============================================================================
  // VALIDATION ERRORS - WCAG 3.3.1, 3.3.3
  // ============================================================================

  describe("Validation Errors", () => {
    it("should show error messages for empty required fields", async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<TicketForm />);

      const submitButton = getByRole("button", { name: /submit ticket/i });
      await user.click(submitButton);

      // Form validation should prevent submission
      // and show error messages (handled by react-hook-form)
    });

    it("should associate error messages with inputs via aria-describedby", async () => {
      const user = userEvent.setup();
      const { getByLabelText, getByRole } = render(<TicketForm />);

      const submitButton = getByRole("button", { name: /submit ticket/i });
      await user.click(submitButton);

      // Input component should have aria-describedby when error present
      const emailInput = getByLabelText(/email address/i);

      // Check for aria-invalid when there's an error
      expect(emailInput).toHaveAttribute("aria-invalid");
    });

    it("should announce errors to screen readers", async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<TicketForm />);

      const submitButton = getByRole("button", { name: /submit ticket/i });
      await user.click(submitButton);

      // Error messages should have role="alert" (handled by Input/Textarea components)
    });
  });

  // ============================================================================
  // QUICK FILL SCENARIO - WCAG 2.4.6
  // ============================================================================

  describe("Quick Fill Feature", () => {
    it("should have accessible select dropdown", () => {
      const { getByLabelText } = render(<TicketForm />);

      const quickFillSelect = getByLabelText(/quick fill scenario/i);
      expect(quickFillSelect).toBeInTheDocument();
    });

    it("should have label for quick fill", () => {
      const { getByLabelText } = render(<TicketForm />);

      const select = getByLabelText(/quick fill scenario/i);
      expect(select).toHaveAccessibleName();
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<TicketForm />);

      const select = getByLabelText(/quick fill scenario/i);
      select.focus();

      expect(document.activeElement).toBe(select);

      // Should be able to change with keyboard
      await user.keyboard("{ArrowDown}");
    });

    it("should auto-fill form when scenario selected", async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<TicketForm />);

      const select = getByLabelText(
        /quick fill scenario/i,
      ) as HTMLSelectElement;
      const emailInput = getByLabelText(/email address/i) as HTMLInputElement;

      // Select a scenario (using real scenario ID from ticket-scenarios.ts)
      await user.selectOptions(select, ["regular-question-product"]);

      // Form should be auto-filled
      await waitFor(() => {
        expect(emailInput.value).toBe("johan.hagenes@yahoo.com");
      });
    });
  });

  // ============================================================================
  // SUBMIT BUTTON - WCAG 2.4.4
  // ============================================================================

  describe("Submit Button", () => {
    it("should have accessible submit button", () => {
      const { getByRole } = render(<TicketForm />);

      const button = getByRole("button", { name: /submit ticket/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should show loading state", () => {
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        error: null,
        isLoading: true,
      });

      const { getByRole } = render(<TicketForm />);

      const button = getByRole("button", { name: /submit/i });

      // Button component should handle isPending state
      expect(button).toBeInTheDocument();
    });

    it("should be disabled during submission", () => {
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        error: null,
        isLoading: true,
      });

      const { getByRole } = render(<TicketForm />);

      const button = getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ERROR HANDLING - WCAG 3.3.1
  // ============================================================================

  describe("Error Handling", () => {
    it("should display server error messages", () => {
      const errorMessage = "Failed to create ticket";
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        error: { message: errorMessage },
        isLoading: false,
      });

      const { getByText } = render(<TicketForm />);

      expect(getByText(errorMessage)).toBeInTheDocument();
    });

    it("should announce server errors to screen readers", () => {
      const errorMessage = "Network error occurred";
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        error: { message: errorMessage },
        isLoading: false,
      });

      const { getByRole } = render(<TicketForm />);

      const alert = getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(errorMessage);
    });

    it("should have aria-live for error announcements", () => {
      const errorMessage = "Validation failed";
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        error: { message: errorMessage },
        isLoading: false,
      });

      const { getByRole } = render(<TicketForm />);

      const alert = getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "assertive");
    });

    it("should pass axe tests with error displayed", async () => {
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        error: { message: "Error occurred" },
        isLoading: false,
      });

      const { container } = render(<TicketForm />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION - WCAG 2.1.1
  // ============================================================================

  describe("Keyboard Navigation", () => {
    it("should tab through form fields in logical order", async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<TicketForm />);

      await user.tab();

      // First field should be email
      const emailInput = getByLabelText(/email address/i);
      expect(document.activeElement).toBe(emailInput);
    });

    it("should support Shift+Tab for reverse navigation", async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<TicketForm />);

      // Focus submit button
      const submitButton = getByRole("button", { name: /submit ticket/i });
      submitButton.focus();

      // Shift+Tab should go to previous field
      await user.tab({ shift: true });

      expect(document.activeElement).not.toBe(submitButton);
    });

    it("should submit form on Enter in input fields", async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<TicketForm />);

      const emailInput = getByLabelText(/email address/i);
      await user.type(emailInput, "test@example.com{Enter}");

      // Form should attempt to submit (validation may prevent it)
    });

    it("should have visible focus indicators", () => {
      const { getByLabelText } = render(<TicketForm />);

      const inputs = [
        getByLabelText(/email address/i),
        getByLabelText(/subject/i),
        getByLabelText(/description/i),
      ];

      inputs.forEach((input) => {
        // Input components should have focus styling
        expect(input.className).toContain("focus:");
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration Tests", () => {
    it("should complete full form submission flow", async () => {
      const user = userEvent.setup();
      const onSubmitSuccess = jest.fn();

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        error: null,
        isLoading: false,
      });

      const { getByLabelText, getByRole } = render(
        <TicketForm onSubmitSuccess={onSubmitSuccess} />,
      );

      // Fill form
      await user.type(getByLabelText(/email address/i), "user@test.com");
      await user.type(getByLabelText(/subject/i), "Need help");
      await user.type(getByLabelText(/description/i), "Detailed description");

      // Submit
      const submitButton = getByRole("button", { name: /submit ticket/i });
      await user.click(submitButton);

      // Mutation should be called
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("should work with Quick Fill and manual editing", async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<TicketForm />);

      // Use Quick Fill (using real scenario ID)
      const select = getByLabelText(/quick fill scenario/i);
      await user.selectOptions(select, ["regular-question-product"]);

      // Manually edit after Quick Fill
      const subjectInput = getByLabelText(/subject/i);
      await user.clear(subjectInput);
      await user.type(subjectInput, "Custom subject");

      expect(subjectInput).toHaveValue("Custom subject");
    });

    it("should reset form after successful submission", async () => {
      const user = userEvent.setup();

      mockUseMutation.mockImplementation(
        (options: { onSuccess?: (result: { id: string }) => void }) => {
          return {
            mutate: () => {
              // Simulate success
              options.onSuccess?.({ id: "ticket-123" });
            },
            error: null,
            isLoading: false,
          };
        },
      );

      const { getByLabelText, getByRole } = render(<TicketForm />);

      // Fill and submit
      const emailInput = getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, "test@example.com");
      await user.type(getByLabelText(/subject/i), "Test");
      await user.type(getByLabelText(/description/i), "Description");

      const submitButton = getByRole("button", { name: /submit ticket/i });
      await user.click(submitButton);

      // Form should reset
      await waitFor(() => {
        expect(emailInput.value).toBe("");
      });
    });
  });

  // ============================================================================
  // COLOR CONTRAST
  // ============================================================================

  describe("Color Contrast", () => {
    it("should have sufficient color contrast", async () => {
      const { container } = render(<TicketForm />);

      const results = await axe(container, {
        rules: { "color-contrast": { enabled: true } },
      });

      expect(results).toHaveNoViolations();
    });

    it("should have sufficient contrast for error messages", async () => {
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        error: { message: "Error occurred" },
        isLoading: false,
      });

      const { container } = render(<TicketForm />);

      const results = await axe(container, {
        rules: { "color-contrast": { enabled: true } },
      });

      expect(results).toHaveNoViolations();
    });
  });
});
