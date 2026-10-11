import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TicketHeader } from "../TicketHeader";

const COPY_NAME = "Copy ticket ID";
const FAILURE_TEXT = "Couldn't copy, select the ID manually";

function setClipboard(value: unknown) {
  Object.defineProperty(window.navigator, "clipboard", {
    value,
    configurable: true,
    writable: true,
  });
}

function renderHeader(ticketNumber = "TKT-12345") {
  const ui = (n: string) => (
    <TicketHeader ticketNumber={n} priority="HIGH" priorityScore={75} />
  );
  const result = render(ui(ticketNumber));
  return {
    ...result,
    rerenderWith: (n: string) => result.rerender(ui(n)),
  };
}

const getButton = () => screen.getByRole("button", { name: COPY_NAME });

describe("CopyTicketIdButton", () => {
  let writeText: jest.Mock;
  const originalClipboard = Object.getOwnPropertyDescriptor(
    window.navigator,
    "clipboard",
  );

  beforeEach(() => {
    jest.useFakeTimers();
    writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    if (originalClipboard) {
      Object.defineProperty(window.navigator, "clipboard", originalClipboard);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window.navigator as any).clipboard;
    }
  });

  async function click() {
    await act(async () => {
      fireEvent.click(getButton());
    });
  }

  function advance(ms: number) {
    act(() => {
      jest.advanceTimersByTime(ms);
    });
  }

  it("renders a copy button with an accessible name", () => {
    renderHeader();
    expect(getButton()).toBeInTheDocument();
    expect(getButton()).toHaveAttribute("type", "button");
  });

  it("copies the raw ticket number exactly once", async () => {
    renderHeader();
    await click();

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("TKT-12345");
    const arg = writeText.mock.calls[0][0] as string;
    expect(arg).not.toMatch(/[#\s]/);
  });

  it("shows Copied and announces success, then restores after 2000 ms", async () => {
    renderHeader();
    await click();

    expect(screen.getByText("Copied")).not.toHaveClass("invisible");
    expect(screen.getByRole("status")).toHaveTextContent("Ticket ID copied");
    expect(screen.queryByTestId("toast-container")).not.toBeInTheDocument();

    advance(1999);
    expect(screen.getByRole("status")).toHaveTextContent("Ticket ID copied");
    advance(1);
    expect(screen.getByText("Copied")).toHaveClass("invisible");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("restarts the timer on re-activation without stacking", async () => {
    renderHeader();
    await click();
    advance(1500);
    await click();
    advance(1500);
    expect(screen.getByText("Copied")).not.toHaveClass("invisible");
    advance(500);
    expect(screen.getByText("Copied")).toHaveClass("invisible");
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it("copies the new number after the ticket changes", async () => {
    const { rerenderWith } = renderHeader("TKT-1");
    await click();
    rerenderWith("TKT-2");
    await click();

    expect(writeText).toHaveBeenNthCalledWith(1, "TKT-1");
    expect(writeText).toHaveBeenNthCalledWith(2, "TKT-2");
  });

  it("resets feedback immediately when the ticket changes from Copied", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const { rerenderWith } = renderHeader("TKT-1");
    await click();
    rerenderWith("TKT-2");

    expect(screen.getByText("Copied")).toHaveClass("invisible");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    advance(4000);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("resets feedback immediately when the ticket changes from failure", async () => {
    writeText.mockRejectedValue(new DOMException("denied"));
    const { rerenderWith } = renderHeader("TKT-1");
    await click();
    expect(screen.getByRole("status")).toHaveTextContent(FAILURE_TEXT);
    rerenderWith("TKT-2");

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    advance(4000);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("ignores a late clipboard result for the previous ticket", async () => {
    let resolveWrite: () => void = () => {};
    writeText.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveWrite = resolve;
      }),
    );
    const { rerenderWith } = renderHeader("TKT-1");
    await click();
    rerenderWith("TKT-2");
    await act(async () => {
      resolveWrite();
    });

    expect(screen.getByText("Copied")).toHaveClass("invisible");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("shows failure feedback without throwing when the Clipboard API is missing", async () => {
    setClipboard(undefined);
    const execCommand = jest.fn();
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
      writable: true,
    });
    renderHeader();
    await click();

    expect(execCommand).not.toHaveBeenCalled();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(FAILURE_TEXT);
    expect(status).not.toHaveClass("sr-only");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "TKT-12345",
    );

    advance(3999);
    expect(status).toHaveTextContent(FAILURE_TEXT);
    advance(1);
    expect(status).toBeEmptyDOMElement();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (document as any).execCommand;
  });

  it("shows failure feedback and never Copied when writeText rejects", async () => {
    writeText.mockRejectedValue(new DOMException("denied"));
    renderHeader();
    await click();

    expect(screen.getByRole("status")).toHaveTextContent(FAILURE_TEXT);
    expect(screen.getByText("Copied")).toHaveClass("invisible");
    expect(screen.getByRole("status")).not.toHaveTextContent(
      "Ticket ID copied",
    );
  });

  it("keeps the accessible name in every state", async () => {
    renderHeader();
    expect(getButton()).toBeInTheDocument();
    await click();
    expect(getButton()).toBeInTheDocument();
    writeText.mockRejectedValue(new Error("no"));
    await click();
    expect(screen.getByRole("status")).toHaveTextContent(FAILURE_TEXT);
    expect(getButton()).toBeInTheDocument();
  });

  describe("keyboard", () => {
    function setup() {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      // user-event replaces the clipboard; mock after setup
      writeText = jest.fn().mockResolvedValue(undefined);
      setClipboard({ writeText });
      return user;
    }

    it.each([
      ["{Enter}", "Enter"],
      [" ", "Space"],
    ])("copies on %s (%s) and keeps focus", async (key) => {
      const user = setup();
      renderHeader();
      await user.tab();
      expect(getButton()).toHaveFocus();
      await user.keyboard(key);

      expect(writeText).toHaveBeenCalledWith("TKT-12345");
      expect(document.activeElement).toBe(getButton());
    });

    it("keeps focus after a failed copy", async () => {
      const user = setup();
      writeText.mockRejectedValue(new Error("denied"));
      renderHeader();
      await user.tab();
      await user.keyboard("{Enter}");
      await act(async () => {});

      expect(screen.getByRole("status")).toHaveTextContent(FAILURE_TEXT);
      expect(document.activeElement).toBe(getButton());
    });

    it("makes the copy button the first tab stop", async () => {
      const user = setup();
      renderHeader();
      await user.tab();
      expect(getButton()).toHaveFocus();
    });
  });

  it("orders h1, button, badge in the DOM", () => {
    renderHeader();
    const h1 = screen.getByRole("heading", { level: 1 });
    const badge = screen.getByText("Pending Approval");
    expect(
      h1.compareDocumentPosition(getButton()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      getButton().compareDocumentPosition(badge) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("does not warn when unmounted while the timer is pending", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const { unmount } = renderHeader();
    await click();
    unmount();
    advance(5000);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
