import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { TicketForm } from "../TicketForm";

// Mock tRPC
const mockMutate = jest.fn();
const mockReset = jest.fn();

jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    tickets: {
      create: {
        useMutation: jest.fn(() => ({
          mutate: mockMutate,
          isPending: false,
          error: null,
        })),
      },
    },
  },
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    type,
    ...props
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    type?: string;
  }) => (
    <button type={type as "button" | "submit"} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    label,
    error,
    ...props
  }: React.ComponentPropsWithoutRef<"input"> & {
    label?: string;
    error?: string;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input {...props} />
      {error && <span data-testid="input-error">{error}</span>}
    </div>
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    label,
    error,
    currentLength,
    showCharCount,
    ...props
  }: React.ComponentPropsWithoutRef<"textarea"> & {
    label?: string;
    error?: string;
    currentLength?: number;
    showCharCount?: boolean;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <textarea {...props} />
      {showCharCount && <div>{currentLength}/5000</div>}
      {error && <span data-testid="textarea-error">{error}</span>}
    </div>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    label,
    options,
    onChange,
    value,
  }: {
    label: string;
    options: Array<{ value: string; label: string }>;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    value: string;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <select onChange={onChange} value={value} data-testid="scenario-select">
        <option value="">Select a scenario...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock ticket scenarios
jest.mock("@/lib/constants/ticket-scenarios", () => ({
  getScenarioOptions: jest.fn(() => [
    { value: "scenario-1", label: "Scenario 1" },
    { value: "scenario-2", label: "Scenario 2" },
  ]),
  getScenarioById: jest.fn((id: string) => {
    if (id === "scenario-1") {
      return {
        email: "test@example.com",
        subject: "Test Subject",
        body: "Test Body",
      };
    }
    return null;
  }),
}));

// Mock react-hook-form
const mockSetValue = jest.fn();
const mockWatch = jest.fn(() => "");
const mockRegister = jest.fn((name) => ({
  name,
  onChange: jest.fn(),
  onBlur: jest.fn(),
  ref: jest.fn(),
}));
const mockHandleSubmit = jest.fn(
  (onSubmit) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      email: "test@example.com",
      subject: "Test subject",
      body: "Test body",
    });
  },
);

jest.mock("react-hook-form", () => {
  const actual = jest.requireActual("react-hook-form");
  return {
    ...actual,
    useForm: jest.fn(() => ({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: { errors: {} },
      reset: mockReset,
      setValue: mockSetValue,
      watch: mockWatch,
    })),
  };
});

