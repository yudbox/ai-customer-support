# Plan: Copy ticket ID button

> Status: DRAFT
> Created: 2026-10-11
> Spec: specs/SPEC-2026-10-11-copy-ticket-id.md (approved; decisions D1-D6 final)
> Execution Mode: single-agent (one module, frontend-only, tasks are tightly coupled; run TASK-001 -> TASK-002 -> TASK-003 -> TASK-004 in order)

## Requirements (VRF)

> Status: Confirmed by caller (spec approved, no open questions). Gaps below were resolved with the documented defaults, not by editing the spec.

| ID  | Requirement | Source |
| --- | ----------- | ------ |
| R1  | When the panel has a loaded ticket, `TicketHeader` renders a button whose accessible name is "Copy ticket ID", placed next to the h1 | AC-1 |
| R2  | No copy button when `ticketId` is null or `getById` returns null | AC-2 |
| R3  | Activation calls `navigator.clipboard.writeText(ticketNumber)` exactly once with the raw `ticket_number` (no `#`, prefix, emoji or whitespace); the UUID `id` is never passed to the header or written | AC-3 |
| R4  | After the ticket changes, activation copies the new `ticketNumber` | AC-4 |
| R5  | On success the visible button label becomes "Copied" for 2000 ms and then returns to "Copy ticket ID"; no toast | AC-5 |
| R6  | On success one polite live region (`role="status"`, `aria-live="polite"`) contains "Ticket ID copied" | AC-6 |
| R7  | Re-activation during "Copied" copies again and restarts the 2000 ms timer (single timer, no stacking) | AC-7 |
| R8  | Clipboard API missing: no throw, no `document.execCommand`, the text "Couldn't copy, select the ID manually" shows visibly and in the live region for 4000 ms, and the ID stays selectable in the h1 | AC-8 |
| R9  | `writeText` rejects: same failure feedback as R8, never "Copied" | AC-9 |
| R10 | A failed copy leaves panel state (resolution text, team, modals, Approve enabled) untouched | AC-10 |
| R11 | The accessible name stays "Copy ticket ID" in every state | AC-11 |
| R12 | Enter and Space on the focused button copy (native `<button type="button">`) | AC-12 |
| R13 | Tab order: h1 -> copy button -> (badge, not focusable); focus ring from `Button` base styles | AC-13 |
| R14 | Focus stays on the button after success and failure (the button is never disabled or unmounted on click) | AC-14 |
| R15 | Zero jest-axe violations for the header in the default, "Copied" and failure states | AC-15 |
| R16 | While loading: existing skeleton unchanged, no button, no `writeText` call | AC-16 |
| R17 | Button width and h1/badge positions don't change between label states | AC-17 |
| R18 | A 50-char `ticket_number` at 375 px and 1280 px: no horizontal overflow and no overlap in the header card | AC-18 |
| R19 | A ticket switch during feedback resets the label, empties the live region and cancels the timer immediately; feedback from a late-settling promise for the old ticket never shows on the new one | AC-19 |
| R20 | Timer cleared on unmount, no React warnings; never read the clipboard or log the value; no new deps; button target >= 24x24 px | Non-functional |

## Open Questions & Recommendations

