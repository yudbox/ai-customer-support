# Plan: Resolution character counter

> Status: DRAFT
> Created: 2026-10-11
> Spec: specs/SPEC-2026-10-11-resolution-char-counter.md
> Execution Mode: single-agent

## Requirements (VRF)

> Status: Confirmed. The caller told the planner not to ask the user. The open questions Q-1 to Q-4 are resolved with the spec's stated defaults. They are recorded under "Open Questions & Recommendations" and "Risks & Mitigations" so they are easy to revisit.

| ID  | Requirement | Source |
| --- | ----------- | ------ |
| R1  | One exported constant `RESOLUTION_MAX_LENGTH = 5000` drives the editor's `maxLength`, the counter limit, the truncation length and the panel's over-limit check. No other resolution `5000` literal exists in non-test code under `app/_components/TicketDetailPanel/`. | SPEC AC-1 |
| R2  | The resolution `<textarea>` has `maxlength="5000"`, set by passing `maxLength={RESOLUTION_MAX_LENGTH}` to the shared `Textarea` without `label` or `showCharCount`. | SPEC AC-2 |
| R3  | Pasting past the limit is truncated natively to 5000 characters, and the counter shows "5000 / 5000" in the limit-reached state. | SPEC AC-3 |
| R4  | "Use AI Solution" with a suggestion longer than 5000 calls `onResolutionChange(suggestedSolution.slice(0, RESOLUTION_MAX_LENGTH))`. | SPEC AC-4 |
| R5  | "Use AI Solution" with a suggestion of 5000 characters or fewer passes the suggestion through unchanged. No notice is shown. | SPEC AC-5 |
| R6  | After a truncating "Use AI Solution", a visible notice ("AI solution shortened to 5000 characters") is shown next to the counter and announced through the polite live region. It disappears on the next edit or on "Write Custom". | SPEC AC-6 |
| R7  | "Write Custom" still calls `onResolutionChange("")`. With empty text the footer shows "⚠️ Resolution required". | SPEC AC-7 |
| R8  | When `resolutionText.length > 5000` (for example after a similar-ticket selection), the editor shows "<L> / 5000" in red with an "Over limit" label. The panel disables Approve while the length is over 5000. | SPEC AC-8 |
| R9  | When the trimmed text is non-empty, the footer shows "<used> / <limit>" in place of "✓ N characters". | SPEC AC-9 |
| R10 | When the text is empty or whitespace-only, the footer shows "⚠️ Resolution required" with `text-red-500` (unchanged) and no counter. | SPEC AC-10 |
| R11 | State classification: normal when L ≤ 4500, warning when 4501 ≤ L ≤ 4999, limit reached when L ≥ 5000 (over limit when L > 5000). | SPEC AC-11 |
| R12 | L is `resolutionText.length`: UTF-16 code units, untrimmed, newlines and whitespace included. | SPEC AC-12 |
| R13 | Each state is shown through text as well as color. Normal is neutral with no label. Warning is orange with "Approaching limit". Limit reached is red with "Limit reached" (or "Over limit" when L > M). | SPEC AC-13 |
| R14 | A single always-mounted `aria-live="polite"` region announces each state change once, using only counts and fixed labels. | SPEC AC-14 |
| R15 | The live-region text does not change between keystrokes that stay in the same state. | SPEC AC-15 |
| R16 | The textarea's `aria-describedby` references the counter element id, plus the notice id while the notice is shown. | SPEC AC-16 |
| R17 | The textarea has the accessible name "Resolution". | SPEC AC-17 |
| R18 | The counter text and the warning and limit labels meet a contrast of at least 4.5:1 on white. | SPEC AC-18 |
| R19 | The shared `Textarea`, the TicketForm suites, the ApproveModal suites and the existing panel suites stay green with no diff to their files. | SPEC AC-19 |

### Gaps found (VRF 0b)

- GAP-1 (red flag): AC-10 keeps `text-red-500` for "⚠️ Resolution required". Tailwind `red-500` on white is about 3.8:1, below AA. The spec's NFR asks for zero jest-axe violations in all four states. jsdom cannot evaluate `color-contrast`, so jest-axe will not catch this, but a real-browser axe run would. AC-18 only covers the counter and its labels, so the required message is out of AC-18's scope.
- GAP-2: Both panel test files mock `ActionButtons` without forwarding `isApproveDisabled` (`app/_components/TicketDetailPanel/__tests__/index.test.tsx:105-122` and `tests/integration/components/ticket-detail-panel-index.test.tsx:65-90`). Those files must stay unchanged, so AC-8's "panel test: Approve disabled" needs a new test file.
- GAP-3: `handleApprove` (`index.tsx:66-71`) guards only on `!resolutionText.trim()`. If only the button's `disabled` state blocks approval, over-limit text could still be approved through any path that calls the handler.
- GAP-4: The spec does not say whether the truncation notice clears when the parent replaces the text (a similar-ticket selection).
- GAP-5: AC-14 lists the transitions to announce but not Required to Normal (the first typed character). Announcing it would add noise.
- GAP-6: The repo has no Playwright coverage of the ticket detail panel (`tests/e2e/` holds only `customer-low-priority.spec.ts`). The AC-2 and AC-3 E2E checks need a running app with a seeded pending ticket.
- GAP-7: Shared `Textarea` writes its own `aria-describedby` (`components/ui/textarea.tsx:78`) before `{...props}` (line 79). A caller value replaces the error id rather than merging with it. The editor passes no `error`, so this is harmless today, but it is a latent trap.

