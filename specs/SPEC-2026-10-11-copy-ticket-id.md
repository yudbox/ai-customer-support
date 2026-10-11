# Spec: Copy ticket ID button | SPEC-2026-10-11-copy-ticket-id | Status: approved
Supersedes: N/A
Related: N/A

## Problem and why
Managers reviewing a ticket in the Manager Dashboard (`/manager`, ticket detail panel) often need to paste the ticket's identifier somewhere else: Slack, email, a bug tracker, a search box. Today the identifier is only shown inside the page heading ("Ticket #TKT-…") next to an emoji. Selecting it by hand is fiddly and easy to get wrong (you pick up the `#`, the emoji or the word "Ticket"). A one-click "Copy ticket ID" button removes that friction and makes sure the exact identifier gets copied.

## Goals / Non-goals
**Goals:**
- Add a "Copy ticket ID" button to the ticket header on the ticket details panel.
- One activation (mouse, touch or keyboard) puts the exact ticket identifier on the system clipboard.
- Clear, accessible success and failure feedback.
- Handle these cases safely: Clipboard API unavailable, clipboard write rejected, ticket still loading.

**Non-goals:**
- **Frontend-only.** No new or changed API endpoints, tRPC procedures, DB columns or migrations. The identifier is already in the `tickets.getById` response the panel uses.
- Copying any other field (subject, body, customer email, deep link URL).
- Copying the internal UUID `id`, or any second copy action such as "Copy internal ID" (decision D1).
- Copy buttons anywhere other than the ticket details panel, including the sidebar list, the customer-facing home page `TicketStream` and analytics (decision D6).
- Showing copy feedback through the global toast (decision D2).
- Adding an icon library, a toast library or a clipboard polyfill dependency.
- A legacy `document.execCommand("copy")` fallback. When the Clipboard API is unavailable, the manual-selection failure message is the whole fallback (decision D3).
- Changing the global Toast component's variants or badges.

