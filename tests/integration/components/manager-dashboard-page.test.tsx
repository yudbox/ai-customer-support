/**
 * Integration tests for ManagerDashboardPage component
 *
 * Тестирует взаимодействие ManagerDashboardPage с ManagerSidebar, TicketDetailPanel,
 * управление состоянием выбранного тикета и мобильным sidebar.
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { ManagerDashboardPage } from "@/app/_components/ManagerDashboardPage";

// Mock child components
jest.mock("@/app/_components/ManagerSidebar", () => ({
  ManagerSidebar: ({
    selectedTicketId,
    onSelectTicket,
  }: {
    selectedTicketId: string | null;
    onSelectTicket: (id: string | null) => void;
  }) => (
    <div data-testid="manager-sidebar">
      <button onClick={() => onSelectTicket("ticket-123")}>
        Select Ticket 123
      </button>
      <button onClick={() => onSelectTicket("ticket-456")}>
        Select Ticket 456
      </button>
      <button onClick={() => onSelectTicket(null)}>Clear Selection</button>
      {selectedTicketId && (
        <div data-testid="selected-ticket-id">{selectedTicketId}</div>
      )}
    </div>
  ),
}));

jest.mock("@/app/_components/TicketDetailPanel", () => ({
  TicketDetailPanel: ({ ticketId }: { ticketId: string | null }) => (
    <div data-testid="ticket-detail-panel">
      {ticketId ? (
        <div data-testid="detail-panel-ticket-id">{ticketId}</div>
      ) : (
        <div data-testid="no-ticket-selected">No ticket selected</div>
      )}
    </div>
  ),
}));

jest.mock("@/components/ui", () => ({
  Sidebar: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="mobile-sidebar" data-open={isOpen}>
      {isOpen && (
        <>
          <button onClick={onClose} data-testid="close-mobile-sidebar">
            Close
          </button>
          {children}
        </>
      )}
    </div>
  ),
  SidebarToggle: ({
    onClick,
    "aria-label": ariaLabel,
  }: {
    onClick: () => void;
    side: string;
    "aria-label": string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid="sidebar-toggle"
    >
      Toggle Sidebar
    </button>
  ),
}));

describe("ManagerDashboardPage Integration Tests", () => {
  describe("Initial Render", () => {
    it("should render desktop sidebar", () => {
      render(<ManagerDashboardPage />);

      const sidebars = screen.getAllByTestId("manager-sidebar");
      expect(sidebars.length).toBeGreaterThanOrEqual(1);
    });

    it("should render ticket detail panel", () => {
      render(<ManagerDashboardPage />);

      const detailPanel = screen.getByTestId("ticket-detail-panel");
      expect(detailPanel).toBeInTheDocument();
    });

    it("should render sidebar toggle button", () => {
      render(<ManagerDashboardPage />);

      const toggleButton = screen.getByTestId("sidebar-toggle");
      expect(toggleButton).toBeInTheDocument();
    });

    it("should show no ticket selected initially", () => {
      render(<ManagerDashboardPage />);

      const noTicketMessage = screen.getByTestId("no-ticket-selected");
      expect(noTicketMessage).toBeInTheDocument();
    });

    it("should have mobile sidebar closed initially", () => {
      render(<ManagerDashboardPage />);

      const mobileSidebar = screen.getByTestId("mobile-sidebar");
      expect(mobileSidebar.getAttribute("data-open")).toBe("false");
    });
  });

  describe("Desktop - Ticket Selection", () => {
    it("should select ticket and display in detail panel", () => {
      render(<ManagerDashboardPage />);

      const selectButton = screen.getAllByText("Select Ticket 123")[0];
      fireEvent.click(selectButton);

      const detailPanelTicketId = screen.getByTestId("detail-panel-ticket-id");
      expect(detailPanelTicketId).toHaveTextContent("ticket-123");
    });

    it("should update selected ticket when different ticket is clicked", () => {
      render(<ManagerDashboardPage />);

      // Select first ticket
      const selectButton123 = screen.getAllByText("Select Ticket 123")[0];
      fireEvent.click(selectButton123);

      expect(screen.getByTestId("detail-panel-ticket-id")).toHaveTextContent(
        "ticket-123",
      );

      // Select second ticket
      const selectButton456 = screen.getAllByText("Select Ticket 456")[0];
      fireEvent.click(selectButton456);

      expect(screen.getByTestId("detail-panel-ticket-id")).toHaveTextContent(
        "ticket-456",
      );
    });

    it("should clear selection when clear button is clicked", () => {
      render(<ManagerDashboardPage />);

      // Select a ticket
      const selectButton = screen.getAllByText("Select Ticket 123")[0];
      fireEvent.click(selectButton);

      expect(screen.getByTestId("detail-panel-ticket-id")).toBeInTheDocument();

      // Clear selection
      const clearButton = screen.getAllByText("Clear Selection")[0];
      fireEvent.click(clearButton);

      expect(screen.getByTestId("no-ticket-selected")).toBeInTheDocument();
    });
  });

  describe("Mobile - Sidebar Interaction", () => {
    it("should open mobile sidebar when toggle button is clicked", () => {
      render(<ManagerDashboardPage />);

      const toggleButton = screen.getByTestId("sidebar-toggle");
      fireEvent.click(toggleButton);

      const mobileSidebar = screen.getByTestId("mobile-sidebar");
      expect(mobileSidebar.getAttribute("data-open")).toBe("true");
    });

    it("should close mobile sidebar when close button is clicked", () => {
      render(<ManagerDashboardPage />);

      // Open sidebar
      const toggleButton = screen.getByTestId("sidebar-toggle");
      fireEvent.click(toggleButton);

      // Close sidebar
      const closeButton = screen.getByTestId("close-mobile-sidebar");
      fireEvent.click(closeButton);

      const mobileSidebar = screen.getByTestId("mobile-sidebar");
      expect(mobileSidebar.getAttribute("data-open")).toBe("false");
    });

    it("should close mobile sidebar automatically when ticket is selected", () => {
      render(<ManagerDashboardPage />);

      // Open mobile sidebar
      const toggleButton = screen.getByTestId("sidebar-toggle");
      fireEvent.click(toggleButton);

      const mobileSidebar = screen.getByTestId("mobile-sidebar");
      expect(mobileSidebar.getAttribute("data-open")).toBe("true");

      // Select ticket from mobile sidebar
      const selectButtons = screen.getAllByText("Select Ticket 123");
      const mobileSelectButton = selectButtons[selectButtons.length - 1];
      fireEvent.click(mobileSelectButton);

      // Sidebar should be closed
      expect(mobileSidebar.getAttribute("data-open")).toBe("false");

      // Ticket should be selected
      expect(screen.getByTestId("detail-panel-ticket-id")).toHaveTextContent(
        "ticket-123",
      );
    });
  });

  describe("State Management", () => {
    it("should maintain selected ticket when mobile sidebar is toggled", () => {
      render(<ManagerDashboardPage />);

      // Select a ticket
      const selectButton = screen.getAllByText("Select Ticket 123")[0];
      fireEvent.click(selectButton);

      expect(screen.getByTestId("detail-panel-ticket-id")).toHaveTextContent(
        "ticket-123",
      );

      // Open mobile sidebar
      const toggleButton = screen.getByTestId("sidebar-toggle");
      fireEvent.click(toggleButton);

      // Close mobile sidebar
      const closeButton = screen.getByTestId("close-mobile-sidebar");
      fireEvent.click(closeButton);

      // Selected ticket should still be there
      expect(screen.getByTestId("detail-panel-ticket-id")).toHaveTextContent(
        "ticket-123",
      );
    });

    it("should sync selected ticket across desktop and mobile sidebars", () => {
      render(<ManagerDashboardPage />);

      // Select from desktop
      const desktopSelectButton = screen.getAllByText("Select Ticket 123")[0];
      fireEvent.click(desktopSelectButton);

      // Open mobile sidebar
      const toggleButton = screen.getByTestId("sidebar-toggle");
      fireEvent.click(toggleButton);

      // Both sidebars should show the same selected ticket
      const selectedTicketIds = screen.getAllByTestId("selected-ticket-id");
      expect(selectedTicketIds.length).toBeGreaterThanOrEqual(1);
      selectedTicketIds.forEach((element) => {
        expect(element).toHaveTextContent("ticket-123");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-label for sidebar toggle", () => {
      render(<ManagerDashboardPage />);

      const toggleButton = screen.getByLabelText("Open tickets list");
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