## Open Questions & Recommendations

| #   | Question | Answer (applied in this plan) | Type |
| --- | -------- | ----------------------------- | ---- |
| Q-1 | Exact copy for the labels, notice and announcement. | ASSUMPTION: use the spec placeholders verbatim. Labels: "Approaching limit", "Limit reached", "Over limit". Notice: "AI solution shortened to 5000 characters", with 5000 interpolated from the constant. Announcement: "<Label>: <L> of <M> characters used". The warning-to-normal announcement is "Within limit: <L> of <M> characters used". Keep all copy in one place (TASK-002) so it is a one-line change later. | gap (spec Q-1) |
| Q-2 | Drop a trailing lone surrogate after the slice? | ASSUMPTION: no. Use a plain `slice(0, RESOLUTION_MAX_LENGTH)`, the spec default. | gap (spec Q-2) |
| Q-3 | Visible label or only `aria-label`? | PLANNER DECISION: `aria-label="Resolution"` on the textarea, with no visual change. Passing `label` to the shared `Textarea` would add a second visible "Resolution" label under the existing "✍️ Resolution" heading. `aria-labelledby` pointing at the heading would include the emoji in the name. To revisit: switch to the shared `label` prop or a `<label htmlFor>`. | gap (spec Q-3) |
| Q-4 | Truncate over-limit similar-ticket text as well? | ASSUMPTION: no. Similar-ticket text over the limit is not truncated. The editor shows it as over limit (AC-8) and the panel disables Approve. | gap (spec Q-4) |
| G-2 | How to test AC-8 at panel level without editing the protected panel tests? | Add a new test file, `app/_components/TicketDetailPanel/__tests__/index.resolution-limit.test.tsx`, whose `ActionButtons` mock renders `disabled={isApproveDisabled}`. | gap |
| G-3 | Guard approval in `handleApprove` as well? | Recommendation: yes. Also return early when the length is over `RESOLUTION_MAX_LENGTH`. This is defense in depth with no behavior change for valid text. | recommendation |
| G-4 | Clear the notice when the parent replaces the text? | Recommendation: derive visibility. Store the truncated string in local state and show the notice only while `resolutionText === truncatedValue`. This clears it on edit, on "Write Custom" and on similar-ticket selection without extra wiring. Also reset the stored value in the change and "Write Custom" handlers. | recommendation |
| G-5 | Announce Required to Normal? | No. Announce only the transitions AC-14 lists among normal, warning, limit and over. Entering or leaving Required clears the remembered state without announcing it. | recommendation |
| G-1 | Contrast of `text-red-500` in the required state. | Kept as is, because AC-10 and the protected assertions require it. Recorded as a risk. Counter colors are chosen to pass AA (see Architecture Notes). | red flag |

## Affected Modules

| Module | Path | Change Type |
| ------ | ---- | ----------- |
| shared constants | `lib/constants/resolution.ts` (new; `lib/constants/` currently holds only `ticket-scenarios.ts`) | Add |
| frontend: resolution editor | `app/_components/TicketDetailPanel/ResolutionEditor.tsx` | Modify |
| frontend: ticket detail panel | `app/_components/TicketDetailPanel/index.tsx` (Approve-disabled at line 198, `handleApprove` at lines 66-71) | Modify |
| unit tests | `app/_components/TicketDetailPanel/__tests__/ResolutionEditor.test.tsx` | Modify |
| unit tests (new panel test) | `app/_components/TicketDetailPanel/__tests__/index.resolution-limit.test.tsx` | Add |
| integration tests | `tests/integration/components/resolution-editor.test.tsx` | Modify |
| a11y tests | `tests/accessibility/resolution-editor.test.tsx` (new; no editor a11y test exists today) | Add |
| E2E | `tests/e2e/resolution-char-counter.spec.ts` (new) | Add |

### Verified facts (checked against the code, not the spec)

- `ResolutionEditor.tsx` has 63 lines and no `"use client"` directive. It inherits the client boundary from `index.tsx:1`.
  - "Use AI Solution" is `onClick={() => onResolutionChange(suggestedSolution)}` at line 23.
  - "Write Custom" is `onResolutionChange("")` at line 31.
  - `Textarea` is at lines 40-46, with no `maxLength`, `id` or `aria-*`.
  - The footer span is at lines 47-59: `text-green-600 font-medium`, or `text-red-500`.
  - The `` `✓ ${resolutionText.length} characters` `` template is at line 56; "⚠️ Resolution required" is at line 57.
- `index.tsx`:
  - State: `useState("")` at line 27.
  - `handleSelectSimilarTicket` calls `setResolutionText(resolution)` at lines 98-99.
  - `<ResolutionEditor ... onResolutionChange={setResolutionText}>` at lines 184-188.
  - **Approve-disabled condition: `isApproveDisabled={!resolutionText.trim()}` at line 198.** This matches the spec.
  - `handleApprove` checks only `trim()`, at lines 66-71.
- `components/ui/textarea.tsx`:
  - It uses `forwardRef`.
  - `id` falls back to a slug of `label`, so it is `undefined` without `label`.
  - The built-in counter renders only when `label && showCharCount && maxLength` (lines 36-59).
  - `maxLength` is forwarded to the native element (line 76).
  - `aria-describedby` at line 78 is overridden by `{...props}` at line 79.
