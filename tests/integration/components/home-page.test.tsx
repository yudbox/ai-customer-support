/**
 * Integration tests for HomePage component
 *
 * Тестирует главную страницу с layout, формой и stream,
 * обработку URL параметров (approved/rejected), toast уведомления.
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { HomePage } from "@/app/_components/HomePage";
import { QUERY_PARAMS } from "@/lib/types/common";

// Mock next/navigation
const mockReplace = jest.fn();
const mockSearchParams = {
  get: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock useToast
const mockShowToast = jest.fn();

jest.mock("@/lib/contexts", () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock TicketForm
jest.mock("@/app/_components/TicketForm", () => ({
  TicketForm: ({
    onSubmitSuccess,
  }: {
    onSubmitSuccess: (id: string) => void;
  }) => (
    <div data-testid="ticket-form">
      <button onClick={() => onSubmitSuccess("form-ticket-123")}>
        Submit Form
      </button>
    </div>
  ),
}));

// Mock TicketStream
jest.mock("@/app/_components/TicketStream", () => ({
  TicketStream: ({
    ticketId,
    onReset,
  }: {
    ticketId: string | null;
    onReset?: () => void;
  }) => (
    <div data-testid="ticket-stream">
      <div data-testid="stream-ticket-id">{ticketId || "null"}</div>
      {onReset && (
        <button data-testid="stream-reset" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  ),
}));

describe("HomePage Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.get.mockReturnValue(null);
  });

  describe("Initial Rendering", () => {
    it("should render HomePage component", () => {
      render(<HomePage />);

      expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
      expect(screen.getByTestId("ticket-stream")).toBeInTheDocument();
    });

    it("should render TicketForm component", () => {
      render(<HomePage />);

      expect(screen.getByTestId("ticket-form")).toBeInTheDocument();
    });

    it("should render TicketStream component", () => {
      render(<HomePage />);

      expect(screen.getByTestId("ticket-stream")).toBeInTheDocument();
    });

    it("should render with null ticketId initially", () => {
      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent("null");
    });
  });

  describe("Form Submission", () => {
    it("should update ticketId when form is submitted", () => {
      render(<HomePage />);

      const submitButton = screen.getByText("Submit Form");
      fireEvent.click(submitButton);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );
    });

    it("should pass ticketId to TicketStream after form submission", () => {
      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent("null");

      fireEvent.click(screen.getByText("Submit Form"));

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );
    });
  });

  describe("URL Parameters - Approved Ticket", () => {
    it("should get ticketId from approved query param", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.APPROVED ? "approved-ticket-456" : null,
      );

      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "approved-ticket-456",
      );
    });

    it("should show success toast for approved ticket", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.APPROVED ? "approved-ticket-789" : null,
      );

      render(<HomePage />);

      expect(mockShowToast).toHaveBeenCalledWith({
        message: "✅ Ticket Approved!",
        description: "Processing workflow completion...",
        variant: "success",
        duration: 3000,
      });
    });

    it("should call showToast only once for the same approved ticket", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.APPROVED ? "same-ticket-101" : null,
      );

      const { rerender } = render(<HomePage />);

      expect(mockShowToast).toHaveBeenCalledTimes(1);

      rerender(<HomePage />);

      // Should still be 1, not 2
      expect(mockShowToast).toHaveBeenCalledTimes(1);
    });
  });

  describe("URL Parameters - Rejected Ticket", () => {
    it("should get ticketId from rejected query param", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.REJECTED ? "rejected-ticket-999" : null,
      );

      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "rejected-ticket-999",
      );
    });

    it("should show warning toast for rejected ticket", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.REJECTED ? "rejected-ticket-888" : null,
      );

      render(<HomePage />);

      expect(mockShowToast).toHaveBeenCalledWith({
        message: "❌ Ticket Rejected",
        description: "Ticket has been rejected and closed.",
        variant: "warning",
        duration: 3000,
      });
    });

    it("should call showToast only once for the same rejected ticket", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.REJECTED ? "same-rejected-202" : null,
      );

      const { rerender } = render(<HomePage />);

      expect(mockShowToast).toHaveBeenCalledTimes(1);

      rerender(<HomePage />);

      // Should still be 1, not 2
      expect(mockShowToast).toHaveBeenCalledTimes(1);
    });
  });

  describe("Ticket ID Priority", () => {
    it("should prioritize URL ticketId over form ticketId", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.APPROVED ? "url-ticket-priority" : null,
      );

      render(<HomePage />);

      // First submit form
      fireEvent.click(screen.getByText("Submit Form"));

      // URL ticketId should take precedence
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "url-ticket-priority",
      );
    });

    it("should use form ticketId when no URL params", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<HomePage />);

      fireEvent.click(screen.getByText("Submit Form"));

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );
    });

    it("should prefer approved over rejected when both present", () => {
      mockSearchParams.get.mockImplementation((param: string) => {
        if (param === QUERY_PARAMS.APPROVED) return "approved-wins";
        if (param === QUERY_PARAMS.REJECTED) return "rejected-loses";
        return null;
      });

      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "approved-wins",
      );
    });
  });

  describe("Reset Functionality", () => {
    it("should clear form ticketId on reset", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<HomePage />);

      // Submit form
      fireEvent.click(screen.getByText("Submit Form"));
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );

      // Reset
      fireEvent.click(screen.getByTestId("stream-reset"));
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent("null");
    });

    it("should call router.replace to clear URL params", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<HomePage />);

      fireEvent.click(screen.getByText("Submit Form"));
      fireEvent.click(screen.getByTestId("stream-reset"));

      expect(mockReplace).toHaveBeenCalledWith("/");
    });

    it("should pass onReset handler to TicketStream", () => {
      render(<HomePage />);

      expect(screen.getByTestId("stream-reset")).toBeInTheDocument();
    });
  });

  describe("Toast Notifications", () => {
    it("should not show toast when no URL params", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<HomePage />);

      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("should show toast with correct message for approved", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.APPROVED ? "test-approved" : null,
      );

      render(<HomePage />);

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "✅ Ticket Approved!",
          variant: "success",
        }),
      );
    });

    it("should show toast with correct message for rejected", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.REJECTED ? "test-rejected" : null,
      );

      render(<HomePage />);

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "❌ Ticket Rejected",
          variant: "warning",
        }),
      );
    });

    it("should set correct duration for toast", () => {
      mockSearchParams.get.mockImplementation((param: string) =>
        param === QUERY_PARAMS.APPROVED ? "duration-test" : null,
      );

      render(<HomePage />);

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 3000,
        }),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty query params gracefully", () => {
      mockSearchParams.get.mockReturnValue("");

      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent("null");
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("should handle multiple resets", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<HomePage />);

      const resetButton = screen.getByTestId("stream-reset");

      fireEvent.click(resetButton);
      fireEvent.click(resetButton);
      fireEvent.click(resetButton);

      expect(mockReplace).toHaveBeenCalledTimes(3);
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent("null");
    });

    it("should handle form submission after reset", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<HomePage />);

      // Submit
      fireEvent.click(screen.getByText("Submit Form"));
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );

      // Reset
      fireEvent.click(screen.getByTestId("stream-reset"));
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent("null");

      // Submit again
      fireEvent.click(screen.getByText("Submit Form"));
      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );
    });

    it("should render without crashing when components are missing", () => {
      expect(() => render(<HomePage />)).not.toThrow();
    });
  });

  describe("Component Integration", () => {
    it("should pass onSubmitSuccess to TicketForm", () => {
      render(<HomePage />);

      const submitButton = screen.getByText("Submit Form");

      expect(submitButton).toBeInTheDocument();
    });

    it("should pass ticketId and onReset to TicketStream", () => {
      render(<HomePage />);

      expect(screen.getByTestId("ticket-stream")).toBeInTheDocument();
      expect(screen.getByTestId("stream-ticket-id")).toBeInTheDocument();
      expect(screen.getByTestId("stream-reset")).toBeInTheDocument();
    });

    it("should update TicketStream when form submits", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<HomePage />);

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent("null");

      fireEvent.click(screen.getByText("Submit Form"));

      expect(screen.getByTestId("stream-ticket-id")).toHaveTextContent(
        "form-ticket-123",
      );
    });
  });
});
