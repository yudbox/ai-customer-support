import { render, screen } from "@testing-library/react";

import { TicketKpiCard } from "../TicketKpiCard";

describe("TicketKpiCard", () => {
  it("renders label and value", () => {
    render(<TicketKpiCard label="Total Tickets" value={42} />);
    expect(screen.getByText("Total Tickets")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders sub text when provided", () => {
    render(<TicketKpiCard label="Avg Resolution" value="4.2h" sub="per ticket" />);
    expect(screen.getByText("per ticket")).toBeInTheDocument();
  });

  it("does not render sub text when omitted", () => {
    render(<TicketKpiCard label="Total" value={10} />);
    expect(screen.queryByText("per ticket")).not.toBeInTheDocument();
  });

  it("renders string value correctly", () => {
    render(<TicketKpiCard label="Resolved" value="189 (77%)" />);
    expect(screen.getByText("189 (77%)")).toBeInTheDocument();
  });

  it("applies green accent class", () => {
    const { container } = render(
      <TicketKpiCard label="Test" value={1} accent="green" />,
    );
    expect(container.firstChild).toHaveClass("bg-green-50");
  });

  it("applies yellow accent class", () => {
    const { container } = render(
      <TicketKpiCard label="Test" value={1} accent="yellow" />,
    );
    expect(container.firstChild).toHaveClass("bg-yellow-50");
  });

  it("applies red accent class", () => {
    const { container } = render(
      <TicketKpiCard label="Test" value={1} accent="red" />,
    );
    expect(container.firstChild).toHaveClass("bg-red-50");
  });

  it("uses default accent when not specified", () => {
    const { container } = render(<TicketKpiCard label="Test" value={1} />);
    expect(container.firstChild).toHaveClass("bg-white");
  });
});