- `RESOLUTION_PREVIEW_LENGTH = 200` is exported from `ApproveModal.tsx:7`. It is left untouched (non-goal).
- The test line numbers in the spec match the current files. See TASK-004 and TASK-005 for exact lines.

### Commands (from `package.json`; npm, `package-lock.json`)

| Purpose | Command |
| ------- | ------- |
| Typecheck | `npm run type` (`tsc --noEmit`; there is no `typecheck` script) |
| Lint | `npm run lint`; a11y lint: `npm run lint:a11y` |
| Unit tests | `npm run test:unit` (single file: `npm run test:unit -- <path>`) |
| Integration tests | `npm run test:int` (single file: `npm run test:int -- <path>`) |
| A11y tests | `npm run test:a11y:check` (single file: `npm run test:a11y:check -- <path>`) |
| Everything Jest | `npm run test:all` |
| E2E | `npm run test:e2e -- tests/e2e/resolution-char-counter.spec.ts` (needs the app at `BASE_URL`, default `http://localhost:3000`, plus a DB with a pending-approval ticket) |

The repo has no `CLAUDE.md`, `AGENTS.md` or `insights/`. Conventions come from `README.md`:

- Unit tests live in colocated `__tests__`, integration tests in `tests/integration`, and a11y tests (jest-axe) in `tests/accessibility`.
- The target is WCAG 2.1 AA.
- The pre-push hook enforces 70% coverage and the a11y tests.

## Tasks

### TASK-001: Shared resolution-limit constant

**Scope:** frontend

**Owned Paths:**

- `lib/constants/resolution.ts` (new)

**Steps:**

1. Create `lib/constants/resolution.ts`.
   - Export `RESOLUTION_MAX_LENGTH = 5000`.
   - Export `RESOLUTION_WARNING_RATIO = 0.9`.
   - Use UPPER_SNAKE_CASE with `as const` or plain `const`, and add a short doc comment.
   - It must have no React import, so both `index.tsx` and `ResolutionEditor.tsx` can import it as `@/lib/constants/resolution`.
2. Do not touch `lib/validations/ticket-form-schema.ts`, `app/_components/TicketForm.tsx` or `lib/langgraph/agents/intake.ts`. Their 5000 literals are out of scope (spec non-goal, A-1).

**Acceptance Criteria:**

- [ ] AC-1 (part): `RESOLUTION_MAX_LENGTH` is exported with the value 5000 from a single module under `lib/constants/`.

**Verification:**

| AC | How to measure |
| -- | -------------- |
| AC-1 | `npm run type` passes. The unit test in TASK-004 imports `RESOLUTION_MAX_LENGTH` and asserts `maxlength` equals `String(RESOLUTION_MAX_LENGTH)`. |

---

### TASK-002: ResolutionEditor counter, limit, truncation and a11y

**Scope:** frontend

**Owned Paths:**

- `app/_components/TicketDetailPanel/ResolutionEditor.tsx`

**Steps:**

1. Add `"use client"` at the top, because the component now uses hooks. Keep the props interface unchanged (`resolutionText`, `onResolutionChange`, `suggestedSolution?`), per the spec's Contracts section.
2. Import `RESOLUTION_MAX_LENGTH` and `RESOLUTION_WARNING_RATIO` from `@/lib/constants/resolution`. Add no `5000` literal anywhere in the file.
3. Add module-level pure helpers (not hooks).
   - `getCounterState(length, limit)` returns `"normal" | "warning" | "limit" | "over"`.
     - Use integer-safe comparisons. Compute the warning threshold as `Math.floor(limit * RESOLUTION_WARNING_RATIO)`, which is 4500.
     - normal: `L <= threshold`. warning: `threshold < L < limit`. limit: `L === limit`. over: `L > limit`.
     - This follows AC-11, and AC-8 for "over".
   - Put all copy in one `const` map, to keep Q-1 easy to revisit:
     - labels: warning "Approaching limit", limit "Limit reached", over "Over limit", normal none
     - announcement builder: `` `${label}: ${L} of ${M} characters used` ``, using "Within limit" for normal
     - notice builder: `` `AI solution shortened to ${M} characters` ``
4. "Use AI Solution" handler (AC-4, AC-5, AC-6).
   - If `suggestedSolution.length > RESOLUTION_MAX_LENGTH`:
     - call `onResolutionChange(suggestedSolution.slice(0, RESOLUTION_MAX_LENGTH))`. This is a plain slice (Q-2 assumption).
     - store the truncated string in local state `truncatedValue`.
     - set the live-region text to the notice plus the state announcement.
   - Otherwise call `onResolutionChange(suggestedSolution)` unchanged and clear `truncatedValue`.
   - The button stays conditional on `suggestedSolution`, as today.
5. Notice visibility (AC-6, recommendation G-4).
   - Render the notice only while `truncatedValue !== null && resolutionText === truncatedValue`.
   - Also clear `truncatedValue` in the textarea `onChange` handler and in the "Write Custom" handler. "Write Custom" still calls `onResolutionChange("")` (AC-7).
   - Give the notice a stable id from `useId()`.
6. Textarea (AC-2, AC-16, AC-17).
   - Pass `maxLength={RESOLUTION_MAX_LENGTH}`.
   - Pass `aria-label="Resolution"` (Q-3 decision).
   - Pass `aria-describedby` = the footer status id, plus the notice id while the notice is visible.
   - Do NOT pass `label`, `showCharCount` or `error` to the shared `Textarea`. This keeps AC-19 and avoids the override in GAP-7.
   - Keep the `placeholder`, `rows={6}` and `className` as they are.
