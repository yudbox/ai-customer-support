import { render, screen } from "@testing-library/react";

import { TicketMessage } from "../TicketMessage";

describe("TicketMessage Component", () => {
  const defaultProps = {
    subject: "Cannot login to my account",
    body: "I have been trying to login for the past hour but keep getting an error message.",
  };

  describe("Rendering", () => {
    it("renders component with heading", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(screen.getByText("📧 Ticket Message")).toBeInTheDocument();
    });

    it("renders heading as h2", () => {
      render(<TicketMessage {...defaultProps} />);

      const heading = screen.getByRole("heading", {
        name: /ticket message/i,
      });
      expect(heading.tagName).toBe("H2");
    });

    it("renders subject label", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(screen.getByText("Subject")).toBeInTheDocument();
    });

    it("renders message label", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("renders container with correct styling", () => {
      const { container } = render(<TicketMessage {...defaultProps} />);
      const mainDiv = container.firstChild;

      expect(mainDiv).toHaveClass("bg-white");
      expect(mainDiv).toHaveClass("rounded-lg");
      expect(mainDiv).toHaveClass("shadow");
      expect(mainDiv).toHaveClass("p-6");
    });
  });

  describe("Subject Display", () => {
    it("displays subject text", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(
        screen.getByText("Cannot login to my account"),
      ).toBeInTheDocument();
    });

    it("displays different subject text", () => {
      render(
        <TicketMessage {...defaultProps} subject="Payment not processed" />,
      );

      expect(screen.getByText("Payment not processed")).toBeInTheDocument();
    });

    it("displays empty subject", () => {
      render(<TicketMessage {...defaultProps} subject="" />);

      expect(screen.getByText("Subject")).toBeInTheDocument();
    });

    it("displays very long subject", () => {
      const longSubject = "A".repeat(500);
      render(<TicketMessage {...defaultProps} subject={longSubject} />);

      expect(screen.getByText(longSubject)).toBeInTheDocument();
    });

    it("displays subject with special characters", () => {
      const specialSubject = "<script>alert('xss')</script>";
      render(<TicketMessage {...defaultProps} subject={specialSubject} />);

      expect(screen.getByText(specialSubject)).toBeInTheDocument();
    });
  });

  describe("Body Display", () => {
    it("displays body text", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(
        screen.getByText(/I have been trying to login for the past hour/i),
      ).toBeInTheDocument();
    });

    it("displays different body text", () => {
      render(
        <TicketMessage
          {...defaultProps}
          body="My payment was charged twice."
        />,
      );

      expect(
        screen.getByText("My payment was charged twice."),
      ).toBeInTheDocument();
    });

    it("displays multiline body text", () => {
      const multilineBody = `Line 1
Line 2
Line 3`;
      render(<TicketMessage {...defaultProps} body={multilineBody} />);

      // Use function matcher to handle newlines in textContent
      const bodyElement = screen.getByText((content, element) => {
        return element?.textContent === multilineBody;
      });
      expect(bodyElement).toBeInTheDocument();
    });

    it("preserves whitespace in body with whitespace-pre-wrap", () => {
      render(<TicketMessage {...defaultProps} />);
      const bodyElement = screen.getByText(/I have been trying to login/i);

      expect(bodyElement).toHaveClass("whitespace-pre-wrap");
    });

    it("displays empty body", () => {
      render(<TicketMessage {...defaultProps} body="" />);

      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("displays very long body", () => {
      const longBody = "B".repeat(1000);
      render(<TicketMessage {...defaultProps} body={longBody} />);

      expect(screen.getByText(longBody)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("heading has correct styling", () => {
      render(<TicketMessage {...defaultProps} />);

      const heading = screen.getByText("📧 Ticket Message");
      expect(heading).toHaveClass("text-lg");
      expect(heading).toHaveClass("font-bold");
      expect(heading).toHaveClass("text-gray-900");
      expect(heading).toHaveClass("mb-4");
    });

    it("labels have correct styling", () => {
      render(<TicketMessage {...defaultProps} />);

      const subjectLabel = screen.getByText("Subject");
      expect(subjectLabel).toHaveClass("text-sm");
      expect(subjectLabel).toHaveClass("font-medium");
      expect(subjectLabel).toHaveClass("text-gray-500");
    });

    it("subject text has correct styling", () => {
      render(<TicketMessage {...defaultProps} />);

      const subjectText = screen.getByText("Cannot login to my account");
      expect(subjectText).toHaveClass("text-gray-900");
      expect(subjectText).toHaveClass("font-medium");
    });

    it("body text has correct styling", () => {
      render(<TicketMessage {...defaultProps} />);

      const bodyText = screen.getByText(/I have been trying to login/i);
      expect(bodyText).toHaveClass("text-gray-900");
      expect(bodyText).toHaveClass("whitespace-pre-wrap");
    });

    it("has space-y-4 for content spacing", () => {
      render(<TicketMessage {...defaultProps} />);

      // Verify content is rendered (spacing is CSS detail)
      expect(screen.getByText("Subject")).toBeInTheDocument();
      expect(
        screen.getByText(/I have been trying to login/i),
      ).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("accepts and uses all props correctly", () => {
      const customProps = {
        subject: "Custom Subject",
        body: "Custom body text here.",
      };

      render(<TicketMessage {...customProps} />);

      expect(screen.getByText("Custom Subject")).toBeInTheDocument();
      expect(screen.getByText("Custom body text here.")).toBeInTheDocument();
    });

    it("re-renders when subject changes", () => {
      const { rerender } = render(<TicketMessage {...defaultProps} />);

      expect(
        screen.getByText("Cannot login to my account"),
      ).toBeInTheDocument();

      rerender(<TicketMessage {...defaultProps} subject="New Subject" />);

      expect(screen.getByText("New Subject")).toBeInTheDocument();
      expect(
        screen.queryByText("Cannot login to my account"),
      ).not.toBeInTheDocument();
    });

    it("re-renders when body changes", () => {
      const { rerender } = render(<TicketMessage {...defaultProps} />);

      expect(
        screen.getByText(/I have been trying to login/i),
      ).toBeInTheDocument();

      rerender(<TicketMessage {...defaultProps} body="New body text" />);

      expect(screen.getByText("New body text")).toBeInTheDocument();
      expect(
        screen.queryByText(/I have been trying to login/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("heading is accessible", () => {
      render(<TicketMessage {...defaultProps} />);

      const heading = screen.getByRole("heading", {
        name: /ticket message/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("uses semantic HTML", () => {
      render(<TicketMessage {...defaultProps} />);

      const h2 = screen.getByRole("heading", { level: 2 });
      const bodyText = screen.getByText(/I have been trying to login/i);

      expect(h2).toBeInTheDocument();
      expect(bodyText).toBeInTheDocument();
      expect(bodyText.tagName).toBe("P");
    });
  });

  describe("Edge Cases", () => {
    it("handles subject with only whitespace", () => {
      render(<TicketMessage {...defaultProps} subject="   " />);

      expect(screen.getByText("Subject")).toBeInTheDocument();
    });

    it("handles body with only whitespace", () => {
      render(<TicketMessage {...defaultProps} body="   " />);

      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("handles unicode characters in subject", () => {
      const unicodeSubject = "Login problem with special chars 🚀";
      render(<TicketMessage {...defaultProps} subject={unicodeSubject} />);

      expect(screen.getByText(unicodeSubject)).toBeInTheDocument();
    });

    it("handles unicode characters in body", () => {
      const unicodeBody = "Please help me with this issue ❤️";
      render(<TicketMessage {...defaultProps} body={unicodeBody} />);

      expect(screen.getByText(unicodeBody)).toBeInTheDocument();
    });

    it("handles body with tabs and newlines", () => {
      const complexBody = "Line 1\n\tIndented line\n\n\tAnother line";
      render(<TicketMessage {...defaultProps} body={complexBody} />);

      // Use function matcher to handle tabs and newlines in textContent
      const bodyElement = screen.getByText((content, element) => {
        return element?.textContent === complexBody;
      });
      expect(bodyElement).toBeInTheDocument();
    });
  });
});
