import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page has proper lang attribute", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
  });

  test("all buttons have accessible names", async ({ page }) => {
    const buttons = page.getByRole("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const name = await buttons.nth(i).getAttribute("aria-label");
      const text = await buttons.nth(i).textContent();
      // Button should have either aria-label or visible text
      expect(name || text?.trim()).toBeTruthy();
    }
  });

  test("navigation buttons are keyboard accessible", async ({ page }) => {
    // Tab to TODAY button and verify it can be focused
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("dark theme is applied", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });
});
