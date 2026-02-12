import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads the app with MK-TODO branding", async ({ page }) => {
    await expect(page.getByText("MK-")).toBeVisible();
    await expect(page.getByText("TODO")).toBeVisible();
  });

  test("has a TODAY button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /today/i })).toBeVisible();
  });

  test("has day navigation arrows", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Previous day" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next day" })).toBeVisible();
  });

  test("navigates forward with next day button", async ({ page }) => {
    // Get current day text
    const firstDay = page.locator(".font-heading").first();
    const initialText = await firstDay.textContent();
    
    await page.getByRole("button", { name: "Next day" }).click();
    // Wait for slide animation
    await page.waitForTimeout(500);
    
    const newText = await firstDay.textContent();
    // Day label should have changed
    expect(newText).not.toBe(initialText);
  });

  test("has a date picker button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Pick a date" })).toBeVisible();
  });

  test("opens calendar popover on date picker click", async ({ page }) => {
    await page.getByRole("button", { name: "Pick a date" }).click();
    // Calendar popover should appear
    await expect(page.locator("table")).toBeVisible();
  });
});
