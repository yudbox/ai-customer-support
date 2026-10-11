/**
 * Accessibility Tests - ResolutionEditor
 *
 * jest-axe runs in jsdom, which cannot evaluate the `color-contrast` rule.
 * Contrast of the counter states (AC-18) is covered by code review of the
 * chosen Tailwind shades and by the Playwright axe check in
 * tests/e2e/resolution-char-counter.spec.ts.
 */

import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import { ResolutionEditor } from "@/app/_components/TicketDetailPanel/ResolutionEditor";

expect.extend(toHaveNoViolations);

describe("ResolutionEditor - Accessibility", () => {
  const onResolutionChange = jest.fn();

  const states: Array<[string, string]> = [
    ["required", ""],
    ["normal", "Hello world"],
    ["warning", "A".repeat(4600)],
    ["limit reached", "A".repeat(5000)],
    ["over limit", "A".repeat(6200)],
  ];

  it.each(states)("has no axe violations in the %s state", async (_n, text) => {
    const { container } = render(
      <ResolutionEditor
        resolutionText={text}
        onResolutionChange={onResolutionChange}
        suggestedSolution="AI solution"
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it.each(states)(
    "textarea has a name and a valid description target in the %s state",
    (_n, text) => {
      render(
        <ResolutionEditor
          resolutionText={text}
          onResolutionChange={onResolutionChange}
        />,
      );

      const textbox = screen.getByRole("textbox", { name: /resolution/i });
      expect(textbox).toHaveAttribute("aria-describedby");
      // Resolves only when every referenced id exists in the document.
      expect(textbox).toHaveAccessibleDescription(/.+/);
    },
  );

  it.each(states)(
    "has exactly one polite live region in the %s state",
    (_n, text) => {
      render(
        <ResolutionEditor
          resolutionText={text}
          onResolutionChange={onResolutionChange}
        />,
      );

      const live = screen.getAllByRole("status");
      expect(live).toHaveLength(1);
      expect(live[0]).toHaveAttribute("aria-live", "polite");
    },
  );
});