## User stories
- **US-1:** As a support manager, I want to copy the ticket ID with one click, so that I can paste it into other tools without selection mistakes.
- **US-2:** As a support manager, I want clear confirmation that the copy worked (or didn't), so that I don't paste stale clipboard contents.
- **US-3:** As a keyboard or screen-reader user, I want to reach, activate and understand the copy button without a mouse, so that the feature is accessible (the project targets WCAG 2.1 AA / EU Directive 2019/882 per `tests/accessibility/`).

## Acceptance criteria (EARS)

**Visibility and placement (US-1)**
- **AC-1:** WHEN the ticket details panel has finished loading a ticket, the system shall show a "Copy ticket ID" button in the ticket header, next to the ticket heading.
  `observable: unit (RTL): render the panel/header with a ticket → getByRole("button", { name: /copy ticket id/i }) is in the document`
- **AC-2:** WHILE no ticket is selected, or the selected ticket was not found, the system shall not show the copy button.
  `observable: unit: ticketId=null → queryByRole("button", { name: /copy ticket id/i }) is null; getById returns null → same`

**Copy behaviour (US-1)**
- **AC-3:** WHEN the user activates the copy button, the system shall write exactly the ticket's display identifier (the `ticket_number` value, e.g. `TKT-2026-1011-AB12`) to the clipboard. There shall be no leading `#`, no "Ticket" prefix, no emoji and no surrounding whitespace. The system shall never write the internal UUID `id`.
  `observable: unit: mock navigator.clipboard.writeText → click → called once with "TKT-12345" and never with the ticket's UUID; E2E (Playwright, clipboard permissions granted) → read clipboard equals the ticket_number shown in the heading`
- **AC-4:** WHEN the user activates the copy button for ticket B after switching from ticket A in the sidebar, the system shall copy ticket B's identifier.
  `observable: unit: rerender with a different ticketNumber → click → writeText called with the new value`

**Success feedback (US-2, US-3)**
- **AC-5:** WHEN the clipboard write succeeds, the system shall change the button's own visible label to "Copied" for 2 seconds and then restore the label "Copy ticket ID". The system shall not show a toast.
  `observable: unit with fake timers: click → resolve writeText → "Copied" visible on the button, queryByTestId("toast-container") is null → advance 2000 ms → "Copy ticket ID" visible again`
- **AC-6:** WHEN the clipboard write succeeds, the system shall announce "Ticket ID copied" through a polite live region (`role="status"` / `aria-live="polite"`) that assistive technology reads out.
  `observable: unit: getByRole("status") has text "Ticket ID copied" after a successful click`
- **AC-7:** WHEN the user activates the button again while the "Copied" state is showing, the system shall copy again and restart the 2-second timer. There shall be no flicker and no stacked feedback.
  `observable: unit with fake timers: click, advance 1500 ms, click, advance 1500 ms → still "Copied"; advance 500 ms → restored`
- **AC-19:** WHEN the panel switches to a different ticket while the "Copied" or failure feedback is showing, the system shall immediately restore the "Copy ticket ID" label, clear the feedback text from the live region and cancel the pending feedback timer. The new ticket's header shall never show the previous ticket's feedback.
  `observable: unit with fake timers: click → "Copied" visible → rerender with a different ticketNumber (or ticketId) → "Copy ticket ID" visible immediately and getByRole("status") is empty; advance 4000 ms → no label change, no act() warnings. Same check starting from the failure state.`

**Failure handling (US-2)**
- **AC-8:** IF the Clipboard API is unavailable (for example `navigator.clipboard` or `writeText` is undefined in a non-secure HTTP context), THEN the system shall do all of the following:
  - not throw an error, and not attempt any other copy mechanism (no `document.execCommand("copy")`);
  - show the failure feedback "Couldn't copy, select the ID manually" for 4 seconds, visibly and through the live region;
  - leave the ticket identifier visible as selectable text.
  `observable: unit: delete navigator.clipboard, spy on document.execCommand → click → no uncaught error, execCommand not called, failure text visible, getByRole("status") contains it; advance 4000 ms → failure text gone`
- **AC-9:** IF the clipboard write is rejected (permission denied, document not focused, any thrown error), THEN the system shall show the same failure feedback as AC-8 and shall not show the "Copied" state.
  `observable: unit: writeText mockRejectedValue(new DOMException("denied")) → failure text shown, "Copied" never shown`
- **AC-10:** IF a clipboard write fails, THEN the system shall leave the rest of the ticket details panel interactive and unchanged, including the resolution text, selected team and modals.
  `observable: unit: type resolution text → trigger failed copy → resolution textarea value unchanged, Approve still enabled`

**Accessibility (US-3)**
- **AC-11:** The system shall give the copy button an accessible name "Copy ticket ID", and it shall stay discoverable by that name while the visible label shows "Copied". The current state is conveyed through the live region from AC-6 and AC-8.
  `observable: unit: getByRole("button", { name: "Copy ticket ID" }) resolves before and after a click`
- **AC-12:** WHEN the copy button has keyboard focus and the user presses Enter or Space, the system shall perform the same copy as a pointer click.
  `observable: unit (user-event): tab to button → keyboard("{Enter}") → writeText called; same for " "`
- **AC-13:** The system shall make the copy button reachable via Tab in the natural reading order of the header (after the heading, before the "Pending Approval" badge) and show a visible focus ring.
  `observable: unit: userEvent.tab() sequence; manual: visible focus ring (Button component focus:ring-2)`
- **AC-14:** The system shall keep focus on the copy button after activation, whether the copy succeeds or fails.
  `observable: unit: after click/Enter → document.activeElement is the button`
- **AC-15:** The system shall produce zero jest-axe violations for the ticket header with the copy button in default, "Copied" and failure states.
  `observable: a11y test (npm run test:a11y): axe(container) → toHaveNoViolations for each state`

**Loading and layout (no layout breakage)**
- **AC-16:** WHILE the ticket is loading, the system shall render the existing loading skeleton unchanged, with no copy button and no placeholder for it, and shall not make any clipboard call.
  `observable: unit: isLoading=true → data-testid="loading-skeleton" present, no copy button, writeText not called`
- **AC-17:** WHEN the button switches between its default, "Copied" and failure labels, the system shall not change the button's rendered width or the position of the heading or the "Pending Approval" badge.
  `observable: manual / Playwright: compare boundingBox() of button, h1 and badge before and after click → equal (±1 px)`
- **AC-18:** WHEN the ticket identifier is at the maximum stored length (50 characters) or the viewport is 375 px wide, the system shall keep the heading, copy button and status badge inside the header card, with no horizontal overflow and no overlapping elements.
  `observable: Playwright at 375×812 and 1280×800 with a 50-char ticket_number → header scrollWidth <= clientWidth; manual visual check`

## Edge cases
- **No ticket selected:** no button (AC-2).
- **Ticket not found:** no button (AC-2).
- **Ticket loading:** skeleton only, no button, no clipboard call (AC-16).
- **Switching tickets while "Copied" or failure feedback is showing:** the feedback resets immediately (AC-19), and the next activation copies the new ID (AC-4).
- **Clipboard API missing (HTTP, older browser, sandboxed iframe):** AC-8.
- **Permission denied or document not focused:** AC-9.
- **Rapid repeated clicks:** AC-7. Each click issues one write. Accepted risk: overlapping promises may resolve out of order, but every write carries the same value, so the result is identical.
- **50-character ticket_number (DB `varchar(50)` limit):** AC-18.
- **Component unmounts while the "Copied" timer is pending** (manager approves or rejects and the page navigates to `/`): the timer shall be cleared, with no React state update on an unmounted component. This is covered by the cleanup requirement in Non-functional.
- **Ticket identifier is an empty string:** accepted risk. `ticket_number` is `NOT NULL` and server-generated (`TKT-YYYY-MMDD-XXXX`), so this is not reachable in practice.

## Data model / Schema
No new entities. The feature reads the existing **Ticket** fields:
- `ticket_number`: the human-facing display identifier, unique, up to 50 chars. **This is what gets copied.**
- `id`: the internal UUID. It is never copied (decision D1, AC-3).

## Workflows
1. The manager opens `/manager` and selects a ticket in the sidebar.
2. The panel shows the loading skeleton (no button). It then renders the header with "Ticket #TKT-…", the **Copy ticket ID** button and the "Pending Approval" badge.
3. The manager clicks the button, or tabs to it and presses Enter or Space.
4. The system writes `ticket_number` to the clipboard.
   - On success: the label becomes "Copied" for 2 s and the live region says "Ticket ID copied".
   - On failure or no API: the failure text shows for 4 s, the live region announces it, and the ID stays selectable in the heading.
5. Focus stays on the button. The rest of the panel is unaffected.

## Service communication
N/A. The feature is frontend-only and makes no new network calls. It uses the browser's Clipboard API (`navigator.clipboard.writeText`) on the client.

## Contracts (high-level)
N/A. No new or changed endpoints. It uses the existing `tickets.getById` response field `ticket_number`.

## Non-functional
- **Perf:** WHEN the user activates the button, the success or failure feedback shall appear within 100 ms of the clipboard promise settling.
- **Reliability:** IF the component unmounts while a feedback timer is pending, THEN the system shall clear the timer, with no React "state update on unmounted component" warning in the test console.
- **A11y:** jest-axe zero violations (AC-15). Keyboard operable (AC-12, AC-13). Live-region announcement (AC-6). The target size of the button shall be at least 24×24 CSS px (WCAG 2.2 SC 2.5.8).
- **Security / privacy:** the system shall write only the ticket identifier to the clipboard. It shall never read from the clipboard and shall never log the copied value.
- **Dependencies:** no new runtime npm dependencies.

## Inputs (provenance)
- Ticket identifier: [deterministic: existing `tickets.getById` query result, field `ticket_number`], already fetched by the panel.
- Clipboard: [browser API, client-side only].
- No LLM calls.

## Untrusted inputs
`ticket_number` is server-generated (`TKT-YYYY-MMDD-XXXX` in the ticket service) but comes from the DB. It shall be rendered only as React text (auto-escaped, no `dangerouslySetInnerHTML`) and written to the clipboard as plain text (`writeText`, not HTML). No other external or user-supplied text is processed by this feature.

## Verification hints
- AC-1, AC-2, AC-16 → RTL tests next to the existing ones in `app/_components/TicketDetailPanel/__tests__/` (`index.test.tsx`, `TicketHeader.test.tsx`).
- AC-3–AC-10, AC-19 → RTL tests with `navigator.clipboard.writeText` mocked via `Object.defineProperty` (jsdom has no Clipboard API by default) and `jest.useFakeTimers()` for the 2 s / 4 s windows.
- AC-11–AC-15 → `@testing-library/user-event` keyboard tests, plus a new `tests/accessibility/` test using jest-axe in the three states.
- AC-3 (real clipboard), AC-17, AC-18 → Playwright with `context.grantPermissions(["clipboard-read","clipboard-write"])` and `boundingBox()` comparisons at two viewports.

## Assumptions
- **A1, which ID gets copied (confirmed, decision D1):** a ticket has two identifiers, the internal UUID `id` and the display number `ticket_number`. Only **`ticket_number`** is copied, because:
  - it is what the UI shows ("Ticket #TKT-…");
  - it is what notifications reference;
  - it is unique and indexed in the DB, so it is searchable.
  The UUID is never shown to users and is never copied.
- **A2, feedback mechanism (confirmed, decision D2):** feedback is an **inline temporary label on the button plus a polite live region**. The global toast is not used. The existing `ToastContext`/`Toast` has hard-coded per-variant badges ("Email & Slack", "Priority Alert", "Email"), no error variant and no `role="status"`/`aria-live`, and it stays unchanged.
- **A3, button styling:** reuse the existing `Button` from `@/components/ui` (variant `ghost` or `secondary`, size `sm`). The project has no icon library; an optional inline SVG copy glyph, marked `aria-hidden`, follows the existing pattern in `toast.tsx` and `button.tsx`.
- **A4, the label is the accessible name:** the button carries visible text, not an icon only, so it doesn't depend on `aria-label` alone.

## Resolved decisions
Answers from the product owner to the open questions of the draft (2026-10-11).

- **D1 (was Q1), which ID to copy:** copy only the display number `ticket_number`. No UUID copy and no second "Copy internal ID" action. Reflected in AC-3, Non-goals and A1.
- **D2 (was Q2), toast or inline feedback:** no toast. Keep the inline "Copied" label on the button. Reflected in AC-5, Non-goals and A2.
- **D3 (was Q3), `execCommand` fallback:** no `document.execCommand("copy")` fallback. The manual-selection failure message is enough. Reflected in AC-8 and Non-goals.
- **D4 (was Q4), switching tickets during feedback:** reset the feedback immediately when the user switches tickets. Reflected in AC-19 and Edge cases.
- **D5 (was Q5), wording and durations:** keep "Copy ticket ID" / "Copied" / "Couldn't copy, select the ID manually", with 2 s for success and 4 s for failure. Reflected in AC-5, AC-6 and AC-8.
- **D6 (was Q6), other surfaces:** the button goes on the ticket details page only, not on `TicketStream` or anywhere else. Reflected in AC-1, AC-2 and Non-goals.
