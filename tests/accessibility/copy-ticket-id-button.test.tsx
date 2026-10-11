/**
 * Accessibility Tests - Copy ticket ID button (inside TicketHeader)
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

import { TicketHeader } from "@/app/_components/TicketDetailPanel/TicketHeader";

expect.extend(toHaveNoViolations);

const COPY_NAME = "Copy ticket ID";

function setClipboard(value: unknown) {
  Object.defineProperty(window.navigator, "clipboard", {
    value,
    configurable: true,
    writable: true,
  });
}

function renderHeader() {
  return render(
    <TicketHeader
      ticketNumber="TKT-12345"
      priority="HIGH"
      priorityScore={75}
    />,
  );
}

describe("Copy ticket ID button - Accessibility", () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(
    window.navigator,
    "clipboard",
  );

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(window.navigator, "clipboard", originalClipboard);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window.navigator as any).clipboard;
    }
  });

  it("has no violations in the default state", async () => {
    const { container } = renderHeader();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations in the Copied state and keeps its name", async () => {
    const user = userEvent.setup();
    setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });
    const { container } = renderHeader();

    await user.click(screen.getByRole("button", { name: COPY_NAME }));

    expect(screen.getByRole("status")).toHaveTextContent("Ticket ID copied");
    expect(screen.getByRole("button", { name: COPY_NAME })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations when writeText rejects", async () => {
    const user = userEvent.setup();
    setClipboard({
      writeText: jest.fn().mockRejectedValue(new DOMException("denied")),
    });
    const { container } = renderHeader();

    await user.click(screen.getByRole("button", { name: COPY_NAME }));

    expect(screen.getByRole("status")).toHaveTextContent(/couldn't copy/i);
    expect(screen.getByRole("button", { name: COPY_NAME })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations when the Clipboard API is missing", async () => {
    const user = userEvent.setup();
    setClipboard(undefined);
    const { container } = renderHeader();

    await user.click(screen.getByRole("button", { name: COPY_NAME }));

    expect(screen.getByRole("status")).toHaveTextContent(/couldn't copy/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("is reachable by Tab and has focus ring and target size classes", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.tab();

    const button = screen.getByRole("button", { name: COPY_NAME });
    expect(button).toHaveFocus();
    expect(button).toHaveClass("focus:ring-2");
    expect(button).toHaveClass("py-1.5");
  });

  it("resets to the default state when the ticket changes", async () => {
    const user = userEvent.setup();
    setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });
    const { rerender, container } = renderHeader();

    await user.click(screen.getByRole("button", { name: COPY_NAME }));
    await act(async () => {
      rerender(
        <TicketHeader
          ticketNumber="TKT-99999"
          priority="HIGH"
          priorityScore={75}
        />,
      );
    });

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("restarts the timer on repeat activation, expires, and cleans up on unmount", async () => {
    jest.useFakeTimers();
    try {
      setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });
      const { unmount } = renderHeader();

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
      });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
      });
      expect(screen.getByRole("status")).toHaveTextContent("Ticket ID copied");

      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(screen.getByRole("status")).toBeEmptyDOMElement();

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
      });
      unmount();
      act(() => {
        jest.advanceTimersByTime(5000);
      });
    } finally {
      jest.useRealTimers();
    }
  });
});