| #  | Question | Answer (default applied) | Type |
| -- | -------- | ------------------------ | ---- |
| Q1 | Where does the failure text appear visibly? AC-17 talks about "failure labels" on the button, but a 37-char label inside the button would widen it and threaten AC-18 at 375 px | The button label stays "Copy ticket ID" during failure. The failure text is the visible content of the live region, rendered directly under the button. The success text "Ticket ID copied" in the same region is visually hidden (`sr-only`), because the button already shows "Copied" | gap |
| Q2 | AC-11 (name stays "Copy ticket ID" while "Copied" shows) conflicts with A4 ("label is the accessible name, not aria-label alone") | Keep the visible text, set `aria-label="Copy ticket ID"` on the button and mark the swapped visible label spans `aria-hidden`. Note: axe rule `label-content-name-mismatch` (WCAG 2.5.3) is experimental and off by default, so jest-axe will pass. A WCAG 2.5.3 purist would flag the "Copied" state, but the spec explicitly accepts it | gap |
| Q3 | How should AC-19 reset be implemented? | 💡 Extract a colocated `CopyTicketIdButton` client component and render it from `TicketHeader` with `key={ticketNumber}`. A ticket switch remounts it, which resets state, empties the region and runs the unmount cleanup that clears the timer. Also guard promise handlers with an "is mounted" ref so a late `writeText` settle after remount/unmount is ignored | 💡 recommendation |
| Q4 | E2E for /manager needs Postgres + seed data, and a 50-char `ticket_number` does not exist in seed data | TASK-004 is optional and environment-gated. If it is not run, AC-17 and AC-18 are verified manually (DevTools at 375x812 and 1280x800 with a 50-char value in the DOM) and recorded in the PR | 🚩 red flag |

## Affected Modules

| Module | Path | Change Type |
| ------ | ---- | ----------- |
| frontend: ticket detail panel header | `app/_components/TicketDetailPanel/TicketHeader.tsx` | Modify |
| frontend: new copy button component | `app/_components/TicketDetailPanel/CopyTicketIdButton.tsx` | Add |
| frontend: panel container | `app/_components/TicketDetailPanel/index.tsx` | Unchanged (verified: loading / not-found / no-selection branches already return before `TicketHeader` renders, lines 109-147; it passes only `ticket.ticket_number`, never `ticket.id`, line 154) |
| UI primitive | `components/ui/button.tsx` (exported from `components/ui/index.ts`) | Reuse, unchanged |
| unit tests | `app/_components/TicketDetailPanel/__tests__/` | Add / Modify |
| integration test (existing) | `tests/integration/components/ticket-header.test.tsx` | Unchanged, must still pass |
| a11y tests | `tests/accessibility/` | Add |
| e2e | `tests/e2e/` | Add (optional) |

No backend, tRPC, DB or migration changes. `ticket_number` is `varchar(50)`, unique (`lib/database/entities/Ticket.ts:38-39`).

## Tasks

### TASK-001: CopyTicketIdButton component and TicketHeader integration

**Scope:** frontend

**Owned Paths:**

- `app/_components/TicketDetailPanel/CopyTicketIdButton.tsx` (new)
- `app/_components/TicketDetailPanel/TicketHeader.tsx`
- `app/_components/TicketDetailPanel/__tests__/CopyTicketIdButton.test.tsx` (new)
- `app/_components/TicketDetailPanel/__tests__/TicketHeader.test.tsx`

**Implementation steps:**

1. `CopyTicketIdButton.tsx`: `"use client"`; props `{ ticketNumber: string }`. Put the constants (labels, `COPIED_MS = 2000`, `FAILED_MS = 4000`) at the top of the file as UPPER_SNAKE_CASE.
   - Local state `status: "idle" | "copied" | "failed"`. One `useRef` holds the timeout id and one `useRef` holds the mounted flag. A `useEffect` cleanup clears the timeout and sets mounted to false.
   - The click handler:
     - clears any pending timeout;
     - if `navigator.clipboard?.writeText` is not a function, sets `failed` plus a 4000 ms timer, with no other copy path;
     - otherwise `await navigator.clipboard.writeText(ticketNumber)` in try/catch: success sets `copied` plus a 2000 ms timer, and any throw or rejection sets `failed` plus a 4000 ms timer;
     - before every setState, checks that the mounted ref is still true.
   - Never read the clipboard and never `console.*` the value.
   - Render the existing `Button` from `@/components/ui` with `type="button"`, `variant="secondary"` (or `ghost`), `size="sm"` and `aria-label="Copy ticket ID"`.
     - Do NOT use `isPending` or `disabled`. They disable the button (focus loss, AC-14) and inject an svg `role="status"` that would collide with `getByRole("status")`.
     - Children: the two labels "Copy ticket ID" and "Copied" stacked in one CSS grid cell, so the width is always the widest label (AC-17). The inactive one gets `invisible`, and both get `aria-hidden="true"`. An optional inline SVG copy glyph gets `aria-hidden="true"`.
   - Always render exactly one live-region element (`role="status"`, `aria-live="polite"`) under the button. Its content is:
     - `""` when idle;
     - "Ticket ID copied" when copied (visually hidden with `sr-only`);
     - "Couldn't copy, select the ID manually" when failed (visible, small text).