7. Footer (AC-9, AC-10, AC-13). Keep the `mt-2 flex items-center justify-between` row.
   - Required state, when `!resolutionText.trim()`: render the existing span exactly as today, with text "⚠️ Resolution required" and classes `text-xs text-red-500`.
     - Add only the stable `id` attribute.
     - Add no child elements, so `getByText("⚠️ Resolution required")` still resolves to the element that carries `text-red-500`.
   - Counter state: a wrapper element with the same stable id containing:
     - (a) a span with exactly `` `${L} / ${M}` `` as its only text, so `getByText("11 / 5000")` matches. Mark it `aria-hidden="true"`.
     - (b) an `sr-only` span with `` `${L} of ${M} characters` `` (AC-16 "on demand" phrasing).
     - (c) when the state is warning, limit or over: a visible label span with the matching copy.
   - The color class follows the state (see Architecture Notes):
     - normal: `text-gray-600`
     - warning: `text-orange-700 font-medium`
     - limit or over: `text-red-700 font-medium`
   - Remove the `text-green-600` and "✓" rendering completely.
   - Render the notice, when visible, in the same footer row as visible text, for example `text-gray-700` or `text-orange-700`.
8. Live region (AC-14, AC-15, recommendation G-5).
   - Render one always-mounted element: `<div aria-live="polite" role="status" className="sr-only">`. It is separate from the counter, and the counter itself is not live.
   - Track the previous counter state in a `useRef`.
   - In a `useEffect` keyed on the derived state (not on `L`), set the announcement only when the state changes between normal, warning, limit and over.
   - When the text becomes trim-empty (Required), reset the ref to `null` without announcing. The first non-Required state after Required is stored silently.
   - The announcement contains only counts and fixed labels, never user text (Untrusted inputs section).
9. Leave the "✍️ Resolution" heading and the buttons markup unchanged. Add no `dangerouslySetInnerHTML`.

**Acceptance Criteria:**

- [ ] AC-1: the editor's `maxLength`, counter limit and slice length all reference `RESOLUTION_MAX_LENGTH`. `grep -n "5000" app/_components/TicketDetailPanel/ResolutionEditor.tsx` returns nothing.
- [ ] AC-2: the textarea renders `maxlength="5000"`.
- [ ] AC-3: after a native truncation the counter shows "5000 / 5000" with "Limit reached" (logic covered at unit level; browser behavior covered in TASK-007).
- [ ] AC-4: a suggestion of 10000 characters leads to `onResolutionChange` being called with a 5000-character string.
- [ ] AC-5: a suggestion of 5000 or 100 characters is passed through unchanged, with no notice.
- [ ] AC-6: the notice is visible after a truncating click, is in `aria-describedby`, is announced politely, and is gone after a change event or "Write Custom".
- [ ] AC-7: "Write Custom" calls `onResolutionChange("")`. The required message is shown for `""`.
- [ ] AC-8 (editor part): `"A".repeat(6200)` shows "6200 / 5000" with "Over limit", in red.
- [ ] AC-9: "Hello world" shows "11 / 5000", and "✓ 11 characters" is absent.
- [ ] AC-10: `""` and `"   "` show "⚠️ Resolution required" with `text-red-500` and no "/ 5000".
- [ ] AC-11: 4500 is normal, 4501 and 4999 are warning, 5000 is limit reached.
- [ ] AC-12: "😀" counts as 2, "Hello\nWorld" as 11, "  abc  " as 7.
- [ ] AC-13: "Approaching limit" appears at 4600 and "Limit reached" at 5000. Neither appears at 100.
- [ ] AC-14: the live region changes only at threshold crossings.
- [ ] AC-15: rerendering at 4600, then 4601, then 4602 leaves the live-region text unchanged.
- [ ] AC-16: the textarea's `aria-describedby` contains the counter element's id.
- [ ] AC-17: `getByRole("textbox", { name: /resolution/i })` resolves.
- [ ] AC-18: the counter and labels use `text-gray-600`, `text-orange-700` and `text-red-700` (all at least 4.5:1 on white).

**Verification:**

| AC | How to measure |
| -- | -------------- |
| AC-1 to AC-17 | Covered by the tests in TASK-004, TASK-005 and TASK-006. `npm run type` and `npm run lint:a11y` pass. |
| AC-1 | Run `grep -rn "5000" app/_components/TicketDetailPanel --include=*.tsx --exclude-dir=__tests__`. Expect no matches. |
| AC-18 | Code review of the class names against the contrast table in Architecture Notes, plus the `@axe-core/playwright` color-contrast check in TASK-007. |

---

### TASK-003: Panel Approve-disabled for over-limit text, with a new panel test

**Scope:** frontend

**Owned Paths:**

- `app/_components/TicketDetailPanel/index.tsx`
- `app/_components/TicketDetailPanel/__tests__/index.resolution-limit.test.tsx` (new)

**Steps:**

