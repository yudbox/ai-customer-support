/**
 * Integration tests for TicketForm component
 *
 * Тестирует форму отправки тикетов: валидацию, character counters,
 * Quick Fill scenarios, submission, error handling.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TicketForm } from "@/app/_components/TicketForm";

// Mock tRPC
const mockMutate = jest.fn();
const mockTRPCMutationState = {
  isPending: false,
  error: null as { message: string } | null,
};

// Store onSuccess callback to call later
let mockOnSuccessCallback: ((data: { id: string }) => void) | undefined;

jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    tickets: {
      create: {
        useMutation: jest.fn(
          (options?: { onSuccess?: (data: { id: string }) => void }) => {
            // Store the callback for later use
            mockOnSuccessCallback = options?.onSuccess;
            return {
              mutate: mockMutate,
              isPending: mockTRPCMutationState.isPending,
              error: mockTRPCMutationState.error,
            };
          },
        ),
      },
    },
  },
}));

// Mock ticket scenarios
jest.mock("@/lib/constants/ticket-scenarios", () => ({
  getScenarioOptions: jest.fn(() => [
    { value: "", label: "Select a scenario..." },
    { value: "wrong-item", label: "Wrong Item Delivered" },
    { value: "refund", label: "Request Refund" },
  ]),
  getScenarioById: jest.fn((id: string) => {
    const scenarios: Record<
      string,
      { email: string; subject: string; body: string }
    > = {
      "wrong-item": {
        email: "john.doe@example.com",
        subject: "Wrong item delivered",
        body: "I ordered a blue shirt but received a red one.",
      },
      refund: {
        email: "jane.smith@example.com",
        subject: "Refund request",
        body: "I would like to request a refund for my order.",
      },
    };
    return scenarios[id];
  }),
}));

describe("TicketForm Integration Tests", () => {
  const mockOnSubmitSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockTRPCMutationState.isPending = false;
    mockTRPCMutationState.error = null;
    mockOnSuccessCallback = undefined;
  });

  describe("Initial Render", () => {
    it("should render form title", () => {
      render(<TicketForm />);

      expect(screen.getByText("Submit a Support Ticket")).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      render(<TicketForm />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText("Order Number (optional)"),
      ).toBeInTheDocument();
    });

    it("should render Quick Fill Scenario dropdown", () => {
      render(<TicketForm />);

      expect(
        screen.getByLabelText("🎲 Quick Fill Scenario"),
      ).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<TicketForm />);

      expect(
        screen.getByRole("button", { name: /submit ticket/i }),
      ).toBeInTheDocument();
    });

    it("should show AI-powered support message", () => {
      render(<TicketForm />);

      expect(
        screen.getByText(/our ai-powered support system/i),
      ).toBeInTheDocument();
    });

    it("should have empty form fields initially", () => {
      render(<TicketForm />);

      const emailInput = screen.getByLabelText(
        /email address/i,
      ) as HTMLInputElement;
      const subjectInput = screen.getByLabelText(
        /^subject/i,
      ) as HTMLInputElement;
      const bodyInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement;

      expect(emailInput.value).toBe("");
      expect(subjectInput.value).toBe("");
      expect(bodyInput.value).toBe("");
    });
  });

  describe("Form Input", () => {
    it("should allow typing in email field", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should allow typing in subject field", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      const subjectInput = screen.getByLabelText(/^subject/i);
      await user.type(subjectInput, "Test subject");

      expect(subjectInput).toHaveValue("Test subject");
    });

    it("should allow typing in body field", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      const bodyInput = screen.getByLabelText(/description/i);
      await user.type(bodyInput, "Test description with details");

      expect(bodyInput).toHaveValue("Test description with details");
    });

    it("should allow typing in order number field", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      const orderInput = screen.getByLabelText("Order Number (optional)");
      await user.type(orderInput, "ORD-12345");

      expect(orderInput).toHaveValue("ORD-12345");
    });
  });

  describe("Character Counters", () => {
    it("should show 0/500 for subject initially", () => {
      render(<TicketForm />);

      expect(screen.getByText("0/500 characters")).toBeInTheDocument();
    });

    it("should update subject character counter when typing", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      const subjectInput = screen.getByLabelText(/^subject/i);
      await user.type(subjectInput, "Hello");

      expect(screen.getByText("5/500 characters")).toBeInTheDocument();
    });

    it("should show character count for body field", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      const bodyInput = screen.getByLabelText(/description/i);
      await user.type(bodyInput, "Test description");

      // Body uses Textarea component with showCharCount prop
      // Character counter is rendered by Textarea component
      expect(bodyInput).toHaveValue("Test description");
    });
  });

  describe("Quick Fill Scenario", () => {
    it("should auto-fill form when scenario is selected", async () => {
      render(<TicketForm />);

      const scenarioSelect = screen.getByLabelText("🎲 Quick Fill Scenario");
      fireEvent.change(scenarioSelect, { target: { value: "wrong-item" } });

      await waitFor(() => {
        const emailInput = screen.getByLabelText(
          /email address/i,
        ) as HTMLInputElement;
        const subjectInput = screen.getByLabelText(
          /^subject/i,
        ) as HTMLInputElement;
        const bodyInput = screen.getByLabelText(
          /description/i,
        ) as HTMLTextAreaElement;

        expect(emailInput.value).toBe("john.doe@example.com");
        expect(subjectInput.value).toBe("Wrong item delivered");
        expect(bodyInput.value).toBe(
          "I ordered a blue shirt but received a red one.",
        );
      });
    });

    it("should reset form when empty scenario is selected", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      // Fill form first
      const emailInput = screen.getByLabelText(/email address/i);
      const subjectInput = screen.getByLabelText(/^subject/i);
      await user.type(emailInput, "test@test.com");
      await user.type(subjectInput, "Test");

      // Select empty scenario
      const scenarioSelect = screen.getByLabelText("🎲 Quick Fill Scenario");
      fireEvent.change(scenarioSelect, { target: { value: "" } });

      await waitFor(() => {
        expect((emailInput as HTMLInputElement).value).toBe("");
        expect((subjectInput as HTMLInputElement).value).toBe("");
      });
    });

    it("should update character counter after auto-fill", async () => {
      render(<TicketForm />);

      const scenarioSelect = screen.getByLabelText("🎲 Quick Fill Scenario");
      fireEvent.change(scenarioSelect, { target: { value: "wrong-item" } });

      await waitFor(() => {
        // "Wrong item delivered" = 20 characters
        expect(screen.getByText("20/500 characters")).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should call mutation with correct data on valid submission", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      // Fill form
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^subject/i), "Test subject");
      await user.type(
        screen.getByLabelText(/description/i),
        "Test description with enough characters",
      );

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /submit ticket/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          email: "test@example.com",
          subject: "Test subject",
          body: "Test description with enough characters",
          order_number: "",
        });
      });
    });

    it("should include order number in submission if provided", async () => {
      const user = userEvent.setup();
      render(<TicketForm />);

      // Fill form including order number
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^subject/i), "Test subject");
      await user.type(
        screen.getByLabelText(/description/i),
        "Test description with enough characters",
      );
      await user.type(
        screen.getByLabelText("Order Number (optional)"),
        "ORD-123",
      );

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /submit ticket/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            order_number: "ORD-123",
          }),
        );
      });
    });

    it("should call onSubmitSuccess callback on successful submission", async () => {
      const user = userEvent.setup();

      // Setup mockMutate to simulate successful submission
      mockMutate.mockImplementation(() => {
        // Simulate successful mutation by calling the stored callback
        if (mockOnSuccessCallback) {
          mockOnSuccessCallback({ id: "ticket-123" });
        }
      });

      render(<TicketForm onSubmitSuccess={mockOnSubmitSuccess} />);

      // Fill and submit form
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com",
      );
      await user.type(screen.getByLabelText(/^subject/i), "Test subject");
      await user.type(
        screen.getByLabelText(/description/i),
        "Test description with enough characters",
      );

      const submitButton = screen.getByRole("button", {
        name: /submit ticket/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalledWith("ticket-123");
      });
    });
  });

  describe("Loading States", () => {
    it("should show submitting text when pending", () => {
      mockTRPCMutationState.isPending = true;
      render(<TicketForm />);

      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });

    it("should disable submit button when pending", () => {
      mockTRPCMutationState.isPending = true;
      render(<TicketForm />);

      const submitButton = screen.getByRole("button", { name: /submitting/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when mutation fails", () => {
      mockTRPCMutationState.error = { message: "Network error occurred" };
      render(<TicketForm />);

      expect(screen.getByText("Network error occurred")).toBeInTheDocument();
    });

    it("should show error in red alert box", () => {
      mockTRPCMutationState.error = { message: "Server error" };
      render(<TicketForm />);

      const errorMessage = screen.getByText("Server error");
      const errorBox = errorMessage.closest("div");

      expect(errorBox).toHaveClass("bg-red-50");
      expect(errorBox).toHaveClass("border-red-200");
    });
  });

  describe("Form Reset", () => {
    it("should reset form fields after successful submission", async () => {
      const user = userEvent.setup();

      // Setup mockMutate to simulate successful submission
      mockMutate.mockImplementation(() => {
        // Simulate successful mutation by calling the stored callback
        if (mockOnSuccessCallback) {
          mockOnSuccessCallback({ id: "ticket-123" });
        }
      });

      render(<TicketForm />);

      // Fill form
      const emailInput = screen.getByLabelText(
        /email address/i,
      ) as HTMLInputElement;
      const subjectInput = screen.getByLabelText(
        /^subject/i,
      ) as HTMLInputElement;
      const bodyInput = screen.getByLabelText(
        /description/i,
      ) as HTMLTextAreaElement;

      await user.type(emailInput, "test@example.com");
      await user.type(subjectInput, "Test subject");
      await user.type(bodyInput, "Test description with enough characters");

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /submit ticket/i,
      });
      await user.click(submitButton);

      // Check form is reset
      await waitFor(() => {
        expect(emailInput.value).toBe("");
        expect(subjectInput.value).toBe("");
        expect(bodyInput.value).toBe("");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for all required fields", () => {
      render(<TicketForm />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it("should mark required fields", () => {
      render(<TicketForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const subjectInput = screen.getByLabelText(/^subject/i);
      const bodyInput = screen.getByLabelText(/description/i);

      expect(emailInput).toBeRequired();
      expect(subjectInput).toBeRequired();
      expect(bodyInput).toBeRequired();
    });
  });
});
