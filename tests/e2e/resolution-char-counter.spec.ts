import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

/**
 * E2E Test: Resolution character counter (manager view)
 *
 * Requires a running app (BASE_URL, default http://localhost:3000) and a
 * database seeded with at least one ticket in pending approval (`npm run seed`).
 */
const LIMIT = 5000;

async function openResolutionEditor(page: Page) {
  await page.goto("/manager");
  const firstTicket = page.getByRole("button", { name: /#\S+/ }).first();
  await expect(firstTicket).toBeVisible({ timeout: 15000 });
  await firstTicket.click();

  const textbox = page.getByRole("textbox", { name: "Resolution" });
  await expect(textbox).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /write custom/i }).click();
  await expect(textbox).toHaveValue("");
  return textbox;
}

test.describe("Resolution character counter", () => {
  test("pasting past the limit truncates to 5000 and shows limit reached", async ({
    page,
  }) => {
    const textbox = await openResolutionEditor(page);

    await textbox.fill("A".repeat(4990));
    await textbox.press("End");
    await page.keyboard.insertText("B".repeat(50));

    const value = await textbox.inputValue();
    expect(value.length).toBe(LIMIT);
    await expect(page.getByText(`${LIMIT} / ${LIMIT}`)).toBeVisible();
    await expect(page.getByText("Limit reached")).toBeVisible();
  });

  test("typing past the limit leaves the value at 5000", async ({ page }) => {
    const textbox = await openResolutionEditor(page);

    await textbox.fill("A".repeat(LIMIT - 5));
    await textbox.press("End");
    await textbox.pressSequentially("BBBBBBBBBB");

    expect((await textbox.inputValue()).length).toBe(LIMIT);
  });

  test("counter and native stop point agree with newlines near the limit", async ({
    page,
  }) => {
    const textbox = await openResolutionEditor(page);

    await textbox.fill(`${"A".repeat(4980)}\n`.repeat(1) + "B\n".repeat(10));
    await textbox.press("End");
    await page.keyboard.insertText("C".repeat(100));

    const length = (await textbox.inputValue()).length;
    expect(length).toBeLessThanOrEqual(LIMIT);
    await expect(page.getByText(`${length} / ${LIMIT}`)).toBeVisible();
  });

  for (const [label, length] of [
    ["warning", 4600],
    ["limit reached", LIMIT],
  ] as const) {
    test(`counter has no color-contrast violations in the ${label} state`, async ({
      page,
    }) => {
      const textbox = await openResolutionEditor(page);
      await textbox.fill("A".repeat(length));
      await expect(page.getByText(`${length} / ${LIMIT}`)).toBeVisible();

      const results = await new AxeBuilder({ page })
        .include("div.bg-white.rounded-lg.shadow:has(h2:text('Resolution'))")
        .withRules(["color-contrast"])
        .analyze();

      // The "Resolution required" message (text-red-500) is out of scope here;
      // it is not rendered in these states.
      expect(results.violations).toEqual([]);
    });
  }
});