2. `TicketHeader.tsx`:
   - Keep the outer `div.bg-white.rounded-lg.shadow.p-6` as `container.firstChild`.
   - Keep the h1 text and classes unchanged. Do not put the button inside the h1.
   - Wrap the h1 and `<CopyTicketIdButton key={ticketNumber} ticketNumber={ticketNumber} />` in a `flex flex-wrap items-center gap-2` row inside the left column, so the DOM order is h1 -> button -> badge (AC-13).
   - For AC-18, add `min-w-0` to the left column, `break-all` (or `[overflow-wrap:anywhere]`) on the h1, and `flex-wrap` / `gap` on the outer `justify-between` row so the badge wraps instead of overflowing at 375 px.
   - `TicketHeader` stays a component without hooks. The client boundary is `CopyTicketIdButton`.
3. Respect the ESLint `import/order` rule (react first, then external, then `@/**`, then relative, with blank lines between groups).

**Acceptance Criteria:**

- [ ] AC-001 (AC-1): header renders `getByRole("button", { name: /copy ticket id/i })`
- [ ] AC-002 (AC-3): click calls `writeText` once with `"TKT-12345"`; never with a UUID-like value; argument has no `#`/whitespace
- [ ] AC-003 (AC-4, AC-19): `rerender` with a new `ticketNumber` -> click -> `writeText` called with the new value. Starting from "Copied" and from failure, the rerender immediately shows "Copy ticket ID", `getByRole("status")` is empty, and advancing 4000 ms changes nothing (no act() warnings)
- [ ] AC-004 (AC-5, AC-6): fake timers; after success the button shows "Copied", the status says "Ticket ID copied", `queryByTestId("toast-container")` is null; at +2000 ms the label is restored
- [ ] AC-005 (AC-7): click, +1500 ms, click, +1500 ms -> still "Copied"; +500 ms -> restored; `writeText` called twice
- [ ] AC-006 (AC-8): `navigator.clipboard` undefined plus an `execCommand` spy -> no throw, `execCommand` not called, failure text visible and inside `getByRole("status")`, gone after 4000 ms; the h1 still contains the ID
- [ ] AC-007 (AC-9): `writeText` rejects with `new DOMException("denied")` -> failure text shown, "Copied" never shown
- [ ] AC-008 (AC-11): `getByRole("button", { name: "Copy ticket ID" })` resolves before and after success and failure
- [ ] AC-009 (AC-12, AC-14): user-event `tab()` -> `{Enter}` -> `writeText` called; same for `" "`; `document.activeElement` is the button after success and failure
- [ ] AC-010 (AC-13): `userEvent.tab()` from body focuses the copy button first (it is the only focusable element in the header). The DOM order h1 < button < "Pending Approval" is asserted with `compareDocumentPosition`
- [ ] AC-011 (NFR reliability): unmount while the "Copied" timer is pending -> advance timers -> no console error/warning (spy on `console.error`)
- [ ] AC-012: all existing tests in `TicketHeader.test.tsx` and `tests/integration/components/ticket-header.test.tsx` pass unchanged (new assertions may be appended to `TicketHeader.test.tsx`)

**Verification:**

