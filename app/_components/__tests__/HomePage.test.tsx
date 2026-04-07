import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { HomePage } from "../HomePage";

// Mock next/navigation
const mockReplace = jest.fn();
const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock useToast
const mockShowToast = jest.fn();
jest.mock("@/lib/contexts", () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock QUERY_PARAMS
jest.mock("@/lib/types/common", () => ({
  QUERY_PARAMS: {
    APPROVED: "approved",
    REJECTED: "rejected",
  },
}));

// Mock TicketForm
jest.mock("../TicketForm", () => ({
  TicketForm: ({
    onSubmitSuccess,
  }: {
    onSubmitSuccess: (id: string) => void;
  }) => (
    <div data-testid="ticket-form">
      <button
        data-testid="submit-form-btn"
        onClick={() => onSubmitSuccess("form-ticket-123")}
      >
        Submit Form
      </button>
    </div>
  ),
}));

// Mock TicketStream
jest.mock("../TicketStream", () => ({
  TicketStream: ({
    ticketId,
    onReset,
  }: {
    ticketId: string | null;
    onReset?: () => void;
  }) => {
    return (
      <div data-testid="ticket-stream">
        <div data-testid="stream-ticket-id">{ticketId || "No ticket"}</div>
        {onReset && (
          <button data-testid="reset-btn" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
    );
  },
}));

describe("HomePage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  describe("Initial Render", () => {
    it("renders without crashing", () => {
      render(<HomePage />);

      expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
      expect(screen.getByTestId("ticket-stream")).toBeInTheDocument();
    });

    it("renders with no ticket initially", () => {
      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "No ticket",
      );
    });

    it("renders both ticket form and stream", () => {
      render(<HomePage />);

      expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
      expect(screen.getByTestId("ticket-stream")).toBeInTheDocument();
    });

    it("renders page layout", () => {
      const { container } = render(<HomePage />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("does not show toast on initial render", () => {
      render(<HomePage />);

      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    it("updates ticket ID when form is submitted", () => {
      render(<HomePage />);

      const submitButton = screen.getByTestId("submit-form-btn");
      fireEvent.click(submitButton);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );
    });

    it("TicketStream receives ticket ID from form", () => {
      render(<HomePage />);

      const submitButton = screen.getByTestId("submit-form-btn");
      fireEvent.click(submitButton);

      const streamTicketId = screen.getByTestId("stream-ticket-id");
      expect(streamTicketId).toHaveTextContent("form-ticket-123");
    });
  });

  describe("URL Parameters - Approved Ticket", () => {
    it("shows approved ticket from URL", () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "url-ticket-456";
        return null;
      });

      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "url-ticket-456",
      );
    });

    it("shows success toast for approved ticket", async () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "approved-ticket-789";
        return null;
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          message: "✅ Ticket Approved!",
          description: "Processing workflow completion...",
          variant: "success",
          duration: 3000,
        });
      });
    });

    it("shows toast only once for same approved ticket", async () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "same-ticket";
        return null;
      });

      const { rerender } = render(<HomePage />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledTimes(1);
      });

      // Re-render with same params
      rerender(<HomePage />);

      // Should still be called only once
      expect(mockShowToast).toHaveBeenCalledTimes(1);
    });
  });

  describe("URL Parameters - Rejected Ticket", () => {
    it("shows rejected ticket from URL", () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "rejected") return "rejected-ticket-999";
        return null;
      });

      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "rejected-ticket-999",
      );
    });

    it("shows warning toast for rejected ticket", async () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "rejected") return "rejected-ticket-123";
        return null;
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          message: "❌ Ticket Rejected",
          description: "Ticket has been rejected and closed.",
          variant: "warning",
          duration: 3000,
        });
      });
    });

    it("shows toast only once for same rejected ticket", async () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "rejected") return "same-rejected-ticket";
        return null;
      });

      const { rerender } = render(<HomePage />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledTimes(1);
      });

      // Re-render
      rerender(<HomePage />);

      // Should still be called only once
      expect(mockShowToast).toHaveBeenCalledTimes(1);
    });
  });

  describe("Reset Functionality", () => {
    it("clears form ticket ID when reset is called", () => {
      render(<HomePage />);

      // Submit form
      const submitButton = screen.getByTestId("submit-form-btn");
      fireEvent.click(submitButton);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );

      // Reset
      const resetButton = screen.getByTestId("reset-btn");
      fireEvent.click(resetButton);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "No ticket",
      );
    });

    it("calls router.replace to clear URL params", () => {
      render(<HomePage />);

      const resetButton = screen.getByTestId("reset-btn");
      fireEvent.click(resetButton);

      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  describe("Priority: URL vs Form", () => {
    it("URL ticket takes precedence over form ticket", () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "url-ticket-priority";
        return null;
      });

      render(<HomePage />);

      // Submit form
      const submitButton = screen.getByTestId("submit-form-btn");
      fireEvent.click(submitButton);

      // URL ticket should be shown, not form ticket
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "url-ticket-priority",
      );
    });

    it("shows form ticket when no URL params", () => {
      mockGet.mockReturnValue(null);

      render(<HomePage />);

      const submitButton = screen.getByTestId("submit-form-btn");
      fireEvent.click(submitButton);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );
    });
  });

  describe("Toast Deduplication", () => {
    it("does not show toast when ticketIdFromUrl is null", () => {
      mockGet.mockReturnValue(null);

      render(<HomePage />);

      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("tracks processed IDs to prevent duplicate toasts", async () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "duplicate-test";
        return null;
      });

      const { rerender } = render(<HomePage />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledTimes(1);
      });

      // Multiple rerenders should not trigger more toasts
      rerender(<HomePage />);
      rerender(<HomePage />);
      rerender(<HomePage />);

      expect(mockShowToast).toHaveBeenCalledTimes(1);
    });
  });

  describe("Component Integration", () => {
    it("TicketForm and TicketStream are properly connected", () => {
      render(<HomePage />);

      // Initially no ticket
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "No ticket",
      );

      // Submit form
      const submitButton = screen.getByTestId("submit-form-btn");
      fireEvent.click(submitButton);

      // Stream receives ticket ID
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );

      // Reset
      const resetButton = screen.getByTestId("reset-btn");
      fireEvent.click(resetButton);

      // Back to no ticket
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "No ticket",
      );
    });

    it("renders both components in correct layout", () => {
      render(<HomePage />);

      const form = screen.getByTestId("ticket-form");
      const stream = screen.getByTestId("ticket-stream");

      expect(form).toBeInTheDocument();
      expect(stream).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles approved and rejected params simultaneously (approved wins)", async () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "approved-wins";
        if (param === "rejected") return "rejected-loses";
        return null;
      });

      render(<HomePage />);

      // Approved should be shown
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "approved-wins",
      );

      // Approved toast should be shown
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "✅ Ticket Approved!",
          }),
        );
      });
    });

    it("handles empty ticket ID from URL", () => {
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "";
        return null;
      });

      render(<HomePage />);

      // Empty string is falsy, should show "No ticket"
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "No ticket",
      );
    });

    it("handles multiple form submissions", () => {
      render(<HomePage />);

      const submitButton = screen.getByTestId("submit-form-btn");

      fireEvent.click(submitButton);
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );

      // Reset
      screen.getByTestId("reset-btn").click();

      // Submit again
      fireEvent.click(submitButton);
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );
    });

    it("handles switching from form ticket to URL ticket", () => {
      mockGet.mockReturnValue(null);

      const { rerender } = render(<HomePage />);

      // Submit form
      const submitButton = screen.getByTestId("submit-form-btn");
      fireEvent.click(submitButton);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );

      // Change mock to return URL param
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "url-override";
        return null;
      });

      rerender(<HomePage />);

      // URL should override form
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "url-override",
      );
    });
  });

  describe("Layout and Styling", () => {
    it("renders both form and stream sections", () => {
      render(<HomePage />);

      expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
      expect(screen.getByTestId("ticket-stream")).toBeInTheDocument();
    });
  });

  describe("UseEffect Dependencies", () => {
    it("does not trigger toast when only form ticket changes", () => {
      mockGet.mockReturnValue(null);

      render(<HomePage />);

      expect(mockShowToast).not.toHaveBeenCalled();

      // Submit form
      const submitButton = screen.getByTestId("submit-form-btn");
      fireEvent.click(submitButton);

      // Still no toast
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("triggers toast when URL param changes", async () => {
      mockGet.mockReturnValue(null);

      const { rerender } = render(<HomePage />);

      expect(mockShowToast).not.toHaveBeenCalled();

      // Change to approved
      mockGet.mockImplementation((param: string) => {
        if (param === "approved") return "new-approved";
        return null;
      });

      rerender(<HomePage />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledTimes(1);
      });
    });
  });
});