1. In `index.tsx`, import `RESOLUTION_MAX_LENGTH` from `@/lib/constants/resolution`.
2. Derive one local boolean in the component body: `isResolutionInvalid = !resolutionText.trim() || resolutionText.length > RESOLUTION_MAX_LENGTH`.
3. Line 198: change `isApproveDisabled={!resolutionText.trim()}` to `isApproveDisabled={isResolutionInvalid}`. This extends the condition: empty OR over limit (spec Contracts section, AC-8).
4. Lines 66-71, `handleApprove`: return early on `isResolutionInvalid` instead of only `!resolutionText.trim()` (recommendation G-3).
5. Do NOT change `handleSelectSimilarTicket` (lines 98-101). Similar-ticket text is not truncated (Q-4 assumption).
6. Create `__tests__/index.resolution-limit.test.tsx`. Copy the `next/navigation`, tRPC and child-component mock setup from `__tests__/index.test.tsx`, with two differences:
   - The `ActionButtons` mock renders `<button data-testid="approve-button" disabled={isApproveDisabled} onClick={onApprove}>`.
   - The `SimilarTickets` mock has a button that calls `onSelectTicket(0, "A".repeat(RESOLUTION_MAX_LENGTH + 1200))`, plus one that calls it with exactly `RESOLUTION_MAX_LENGTH` characters.
7. Test cases:
   - Select the 6200-character similar resolution. Expect Approve to be disabled, and `handleApprove` not to open the modal (call `onApprove` directly via the mock).
   - Select 5000 characters. Expect Approve to be enabled.
   - With empty text, Approve is disabled. This repeats the existing behavior as a regression check.
   - Typing in the mocked textarea to shorten 6200 characters to 5000 re-enables Approve.

**Acceptance Criteria:**

- [ ] AC-8 (panel part): Approve is disabled while `resolutionText.length > RESOLUTION_MAX_LENGTH`, and enabled again at 5000 or fewer with non-blank text.
- [ ] AC-1 (part): the panel's limit check uses `RESOLUTION_MAX_LENGTH`, not a literal.
- [ ] AC-19 (part): `__tests__/index.test.tsx` and `tests/integration/components/ticket-detail-panel-index.test.tsx` pass with no diff.

**Verification:**

| AC | How to measure |
| -- | -------------- |
| AC-8 | `npm run test:unit -- app/_components/TicketDetailPanel/__tests__/index.resolution-limit.test.tsx` passes. |
| AC-19 | `npm run test:unit -- app/_components/TicketDetailPanel/__tests__/index.test.tsx` and `npm run test:int -- tests/integration/components/ticket-detail-panel-index.test.tsx` pass. `git diff --exit-code` on both files. |

---

### TASK-004: Update and extend the ResolutionEditor unit tests

**Scope:** frontend

**Owned Paths:**

- `app/_components/TicketDetailPanel/__tests__/ResolutionEditor.test.tsx`

**Steps:**

1. Replace the "✓ N characters" assertions with "<N> / ${RESOLUTION_MAX_LENGTH}". Import the constant; do not hardcode 5000.
   - `getByText` at lines 314, 333, 340, 346, 361, 370 (template), 661, 696 and 712.
   - The regex `/✓ \d+ characters/` at lines 381, 403, 410 and 474. Replace it with `/^\d+ \/ \d+$/`.
2. Replace the `text-green-600` assertions at lines 382 and 404 with the normal-state neutral class `text-gray-600`. Keep the matching `not.toHaveClass("text-red-500")` intent.
3. Rewrite "handles very long suggestedSolution" (lines 485-495, AC-4 conflict). Expect `onResolutionChange` to be called with `longSolution.slice(0, RESOLUTION_MAX_LENGTH)`, with length 5000.
4. Leave every "⚠️ Resolution required" / `text-red-500` assertion unchanged: lines 320, 326, 389, 396, 533, 655, 670 and 686. Also leave "displays very long resolution text" (lines 227-232) unchanged.
5. Add new `describe` blocks:
   - Limit attribute: `maxlength` equals `String(RESOLUTION_MAX_LENGTH)` (AC-1, AC-2).
   - Use AI Solution, three cases (AC-4, AC-5, AC-6):
     - 10000 characters: called with 5000 characters, notice visible, notice id in the textarea's `aria-describedby`, live region contains the notice text.
     - Exactly 5000 characters: called unchanged, no notice.
     - 100 characters: called unchanged, no notice.
     - Then rerender with a different `resolutionText`, or fire a change event, or click "Write Custom". Expect the notice to be gone.
   - Write Custom (AC-7): `onResolutionChange("")`.
   - Over limit (AC-8): 6200 characters shows "6200 / 5000", "Over limit" and the `text-red-700` class.
   - Thresholds (AC-11, AC-13):
     - 4500: normal, no label, `text-gray-600`.
     - 4501 and 4999: "Approaching limit", `text-orange-700`.
     - 5000: "Limit reached", `text-red-700`.
     - 100: neither label.
   - Length measure (AC-12): "😀" shows "2 / 5000", "Hello\nWorld" shows "11 / 5000", "  abc  " shows "7 / 5000".
   - Whitespace near the limit (edge case): `" ".repeat(4600)` shows "⚠️ Resolution required" and no counter.
   - Live region (AC-14, AC-15):
     - Rerender 4600, 4601, 4602: the `aria-live="polite"` text is unchanged.
     - Rerender 4500 then 4501: it changes to the warning announcement.
     - 4999 then 5000: it changes to the limit announcement.
     - 5000 then 4999: it changes back to warning.
     - 4501 then 4500: it changes to "Within limit".
     - 5000 then 6200: it changes to "Over limit".
     - Required ("") then "a": no announcement.
   - Accessible name and description (AC-16, AC-17):
     - `getByRole("textbox", { name: /resolution/i })`.
     - Its `aria-describedby` includes the counter element's id.
     - `toHaveAccessibleDescription(/11 of 5000 characters/)`.