| AC | How to measure |
|----|----------------|
| AC-001..AC-011 | `npm run test:unit -- app/_components/TicketDetailPanel/__tests__/CopyTicketIdButton.test.tsx app/_components/TicketDetailPanel/__tests__/TicketHeader.test.tsx` -> passes |
| AC-012 | `npm run test:unit -- app/_components/TicketDetailPanel` and `npm run test:int -- tests/integration/components/ticket-header.test.tsx` -> pass |
| all | `npm run type` and `npm run lint` and `npm run lint:a11y` -> 0 errors |

---

### TASK-002: Panel-level tests with the real TicketHeader

**Scope:** frontend (tests only)

**Owned Paths:**

- `app/_components/TicketDetailPanel/__tests__/index.copyTicketId.test.tsx` (new)

> `index.test.tsx` mocks `../TicketHeader`, so the panel-level ACs need a separate file that keeps the real `TicketHeader`. Copy the `next/navigation` and `@/lib/trpc/client` mocks from `index.test.tsx` (lines 7-50). Mock `ResolutionEditor` / `ActionButtons` the same way, so the resolution textarea and Approve button can be asserted. Do NOT mock `TicketHeader`. `index.tsx` and `index.test.tsx` stay unchanged.

**Acceptance Criteria:**

- [ ] AC-013 (AC-2): `ticketId={null}` -> `queryByRole("button", { name: /copy ticket id/i })` is null; `getById` returns `{ data: null, isLoading: false }` -> same
- [ ] AC-014 (AC-16): `getById` returns `{ data: undefined, isLoading: true }` -> `getByTestId("loading-skeleton")` present, no copy button, mocked `writeText` not called
- [ ] AC-015 (AC-10): type into `resolution-textarea`, mock `writeText` rejects, click copy -> textarea value unchanged, `approve-button` is enabled, failure text shown
- [ ] AC-016 (AC-19 via ticketId): success -> "Copied"; rerender with a different `ticketId` and a mock returning a ticket with a different `ticket_number` -> "Copy ticket ID" shown immediately and `getByRole("status")` is empty; the next click copies the new number (AC-4)

**Verification:**

| AC | How to measure |
|----|----------------|
| AC-013..AC-016 | `npm run test:unit -- app/_components/TicketDetailPanel/__tests__/index.copyTicketId.test.tsx` -> passes |
| regression | `npm run test:unit -- app/_components/TicketDetailPanel/__tests__/index.test.tsx` -> passes unchanged |

---

### TASK-003: jest-axe accessibility test

**Scope:** frontend (tests only)

**Owned Paths:**

- `tests/accessibility/copy-ticket-id-button.test.tsx` (new)

> Follow the pattern in `tests/accessibility/button-component.test.tsx`: `render` + `userEvent` + `{ axe, toHaveNoViolations }` from `jest-axe`, `expect.extend(toHaveNoViolations)`. Render `TicketHeader` (which includes the button). `jest.accessibility.config.mjs` enforces a 90% coverage threshold over `app/_components` when run with `--coverage`, so this file must also exercise the success, failure and timer-reset branches of `CopyTicketIdButton`.

**Acceptance Criteria:**

- [ ] AC-017 (AC-15): `expect(await axe(container)).toHaveNoViolations()` in the default state, the "Copied" state (resolved `writeText`) and the failure state (rejected `writeText` and missing `navigator.clipboard`)
- [ ] AC-018 (AC-11, AC-13, NFR target size): button has accessible name "Copy ticket ID" in all three states; button is reachable by `userEvent.tab()`; button has the `Button` focus classes (`focus:ring-2`) and size `sm` classes (`py-1.5`, which gives a height of at least 24 px). The 24x24 size itself is checked manually or in e2e, because jsdom has no layout

**Verification:**

| AC | How to measure |
|----|----------------|
| AC-017, AC-018 | `npm run test:a11y:check -- tests/accessibility/copy-ticket-id-button.test.tsx` -> passes |
| coverage gate | `npm run test:a11y` -> passes, including the 90% coverage threshold |

---

### TASK-004 (optional, environment-gated): Playwright E2E for real clipboard and layout

