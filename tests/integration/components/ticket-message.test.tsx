/**
 * Integration tests for TicketMessage component
 *
 * Тестирует отображение сообщения тикета: тема и содержание.
 */

import { render, screen } from "@testing-library/react";

import { TicketMessage } from "@/app/_components/TicketDetailPanel/TicketMessage";

describe("TicketMessage Integration Tests", () => {
  const defaultProps = {
    subject: "Cannot login to my account",
    body: "I have been trying to login for the past hour but keep getting an error message.",
  };

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      expect(() => render(<TicketMessage {...defaultProps} />)).not.toThrow();
    });

    it("should render main container", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(screen.getByText("📧 Ticket Message")).toBeInTheDocument();
    });

    it("should render all sections", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(screen.getByText("📧 Ticket Message")).toBeInTheDocument();
      expect(screen.getByText("Subject")).toBeInTheDocument();
      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("should render header with correct styling", () => {
      render(<TicketMessage {...defaultProps} />);

      const header = screen.getByText("📧 Ticket Message");
      expect(header.tagName).toBe("H2");
      expect(header).toHaveClass("text-lg", "font-bold", "text-gray-900");
    });
  });

  describe("Subject Display", () => {
    it("should display subject label", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(screen.getByText("Subject")).toBeInTheDocument();
    });

    it("should display subject text", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(
        screen.getByText("Cannot login to my account"),
      ).toBeInTheDocument();
    });

    it("should display different subjects", () => {
      const { rerender } = render(
        <TicketMessage {...defaultProps} subject="Password reset issue" />,
      );

      expect(screen.getByText("Password reset issue")).toBeInTheDocument();

      rerender(<TicketMessage {...defaultProps} subject="Account locked" />);

      expect(screen.getByText("Account locked")).toBeInTheDocument();
    });

    it("should have correct styling for subject label", () => {
      render(<TicketMessage {...defaultProps} />);

      const labels = screen.getAllByText("Subject");
      const subjectLabel = labels[0];
      expect(subjectLabel).toHaveClass(
        "text-sm",
        "font-medium",
        "text-gray-500",
      );
    });

    it("should have correct styling for subject text", () => {
      render(<TicketMessage {...defaultProps} />);

      const subjectText = screen.getByText("Cannot login to my account");
      expect(subjectText).toHaveClass("text-gray-900", "font-medium");
    });
  });

  describe("Message Body Display", () => {
    it("should display message label", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("should display message body", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(
        screen.getByText(
          "I have been trying to login for the past hour but keep getting an error message.",
        ),
      ).toBeInTheDocument();
    });

    it("should display different message bodies", () => {
      const { rerender } = render(
        <TicketMessage
          {...defaultProps}
          body="Please help me reset my password"
        />,
      );

      expect(
        screen.getByText("Please help me reset my password"),
      ).toBeInTheDocument();

      rerender(
        <TicketMessage
          {...defaultProps}
          body="My account is locked, need assistance"
        />,
      );

      expect(
        screen.getByText("My account is locked, need assistance"),
      ).toBeInTheDocument();
    });

    it("should have correct styling for message label", () => {
      render(<TicketMessage {...defaultProps} />);

      const labels = screen.getAllByText("Message");
      const messageLabel = labels[0];
      expect(messageLabel).toHaveClass(
        "text-sm",
        "font-medium",
        "text-gray-500",
      );
    });

    it("should have whitespace-pre-wrap styling for message body", () => {
      render(<TicketMessage {...defaultProps} />);

      const messageBody = screen.getByText(/I have been trying to login/);
      expect(messageBody).toHaveClass("text-gray-900", "whitespace-pre-wrap");
    });
  });

  describe("Multiline Content", () => {
    it("should handle multiline subject", () => {
      const multilineSubject = "First line\nSecond line";
      render(<TicketMessage {...defaultProps} subject={multilineSubject} />);

      expect(screen.getByText(/First line/)).toBeInTheDocument();
      expect(screen.getByText(/Second line/)).toBeInTheDocument();
    });

    it("should handle multiline body with newlines", () => {
      const multilineBody = "Line 1\nLine 2\nLine 3";
      render(<TicketMessage {...defaultProps} body={multilineBody} />);

      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 3/)).toBeInTheDocument();
    });

    it("should preserve formatting in body with whitespace-pre-wrap", () => {
      const formattedBody =
        "Step 1: Login\nStep 2: Click settings\nStep 3: Update profile";
      render(<TicketMessage {...defaultProps} body={formattedBody} />);

      const bodyElement = screen.getByText(/Step 1: Login/);
      expect(bodyElement).toHaveClass("whitespace-pre-wrap");
    });

    it("should handle body with multiple paragraphs", () => {
      const paragraphBody = "Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.";
      render(<TicketMessage {...defaultProps} body={paragraphBody} />);

      expect(screen.getByText(/Paragraph 1/)).toBeInTheDocument();
      expect(screen.getByText(/Paragraph 3/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases - Empty Content", () => {
    it("should handle empty subject", () => {
      render(<TicketMessage {...defaultProps} subject="" />);

      expect(screen.getByText("Subject")).toBeInTheDocument();
    });

    it("should handle empty body", () => {
      render(<TicketMessage {...defaultProps} body="" />);

      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("should handle both subject and body empty", () => {
      render(<TicketMessage {...defaultProps} subject="" body="" />);

      expect(screen.getByText("Subject")).toBeInTheDocument();
      expect(screen.getByText("Message")).toBeInTheDocument();
    });
  });

  describe("Edge Cases - Long Content", () => {
    it("should handle very long subject", () => {
      const longSubject = "A".repeat(500);
      render(<TicketMessage {...defaultProps} subject={longSubject} />);

      expect(screen.getByText(longSubject)).toBeInTheDocument();
    });

    it("should handle very long body", () => {
      const longBody = "B".repeat(5000);
      render(<TicketMessage {...defaultProps} body={longBody} />);

      expect(screen.getByText(longBody)).toBeInTheDocument();
    });

    it("should handle body with many lines", () => {
      const manyLines = Array.from(
        { length: 100 },
        (_, i) => `Line ${i + 1}`,
      ).join("\n");
      render(<TicketMessage {...defaultProps} body={manyLines} />);

      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 100/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases - Special Characters", () => {
    it("should handle subject with special characters", () => {
      const specialSubject = "Issue #123: Account @user - $100 refund";
      render(<TicketMessage {...defaultProps} subject={specialSubject} />);

      expect(screen.getByText(specialSubject)).toBeInTheDocument();
    });

    it("should handle body with special characters", () => {
      const specialBody =
        "Contact: support@email.com | Phone: 1-800-123-4567 | Account #12345";
      render(<TicketMessage {...defaultProps} body={specialBody} />);

      expect(screen.getByText(specialBody)).toBeInTheDocument();
    });

    it("should handle emoji in subject", () => {
      const emojiSubject = "🔥 Urgent issue - Need help ASAP 🆘";
      render(<TicketMessage {...defaultProps} subject={emojiSubject} />);

      expect(screen.getByText(emojiSubject)).toBeInTheDocument();
    });

    it("should handle emoji in body", () => {
      const emojiBody = "Hi 👋 I need help with my account ❌ Cannot login ✅";
      render(<TicketMessage {...defaultProps} body={emojiBody} />);

      expect(screen.getByText(emojiBody)).toBeInTheDocument();
    });

    it("should handle HTML-like content in body", () => {
      const htmlLikeBody = "<div>This is not HTML but looks like it</div>";
      render(<TicketMessage {...defaultProps} body={htmlLikeBody} />);

      expect(screen.getByText(htmlLikeBody)).toBeInTheDocument();
    });

    it("should handle quotes in subject", () => {
      const quotedSubject = 'User said: "Cannot access my account"';
      render(<TicketMessage {...defaultProps} subject={quotedSubject} />);

      expect(screen.getByText(quotedSubject)).toBeInTheDocument();
    });

    it("should handle quotes in body", () => {
      const quotedBody =
        'Error message: "Invalid credentials" appeared on login screen.';
      render(<TicketMessage {...defaultProps} body={quotedBody} />);

      expect(screen.getByText(quotedBody)).toBeInTheDocument();
    });
  });

  describe("Edge Cases - Whitespace", () => {
    it("should handle subject with leading whitespace", () => {
      const leadingSpace = "   Subject with spaces";
      render(<TicketMessage {...defaultProps} subject={leadingSpace} />);

      expect(screen.getByText(/Subject with spaces/)).toBeInTheDocument();
    });

    it("should handle subject with trailing whitespace", () => {
      const trailingSpace = "Subject with spaces   ";
      render(<TicketMessage {...defaultProps} subject={trailingSpace} />);

      expect(screen.getByText(/Subject with spaces/)).toBeInTheDocument();
    });

    it("should handle body with leading whitespace", () => {
      const leadingSpace = "   Body with spaces";
      render(<TicketMessage {...defaultProps} body={leadingSpace} />);

      expect(screen.getByText(/Body with spaces/)).toBeInTheDocument();
    });

    it("should handle body with trailing whitespace", () => {
      const trailingSpace = "Body with spaces   ";
      render(<TicketMessage {...defaultProps} body={trailingSpace} />);

      expect(screen.getByText(/Body with spaces/)).toBeInTheDocument();
    });

    it("should handle body with tabs", () => {
      const tabbedBody = "First\tSecond\tThird";
      render(<TicketMessage {...defaultProps} body={tabbedBody} />);

      expect(screen.getByText(/First/)).toBeInTheDocument();
      expect(screen.getByText(/Third/)).toBeInTheDocument();
    });
  });

  describe("State Transitions", () => {
    it("should update subject dynamically", () => {
      const { rerender } = render(
        <TicketMessage {...defaultProps} subject="Original subject" />,
      );

      expect(screen.getByText("Original subject")).toBeInTheDocument();

      rerender(<TicketMessage {...defaultProps} subject="Updated subject" />);

      expect(screen.queryByText("Original subject")).not.toBeInTheDocument();
      expect(screen.getByText("Updated subject")).toBeInTheDocument();
    });

    it("should update body dynamically", () => {
      const { rerender } = render(
        <TicketMessage {...defaultProps} body="Original message" />,
      );

      expect(screen.getByText("Original message")).toBeInTheDocument();

      rerender(<TicketMessage {...defaultProps} body="Updated message" />);

      expect(screen.queryByText("Original message")).not.toBeInTheDocument();
      expect(screen.getByText("Updated message")).toBeInTheDocument();
    });

    it("should update both subject and body together", () => {
      const { rerender } = render(
        <TicketMessage subject="Subject 1" body="Body 1" />,
      );

      expect(screen.getByText("Subject 1")).toBeInTheDocument();
      expect(screen.getByText("Body 1")).toBeInTheDocument();

      rerender(<TicketMessage subject="Subject 2" body="Body 2" />);

      expect(screen.queryByText("Subject 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Body 1")).not.toBeInTheDocument();
      expect(screen.getByText("Subject 2")).toBeInTheDocument();
      expect(screen.getByText("Body 2")).toBeInTheDocument();
    });

    it("should handle transition from empty to filled", () => {
      const { rerender } = render(<TicketMessage subject="" body="" />);

      expect(screen.getByText("Subject")).toBeInTheDocument();
      expect(screen.getByText("Message")).toBeInTheDocument();

      rerender(<TicketMessage subject="New subject" body="New body" />);

      expect(screen.getByText("New subject")).toBeInTheDocument();
      expect(screen.getByText("New body")).toBeInTheDocument();
    });

    it("should handle transition from filled to empty", () => {
      const { rerender } = render(
        <TicketMessage subject="Has content" body="Has message" />,
      );

      expect(screen.getByText("Has content")).toBeInTheDocument();
      expect(screen.getByText("Has message")).toBeInTheDocument();

      rerender(<TicketMessage subject="" body="" />);

      expect(screen.queryByText("Has content")).not.toBeInTheDocument();
      expect(screen.queryByText("Has message")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic H2 for title", () => {
      render(<TicketMessage {...defaultProps} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("📧 Ticket Message");
    });

    it("should have visible labels for subject and message", () => {
      render(<TicketMessage {...defaultProps} />);

      expect(screen.getByText("Subject")).toBeVisible();
      expect(screen.getByText("Message")).toBeVisible();
    });

    it("should display content with readable text", () => {
      render(<TicketMessage {...defaultProps} />);

      const subjectText = screen.getByText("Cannot login to my account");
      expect(subjectText).toHaveClass("text-gray-900");

      const bodyText = screen.getByText(/I have been trying to login/);
      expect(bodyText).toHaveClass("text-gray-900");
    });

    it("should preserve line breaks for screen readers with pre-wrap", () => {
      const multilineBody = "Line 1\nLine 2\nLine 3";
      render(<TicketMessage {...defaultProps} body={multilineBody} />);

      const bodyElement = screen.getByText(/Line 1/);
      expect(bodyElement).toHaveClass("whitespace-pre-wrap");
    });
  });

  describe("Real-world Content Examples", () => {
    it("should handle typical support ticket subject", () => {
      render(
        <TicketMessage
          {...defaultProps}
          subject="Unable to reset password - Error 500"
        />,
      );

      expect(
        screen.getByText("Unable to reset password - Error 500"),
      ).toBeInTheDocument();
    });

    it("should handle typical support ticket body", () => {
      const typicalBody =
        'Hello,\n\nI am trying to reset my password but keep getting a 500 error.\n\nSteps to reproduce:\n1. Go to login page\n2. Click "Forgot password"\n3. Enter email\n4. Error appears\n\nPlease help.\n\nThank you!';
      render(<TicketMessage {...defaultProps} body={typicalBody} />);

      expect(
        screen.getByText(/I am trying to reset my password/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Steps to reproduce/)).toBeInTheDocument();
    });

    it("should handle urgent ticket with formatting", () => {
      render(
        <TicketMessage
          subject="URGENT: Payment failed - Order #12345"
          body="Customer payment failed 3 times.\n\nOrder: #12345\nAmount: $99.99\nCard: ****1234\n\nError: Insufficient funds\n\nCustomer is waiting."
        />,
      );

      expect(
        screen.getByText("URGENT: Payment failed - Order #12345"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Order: #12345/)).toBeInTheDocument();
    });
  });
});
