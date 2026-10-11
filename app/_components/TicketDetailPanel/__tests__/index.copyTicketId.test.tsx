import { act, fireEvent, render, screen } from "@testing-library/react";

import { TicketDetailPanel } from "../index";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/lib/trpc/client", () => ({
  trpc: {
    tickets: {
      getById: { useQuery: jest.fn() },
      getAIRecommendations: { useQuery: jest.fn() },
      approve: { useMutation: jest.fn(() => ({ mutate: jest.fn() })) },
      reject: { useMutation: jest.fn(() => ({ mutate: jest.fn() })) },
    },
    useUtils: jest.fn(() => ({
      tickets: { getPendingApproval: { invalidate: jest.fn() } },
    })),
  },
}));

jest.mock("../CustomerInfo", () => ({ CustomerInfo: () => null }));
jest.mock("../TicketMessage", () => ({ TicketMessage: () => null }));
jest.mock("../AIAnalysis", () => ({ AIAnalysis: () => null }));
jest.mock("../SimilarTickets", () => ({ SimilarTickets: () => null }));
jest.mock("../ApproveModal", () => ({ ApproveModal: () => null }));
jest.mock("../RejectModal", () => ({ RejectModal: () => null }));

jest.mock("../ResolutionEditor", () => ({
  ResolutionEditor: ({
    resolutionText,
    onResolutionChange,
  }: {
    resolutionText: string;
    onResolutionChange: (text: string) => void;
  }) => (
    <textarea
      value={resolutionText}
      onChange={(e) => onResolutionChange(e.target.value)}
      data-testid="resolution-textarea"
    />
  ),
}));

jest.mock("../ActionButtons", () => ({
  ActionButtons: ({ isApproveDisabled }: { isApproveDisabled: boolean }) => (
    <button disabled={isApproveDisabled} data-testid="approve-button">
      Approve
    </button>
  ),
}));

const { trpc } = jest.requireMock("@/lib/trpc/client");

const makeTicket = (id: string, ticketNumber: string) => ({
  id,
  ticket_number: ticketNumber,
  subject: "Subject",
  body: "Body",
  priority: "HIGH",
  priority_score: 85,
});

const COPY_NAME = "Copy ticket ID";

describe("TicketDetailPanel copy ticket ID", () => {
  let writeText: jest.Mock;
  const originalClipboard = Object.getOwnPropertyDescriptor(
    window.navigator,
    "clipboard",
  );

  const setClipboard = (value: unknown) =>
    Object.defineProperty(window.navigator, "clipboard", {
      value,
      configurable: true,
      writable: true,
    });

  beforeEach(() => {
    writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    trpc.tickets.getById.useQuery.mockReturnValue({
      data: makeTicket("uuid-1", "TKT-001"),
      isLoading: false,
    });
    trpc.tickets.getAIRecommendations.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(window.navigator, "clipboard", originalClipboard);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window.navigator as any).clipboard;
    }
  });

  const clickCopy = async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
    });
  };

  it("renders no copy button without a ticketId", () => {
    render(<TicketDetailPanel ticketId={null} />);
    expect(
      screen.queryByRole("button", { name: /copy ticket id/i }),
    ).not.toBeInTheDocument();
  });

  it("renders no copy button when the ticket is not found", () => {
    trpc.tickets.getById.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });
    render(<TicketDetailPanel ticketId="uuid-1" />);
    expect(
      screen.queryByRole("button", { name: /copy ticket id/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the skeleton without a copy button while loading", () => {
    trpc.tickets.getById.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    render(<TicketDetailPanel ticketId="uuid-1" />);
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /copy ticket id/i }),
    ).not.toBeInTheDocument();
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies the ticket number, never the UUID", async () => {
    render(<TicketDetailPanel ticketId="uuid-1" />);
    await clickCopy();
    expect(writeText).toHaveBeenCalledWith("TKT-001");
  });

  it("leaves panel state untouched when copy fails", async () => {
    writeText.mockRejectedValue(new DOMException("denied"));
    render(<TicketDetailPanel ticketId="uuid-1" />);
    const textarea = screen.getByTestId("resolution-textarea");
    fireEvent.change(textarea, { target: { value: "My resolution" } });

    await clickCopy();

    expect(screen.getByTestId("resolution-textarea")).toHaveValue(
      "My resolution",
    );
    expect(screen.getByTestId("approve-button")).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Couldn't copy, select the ID manually",
    );
  });

  it("resets feedback and copies the new number when the ticket switches", async () => {
    const { rerender } = render(<TicketDetailPanel ticketId="uuid-1" />);
    await clickCopy();
    expect(screen.getByRole("status")).toHaveTextContent("Ticket ID copied");

    trpc.tickets.getById.useQuery.mockReturnValue({
      data: makeTicket("uuid-2", "TKT-002"),
      isLoading: false,
    });
    rerender(<TicketDetailPanel ticketId="uuid-2" />);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await clickCopy();
    expect(writeText).toHaveBeenLastCalledWith("TKT-002");
  });
});