**Scope:** frontend (tests only)

**Owned Paths:**

- `tests/e2e/copy-ticket-id.spec.ts` (new)

> Prerequisites: Postgres reachable via `.env.local`, seeded data (`npm run seed`), with at least one pending-approval ticket visible at `/manager`. `playwright.config.ts` starts `npm run dev` automatically unless `BASE_URL` is set. Only the chromium project exists. There is no existing `/manager` spec. The flow is: open `/manager`, select the first sidebar ticket, wait for the h1.
>
> For the 50-char case, intercept the `tickets.getById` tRPC response with `page.route` and replace `ticket_number` with a 50-char string. The exact request URL/batch format must be confirmed from `lib/trpc/client` before writing the route matcher; do not guess it.

**Acceptance Criteria:**

- [ ] AC-019 (AC-3 real clipboard): `context.grantPermissions(["clipboard-read","clipboard-write"])`, click the button, `navigator.clipboard.readText()` in the page equals the h1 text with the emoji, "Ticket" and `#` stripped
- [ ] AC-020 (AC-17): the `boundingBox()` of the button, h1 and "Pending Approval" badge before the click equal the boxes in the "Copied" state, within ±1 px
- [ ] AC-021 (AC-18): at 375x812 and 1280x800 with a 50-char `ticket_number`, the header card's `scrollWidth <= clientWidth` and the h1, button and badge boxes do not intersect

**Verification:**

| AC | How to measure |
|----|----------------|
| AC-019..AC-021 | `npm run test:e2e -- tests/e2e/copy-ticket-id.spec.ts` -> passes (needs DB + seed) |
| fallback if no DB | Manual check in Chrome DevTools at 375x812 and 1280x800 (edit the h1 text to 50 chars, click copy, compare layout); record the result in the PR |

## AC traceability (spec -> plan)

| Spec AC | Plan AC(s) | Task |
| ------- | ---------- | ---- |
| AC-1 | AC-001 | TASK-001 |
| AC-2 | AC-013 | TASK-002 |
| AC-3 | AC-002, AC-019 | TASK-001, TASK-004 |
| AC-4 | AC-003, AC-016 | TASK-001, TASK-002 |
| AC-5 | AC-004 | TASK-001 |
| AC-6 | AC-004 | TASK-001 |
| AC-7 | AC-005 | TASK-001 |
| AC-8 | AC-006 | TASK-001 |
| AC-9 | AC-007 | TASK-001 |
| AC-10 | AC-015 | TASK-002 |
| AC-11 | AC-008, AC-018 | TASK-001, TASK-003 |
| AC-12 | AC-009 | TASK-001 |
| AC-13 | AC-010, AC-018 | TASK-001, TASK-003 |
| AC-14 | AC-009 | TASK-001 |
| AC-15 | AC-017 | TASK-003 |
| AC-16 | AC-014 | TASK-002 |
| AC-17 | AC-020 (+ grid-stacked label in TASK-001 step 1) | TASK-004 / manual |
| AC-18 | AC-021 (+ wrap classes in TASK-001 step 2) | TASK-004 / manual |
| AC-19 | AC-003, AC-016 | TASK-001, TASK-002 |
| NFR (unmount, no logging, no deps, 24 px) | AC-011, AC-018 | TASK-001, TASK-003 |

## Implementation Phases

> Execution mode: **single-agent** (sequential: TASK-001 -> TASK-002 -> TASK-003 -> TASK-004)

### Phase 1: DB / Schema

- [ ] None. No migrations (frontend-only per spec Non-goals).

### Phase 2: Backend

- [ ] None. No tRPC/router changes.

### Phase 3: Frontend (TASK-001)

- [ ] `app/_components/TicketDetailPanel/CopyTicketIdButton.tsx`: new client component (state, timers, clipboard, live region)
- [ ] `app/_components/TicketDetailPanel/TicketHeader.tsx`: render `<CopyTicketIdButton key={ticketNumber} ... />` after the h1; wrap/overflow classes