**Acceptance Criteria:**

- [ ] AC-1, AC-2, AC-4 to AC-17 each have at least one passing unit test in this file. The tests are named with the spec AC id, for example `it("AC-11: 4501 is warning", ...)`.
- [ ] Spec "Existing tests affected": no "✓", "characters" (counter sense) or `text-green-600` assertions remain. The "Resolution required" assertions are unchanged.

**Verification:**

| AC | How to measure |
| -- | -------------- |
| all listed | `npm run test:unit -- app/_components/TicketDetailPanel/__tests__/ResolutionEditor.test.tsx` passes. |
| no stale assertions | `grep -nE "✓ |text-green-600" app/_components/TicketDetailPanel/__tests__/ResolutionEditor.test.tsx` returns nothing. |

---

### TASK-005: Update the ResolutionEditor integration tests

**Scope:** frontend

**Owned Paths:**

- `tests/integration/components/resolution-editor.test.tsx`

**Steps:**

1. Replace the "✓ N characters" assertions with "<N> / ${RESOLUTION_MAX_LENGTH}". Import the constant.
   - Lines 410, 425, 431, 437, 445, 451, 458, 558, 573, 584, 596, 651, 659, 672, 685, 689 and 695.
   - The regex at lines 416, 464, 663 and 676.
2. Line 417: replace `toHaveClass("text-green-600", "font-medium")` with the normal-state class `text-gray-600`.
3. Rewrite "should handle very long resolution text" (lines 576-585). With 10000 "A"s, expect "10000 / 5000" and "Over limit" (AC-8 over-limit display; the text is set programmatically, so `maxlength` does not clamp it).
4. Leave unchanged:
   - every "⚠️ Resolution required" assertion: lines 78, 381, 387, 393, 402, 465, 473, 590, 642, 649, 664 and 677.
   - the "✓ Issue resolved 🎉" typed-input text at lines 369-372. It is input data, not a counter assertion.
5. Check every `userEvent.type` / `fireEvent.change` scenario. Any that types more than 5000 characters through `userEvent` will now be clamped by `maxlength`. Adjust only the expectations, not the intent.
6. Add one integration flow:
   - Render with a stateful wrapper (`useState` driving `resolutionText`), and `suggestedSolution = "B".repeat(RESOLUTION_MAX_LENGTH + 10)`.
   - Click "Use AI Solution". Expect "5000 / 5000", "Limit reached" and the notice.
   - Type one key with `userEvent`. Expect the notice to be gone (AC-4, AC-6, AC-3 logic).

**Acceptance Criteria:**

- [ ] AC-8: the integration test at 10000 characters asserts "10000 / 5000" and "Over limit".
- [ ] AC-9 and AC-10: the counter replaces "✓ N characters". The required assertions are unchanged and pass.
- [ ] AC-4 and AC-6: the stateful flow test passes.

**Verification:**

| AC | How to measure |
| -- | -------------- |
| all listed | `npm run test:int -- tests/integration/components/resolution-editor.test.tsx` passes. |
| no stale assertions | `grep -nE "✓ [0-9$]|✓ \\\\d|text-green-600" tests/integration/components/resolution-editor.test.tsx` returns only the typed-input lines 369-372. |

---

### TASK-006: Accessibility test for the editor

**Scope:** frontend

**Owned Paths:**

- `tests/accessibility/resolution-editor.test.tsx` (new)

**Steps:**

1. Follow the pattern of the existing `tests/accessibility/*.test.tsx` files (jest-axe `axe` and `toHaveNoViolations`).
2. Render `ResolutionEditor` in five states: required (`""`), normal (11 characters), warning (4600), limit reached (5000) and over limit (6200). Expect `await axe(container)` to report no violations for each.
3. Assert the following:
   - an accessible name via `getByRole("textbox", { name: /resolution/i })`
   - `aria-describedby` points to an existing element
   - exactly one `[aria-live="polite"]` element exists
4. Note in a comment that jsdom cannot evaluate color contrast, so AC-18 is covered in TASK-007 and by code review.

**Acceptance Criteria:**

- [ ] Spec NFR "A11y": jest-axe reports zero violations in the required, normal, warning, limit-reached and over-limit states.
- [ ] AC-14 (part): a single polite live region exists.
- [ ] AC-16 and AC-17: the description and name resolve.

**Verification:**

| AC | How to measure |
| -- | -------------- |
| NFR A11y, AC-14, AC-16, AC-17 | `npm run test:a11y:check -- tests/accessibility/resolution-editor.test.tsx` passes. |

---

### TASK-007: E2E for native maxlength, paste and contrast

**Scope:** frontend

**Owned Paths:**

- `tests/e2e/resolution-char-counter.spec.ts` (new)

**Steps:**

1. Follow the setup in `tests/e2e/customer-low-priority.spec.ts` and `tests/e2e/README.md`. It needs a running app at `BASE_URL` and a seeded ticket in pending approval. The repo documents seed scripts in `package.json`; reuse them as `tests/e2e/README.md` describes.
2. Open the manager view and select a pending ticket.
3. Test cases:
   - Type or fill 4990 characters, then paste 50 characters (clipboard or `insertText`). Expect the value length to be 5000, the counter "5000 / 5000" and "Limit reached" (AC-3).
   - Typing past 5000 leaves the value at 5000 (AC-2).
   - Text with newlines near the limit: the counter and the stop point agree in Chromium (newline edge case in the spec).
   - Run `@axe-core/playwright` scoped to the resolution card, with `color-contrast` enabled, at 4600 and 5000 characters. Expect no contrast violations on the counter and labels (AC-18).
