import { test, expect } from "@playwright/test";

/**
 * E2E Test: Customer UI - Basic Smoke Tests
 *
 * These tests verify basic UI functionality without requiring AI API keys.
 * Full workflow tests with AI processing are disabled until API keys are configured.
 */
test.describe("Customer UI - Smoke Tests", () => {
  test("should load home page and display form", async ({ page }) => {
    // Navigate to home page
    await page.goto("/");

    // Verify page title
    await expect(page).toHaveTitle(/AI Customer Support/);

    // Verify main heading
    await expect(page.locator("h1")).toContainText("AI Customer Support");

    // Verify form elements are present
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="subject"]')).toBeVisible();
    await expect(page.locator('[name="body"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-ticket"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="scenario-dropdown"]'),
    ).toBeVisible();
  });

  test("should auto-fill form from dropdown selection", async ({ page }) => {
    // Navigate to home page
    await page.goto("/");

    // Select demo scenario from dropdown
    await page.selectOption('[data-testid="scenario-dropdown"]', {
      label: "😊 Обычный вопрос - о продукте",
    });

    // Wait for form to be auto-filled
    await page.waitForTimeout(500);

    // Verify form fields are populated
    const emailInput = page.locator('[name="email"]');
    const subjectInput = page.locator('[name="subject"]');
    const bodyInput = page.locator('[name="body"]');

    await expect(emailInput).toHaveValue(/.*@.*\..*/); // Valid email format
    await expect(subjectInput).toHaveValue(/./); // Not empty
    await expect(bodyInput).toHaveValue(/./); // Not empty
  });

  test("should have submit button enabled when form is filled", async ({
    page,
  }) => {
    // Navigate and fill form
    await page.goto("/");
    await page.selectOption('[data-testid="scenario-dropdown"]', {
      label: "😊 Обычный вопрос - о продукте",
    });

    // Wait for auto-fill
    await page.waitForTimeout(500);

    // Verify submit button is enabled
    await expect(page.locator('[data-testid="submit-ticket"]')).toBeEnabled();
  });
});

/**
 * Full E2E workflow tests are commented out until AI API keys are configured
 *
 * To enable full testing:
 * 1. Set OPENAI_API_KEY in .env
 * 2. Set PINECONE_API_KEY in .env
 * 3. Set HUGGINGFACE_API_KEY in .env
 * 4. Run database migrations
 * 5. Seed database with test data
 *
 * Then uncomment the tests below.
 */

/*
test.describe("Customer Flow - Full Workflow (requires API keys)", () => {
  test("should auto-resolve product compatibility question", async ({ page }) => {
    // Full AI workflow test
    // ...
  });
});
*/