### Phase 4: Tests (TASK-001 .. TASK-004)

- [ ] `app/_components/TicketDetailPanel/__tests__/CopyTicketIdButton.test.tsx` + additions to `TicketHeader.test.tsx`
- [ ] `app/_components/TicketDetailPanel/__tests__/index.copyTicketId.test.tsx`
- [ ] `tests/accessibility/copy-ticket-id-button.test.tsx`
- [ ] `tests/e2e/copy-ticket-id.spec.ts` (optional, needs DB + seed)

### Full verification (run before handing off)

```bash
npm run type
npm run lint
npm run lint:a11y
npm run test:unit
npm run test:int
npm run test:a11y          # includes 90% a11y coverage gate
npm run test:e2e -- tests/e2e/copy-ticket-id.spec.ts   # optional: needs Postgres + `npm run seed` + .env.local
```

## Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| `userEvent.setup()` (v14) installs its own `navigator.clipboard` stub and replaces a mock defined earlier | Define or spy on `navigator.clipboard.writeText` after `userEvent.setup()` (or use `fireEvent.click` for pure-mock tests). Restore `navigator.clipboard` in `afterEach` |
| Fake timers + user-event hang | `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })`; wrap timer advances in `act` |
| Using `Button`'s `isPending`/`disabled` breaks focus retention and adds a second `role="status"` | Explicitly forbidden in TASK-001 step 1 |
| A late `writeText` settle after a ticket switch or unmount shows stale feedback | `key={ticketNumber}` remount plus a mounted-ref guard before setState |
| Broad existing text matchers (`/TKT-12345/i`, `/HIGH/i`, `/Priority:/i`, `/Ticket #TCK-12345/`, `/Pending Approval/`) break if the button text or region repeats them | Button/region text must not include the ticket number, "priority", "high" or "Ticket #". The button must not sit inside the h1 |
| A11y coverage threshold (90% over `app/_components`) fails on the new file | TASK-003 exercises all branches |
| Live region added at the same time as its content may not be announced | The region is always mounted (empty when idle); only its text changes |
| Header layout regressions at 375 px with a 50-char ID | `flex-wrap`, `min-w-0`, `break-all`. Verified by TASK-004 or manually |
| E2E needs DB + seed; no `/manager` e2e precedent | TASK-004 is optional and environment-gated, with a documented manual fallback |
| Lint `import/order` errors | Follow the group order in `eslint.config.mjs`; run `npm run lint:fix` |

## Out of Scope

- Copying the UUID or any other field (D1); toast feedback (D2); `execCommand` fallback (D3); copy buttons on other surfaces (D6)
- Changes to `components/ui/button.tsx`, `Toast`, `index.tsx`, tRPC, DB
- New npm dependencies (icon, toast or clipboard libraries)

## Architecture Notes

- No `CLAUDE.md`/`AGENTS.md`/`insights/` exist in the repo. Conventions come from `README.md`, `eslint.config.mjs` (jsx-a11y errors, `import/order`) and the jest configs.
- Colocation: the button is used only by the ticket detail panel, so it lives in `app/_components/TicketDetailPanel/`, not in `components/ui/` or the root `hooks/`. The clipboard/timer logic stays inside the component; extract a hook only if it grows beyond one consumer.
- Client boundary: `index.tsx` is already `"use client"`. Mark `CopyTicketIdButton.tsx` `"use client"` explicitly, since it uses state and the browser API.
- Untrusted input: render `ticketNumber` as React text only; write with `writeText` (plain text). No `dangerouslySetInnerHTML`.
- Test config facts:
  - Unit `testMatch`: `{lib,components,app}/**/__tests__/**/*.test.{ts,tsx}`.
  - A11y `testMatch`: `tests/accessibility/**/*.test.{ts,tsx}`.
  - `jest.setup.js` loads jest-dom and jest-axe but has no clipboard mock.