4. If no seeded data or environment is available, the implementer reports this task as BLOCKED with the reason. They must not stub the network to fake it.

**Acceptance Criteria:**

- [ ] AC-2: typing past the limit leaves the value at 5000 in Chromium.
- [ ] AC-3: pasting over the limit truncates to 5000, and the counter shows the limit-reached state.
- [ ] AC-18: axe color-contrast passes for the counter in the warning and limit-reached states.

**Verification:**

| AC | How to measure |
| -- | -------------- |
| AC-2, AC-3, AC-18 | `npm run test:e2e -- tests/e2e/resolution-char-counter.spec.ts` passes on Chromium. |

---

### TASK-008: Regression gate (read-only, no owned paths)

**Scope:** frontend

**Owned Paths:**

- none (verification only, no file edits)

**Steps:**

1. Run `npm run type`, `npm run lint`, `npm run lint:a11y` and `npm run test:all`.
2. Confirm that these files have no diff: `git diff --exit-code --` followed by each path below.
   - `components/ui/textarea.tsx`
   - `components/ui/__tests__/textarea.test.tsx`
   - `tests/accessibility/textarea-component.test.tsx`
   - `app/_components/TicketForm.tsx`
   - `app/_components/__tests__/TicketForm.test.tsx`
   - `tests/integration/components/ticket-form.test.tsx`
   - `tests/accessibility/ticket-form.test.tsx`
   - `lib/validations/ticket-form-schema.ts`
   - `app/_components/TicketDetailPanel/ApproveModal.tsx`
   - `app/_components/TicketDetailPanel/__tests__/ApproveModal.test.tsx`
   - `tests/integration/components/approve-modal.test.tsx`
   - `tests/accessibility/approve-reject-modals.test.tsx`
   - `app/_components/TicketDetailPanel/__tests__/index.test.tsx`
   - `tests/integration/components/ticket-detail-panel-index.test.tsx`
3. Confirm that coverage stays at 70% or above (the pre-push hook): `npm run test:coverage`.

**Acceptance Criteria:**

- [ ] AC-19: the shared Textarea, TicketForm, ApproveModal and panel suites are green with no diff to their files.
- [ ] AC-1: `grep -rn "5000" app/_components/TicketDetailPanel --include=*.tsx --exclude-dir=__tests__` returns no matches.

**Verification:**

| AC | How to measure |
| -- | -------------- |
| AC-19 | `npm run test:all` is green. `git diff --exit-code` on the listed files exits 0. |
| AC-1 | The grep above prints nothing. |

## Spec AC traceability

| Spec AC | Tasks |
| ------- | ----- |
| AC-1 | TASK-001, TASK-002, TASK-003, TASK-004, TASK-008 |
| AC-2 | TASK-002, TASK-004, TASK-007 |
| AC-3 | TASK-002, TASK-005, TASK-007 |
| AC-4, AC-5 | TASK-002, TASK-004, TASK-005 |
| AC-6 | TASK-002, TASK-004, TASK-005 |
| AC-7 | TASK-002, TASK-004 |
| AC-8 | TASK-002 (display), TASK-003 (Approve disabled), TASK-004, TASK-005 |
| AC-9, AC-10 | TASK-002, TASK-004, TASK-005 |
| AC-11, AC-12, AC-13 | TASK-002, TASK-004 |
| AC-14, AC-15 | TASK-002, TASK-004, TASK-006 |
| AC-16, AC-17 | TASK-002, TASK-004, TASK-006 |
| AC-18 | TASK-002, TASK-007 |
| AC-19 | TASK-003, TASK-008 |

## Implementation Phases

> Execution mode: **single-agent** (sequential). One module, frontend only, and tightly coupled. Owned paths still do not overlap between tasks.

### Phase 1: DB / Schema

- [ ] Not applicable. There are no schema, migration, tRPC or LangGraph changes (spec non-goal).

### Phase 2: Shared constant

- [ ] TASK-001: `lib/constants/resolution.ts`

### Phase 3: Frontend

- [ ] TASK-002: `app/_components/TicketDetailPanel/ResolutionEditor.tsx`
- [ ] TASK-003: `app/_components/TicketDetailPanel/index.tsx` and `__tests__/index.resolution-limit.test.tsx`

### Phase 4: Tests

- [ ] TASK-004: `__tests__/ResolutionEditor.test.tsx` (update and extend)
- [ ] TASK-005: `tests/integration/components/resolution-editor.test.tsx` (update)
- [ ] TASK-006: `tests/accessibility/resolution-editor.test.tsx` (new)
- [ ] TASK-007: `tests/e2e/resolution-char-counter.spec.ts` (new; environment-dependent)
- [ ] TASK-008: regression gate (`npm run type`, `npm run lint`, `npm run lint:a11y`, `npm run test:all`, and `git diff --exit-code` on the protected files)

Order: TASK-001, TASK-002, TASK-004, TASK-005, TASK-003, TASK-006, TASK-007, TASK-008.

## Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| ASSUMPTION Q-1: the placeholder copy may change. | All labels, the notice and the announcements live in one `const` map in `ResolutionEditor.tsx`. Tests assert the same strings, so a copy change touches that map plus the tests. |
| ASSUMPTION Q-2: a plain slice can leave a lone high surrogate at position 5000. | Accepted per the spec. If Q-2 is answered "drop it", change the single slice call in the "Use AI Solution" handler and add one unit test. |
| PLANNER DECISION Q-3: `aria-label` rather than a visible label. | Revisit if design wants a visible label. The alternative is a `<label htmlFor>` with the editor passing an explicit `id`. Do not use the shared `label` prop, which would render a second visible label row. |
| ASSUMPTION Q-4: similar-ticket text over the limit is not truncated, so the manager must shorten it manually while Approve is disabled. | The over-limit label and the red "<L> / 5000" make the reason visible. If Q-4 is answered "truncate", move the slice into `handleSelectSimilarTicket` in `index.tsx` and reuse the constant. |
| GAP-1: `text-red-500` for "Resolution required" is about 3.8:1, below AA. A real-browser axe run would flag it, but jest-axe in jsdom does not. | Kept because AC-10 and the protected assertions require it. TASK-007 scopes its axe contrast check to the counter states, not the required state. Raise a follow-up to change it to `red-600` or `red-700` together with the protected tests. |
| Tailwind palette version: contrast ratios assume the default palette. | TASK-007 checks AC-18 in a real browser. If a shade fails, step one shade darker. |
| Live-region announcements are flaky in some screen readers if the region mounts and fills at the same moment. | The region is always mounted, starting empty. Only its text changes. |
| The protected panel tests mock `ActionButtons` without `disabled`, so AC-8 is invisible there. | A new test file covers it (TASK-003). The existing files stay untouched. |
| The E2E environment is missing: no panel E2E exists yet, and it needs a DB and seed data. | AC-2 is also covered at unit level by the `maxlength` attribute, and AC-3's counter logic by a unit test. TASK-007 may be reported BLOCKED with the reason; it must not be faked. |
| Floating-point threshold: `0.9 * 5000` compared directly. | Use the integer threshold `Math.floor(limit * ratio)`. Unit tests at 4500 and 4501. |
| The shared `Textarea`'s `aria-describedby` overrides the error id (GAP-7). | The editor passes no `error`. This is documented in Architecture Notes for future changes. |
| Client-only enforcement (A-6): the API still accepts longer text. | Accepted non-goal. `handleApprove` gets a client-side guard (G-3). |

## Out of Scope

- Backend, tRPC `approve` schema, DB column, LangGraph and server-side enforcement.
- Migrating `TicketForm`, `ticketFormSchema` or `lib/langgraph/agents/intake.ts` to the new constant.
- Any change to the shared `Textarea` (`components/ui/textarea.tsx`).
- `RESOLUTION_PREVIEW_LENGTH` and ApproveModal preview truncation.
- Grapheme-aware counting, rich text, and surrogate-pair repair (Q-2).
- Changing the "Resolution required" color (GAP-1, follow-up only).

## Architecture Notes

- **Constant placement.** The constant goes in `lib/constants/resolution.ts`. `lib/constants/` is the repo's only generic constants directory (it holds `ticket-scenarios.ts`), and `@/lib/...` is the import alias used everywhere. The repo has no `app/**/constants.ts` precedent. The only component-exported constant is `RESOLUTION_PREVIEW_LENGTH` in `ApproveModal.tsx`. Putting the new constant in a component file would couple the panel to the editor module, so it stays in a React-free module.
- **Pure helpers.** `getCounterState` and the copy map stay module-level in `ResolutionEditor.tsx`, colocated with their only consumer per the frontend colocation rule. Move them to a separate file only if a second consumer appears.
- **Client boundary.** `ResolutionEditor.tsx` gains `"use client"` because it now uses `useState`, `useRef`, `useEffect` and `useId`. It is already rendered only under the `index.tsx` client boundary, so behavior does not change.
- **Shared Textarea.** It is used without `label`, `showCharCount` or `error`. Its counter therefore never renders (spec A-5) and its `aria-describedby` default is `undefined`, so the editor's value applies cleanly. The `id` fallback is `undefined` without `label`. The editor does not need a textarea id, because the link runs from the textarea to the counter (`aria-describedby`), not the other way.
- **Contrast on white, default Tailwind palette (approximate):**
  - `gray-600` #4b5563: about 7.6:1
  - `orange-700` #c2410c: about 5.2:1. `orange-600` #ea580c is about 3.6:1 and **fails**, so do not reuse the shared Textarea's `text-orange-600`.
  - `red-700` #b91c1c: about 6.5:1. `red-500` is about 3.8:1 and fails; it is kept only for the protected required message.
- **Selector stability for the existing tests.**
  - The required span keeps text-only children and `text-red-500`.
  - The counter's "<L> / <M>" text sits alone in its own element, so the exact `getByText("11 / 5000")` matches.
  - The "<L> of <M> characters" phrasing for screen readers lives in a sibling `sr-only` span. The visual "<L> / <M>" span is `aria-hidden`, so the description is not read twice.
- **Live region.** It is a separate `sr-only` element with `aria-live="polite"`, not the visible counter. Updates are keyed on state transitions, not on length (AC-15).
- **Untrusted text.** The resolution text is only measured, sliced and rendered through React escaping. Announcements contain only numbers and fixed labels.