describe("TicketForm Component", () => {
  const mockOnSubmitSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("renders without crashing", () => {
      render(<TicketForm />);

      expect(screen.getByText("Submit a Support Ticket")).toBeInTheDocument();
    });

    it("renders form labels", () => {
      render(<TicketForm />);

      expect(screen.getByText("Email Address")).toBeInTheDocument();
      expect(screen.getByText("Subject")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Order Number (optional)")).toBeInTheDocument();
    });

    it("renders submit button", () => {
      render(<TicketForm />);

      expect(
        screen.getByRole("button", { name: /Submit Ticket/i }),
      ).toBeInTheDocument();
    });

    it("renders scenario dropdown label", () => {
      render(<TicketForm />);

      expect(screen.getByText(/Quick Fill Scenario/)).toBeInTheDocument();
    });

    it("shows AI support message", () => {
      render(<TicketForm />);

      expect(screen.getByText(/AI-powered support system/)).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("calls mutate when form is submitted", async () => {
      render(<TicketForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const form = screen
        .getByRole("button", { name: /Submit Ticket/i })
        .closest("form");

      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("renders form element", () => {
      render(<TicketForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const submitButton = screen.getByRole("button", {
        name: /Submit Ticket/i,
      });
      const form = submitButton.closest("form");

      expect(form).toBeInTheDocument();
    });

    it("handles successful submission with callback", async () => {
      const { trpc } = jest.requireMock("@/lib/trpc/client");
      const mockUseMutation = trpc.tickets.create.useMutation as jest.Mock;

      // Mock mutation with onSuccess handler
      let onSuccessCallback: ((data: { id: string }) => void) | undefined;
      mockUseMutation.mockImplementation((config) => {
        onSuccessCallback = config.onSuccess;
        return {
          mutate: jest.fn(() => {
            // Simulate mutation success
            if (onSuccessCallback) {
              onSuccessCallback({ id: "new-ticket-123" });
            }
          }),
          isPending: false,
          error: null,
        };
      });

      render(<TicketForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const form = screen
        .getByRole("button", { name: /Submit Ticket/i })
        .closest("form");

      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalledWith("new-ticket-123");
        expect(mockReset).toHaveBeenCalled();
      });
    });

    it("handles successful submission without callback", async () => {
      const { trpc } = jest.requireMock("@/lib/trpc/client");
      const mockUseMutation = trpc.tickets.create.useMutation as jest.Mock;

      // Mock mutation with onSuccess handler
      let onSuccessCallback: ((data: { id: string }) => void) | undefined;
      mockUseMutation.mockImplementation((config) => {
        onSuccessCallback = config.onSuccess;
        return {
          mutate: jest.fn(() => {
            // Simulate mutation success
            if (onSuccessCallback) {
              onSuccessCallback({ id: "new-ticket-456" });
            }
          }),
          isPending: false,
          error: null,
        };
      });

      render(<TicketForm />);

      const form = screen
        .getByRole("button", { name: /Submit Ticket/i })
        .closest("form");

      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalled();
      });
    });
  });

  describe("Quick Fill Scenario", () => {
    it("renders scenario dropdown with options", () => {
      render(<TicketForm />);

      const select = screen.getByTestId("scenario-select");

      expect(select).toBeInTheDocument();
      expect(screen.getByText("Scenario 1")).toBeInTheDocument();
      expect(screen.getByText("Scenario 2")).toBeInTheDocument();
    });

    it("fills form fields when scenario is selected", () => {
      const { getScenarioById } = jest.requireMock(
        "@/lib/constants/ticket-scenarios",
      );

      render(<TicketForm />);

      const select = screen.getByTestId("scenario-select");
      fireEvent.change(select, { target: { value: "scenario-1" } });

      expect(getScenarioById).toHaveBeenCalledWith("scenario-1");
      expect(mockSetValue).toHaveBeenCalledWith("email", "test@example.com");
      expect(mockSetValue).toHaveBeenCalledWith("subject", "Test Subject");
      expect(mockSetValue).toHaveBeenCalledWith("body", "Test Body");
    });

    it("resets form when empty scenario is selected", () => {
      render(<TicketForm />);

      const select = screen.getByTestId("scenario-select");
      fireEvent.change(select, { target: { value: "" } });

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe("Character Counters", () => {
    it("shows subject character counter", () => {
      render(<TicketForm />);

      expect(screen.getByText("0/500 characters")).toBeInTheDocument();
    });

    it("shows body character counter", () => {
      render(<TicketForm />);

      expect(screen.getByText("0/5000")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading state when submitting", () => {
      const { trpc } = jest.requireMock("@/lib/trpc/client");
      const mockUseMutation = trpc.tickets.create.useMutation as jest.Mock;

      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        error: null,
      });

      render(<TicketForm />);

      expect(
        screen.getByRole("button", { name: /Submitting/i }),
      ).toBeInTheDocument();
    });

    it("disables submit button when pending", () => {
      const { trpc } = jest.requireMock("@/lib/trpc/client");
      const mockUseMutation = trpc.tickets.create.useMutation as jest.Mock;

      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        error: null,
      });

      render(<TicketForm />);

      const submitButton = screen.getByRole("button", {
        name: /Submitting/i,
      });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("displays error message when mutation fails", () => {
      const { trpc } = jest.requireMock("@/lib/trpc/client");
      const mockUseMutation = trpc.tickets.create.useMutation as jest.Mock;

      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        error: { message: "Failed to create ticket" },
      });

      render(<TicketForm />);

      expect(screen.getByText("Failed to create ticket")).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("renders without onSubmitSuccess callback", () => {
      render(<TicketForm />);

      expect(screen.getByText("Submit a Support Ticket")).toBeInTheDocument();
    });

    it("renders with onSubmitSuccess callback", () => {
      render(<TicketForm onSubmitSuccess={mockOnSubmitSuccess} />);

      expect(screen.getByText("Submit a Support Ticket")).toBeInTheDocument();
    });
  });

  describe("Form Labels and Placeholders", () => {
    it("shows correct placeholders", () => {
      render(<TicketForm />);

      expect(
        screen.getByPlaceholderText("your.email@example.com"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Brief description of your issue"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Please provide detailed information/),
      ).toBeInTheDocument();
    });
  });

  describe("Field Constraints", () => {
    it("renders subject field", () => {
      render(<TicketForm />);

      expect(screen.getByText("Subject")).toBeInTheDocument();
    });

    it("renders body field", () => {
      render(<TicketForm />);

      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });
});
