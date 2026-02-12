import { test, expect } from "@playwright/test";

test.describe("Desktop Layout", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop only");
    await page.goto("/");
  });

  test("shows week navigation buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Previous week" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next week" })).toBeVisible();
  });

  test("shows calendar and list sections stacked vertically", async ({ page }) => {
    // Calendar section should be visible
    await expect(page.locator(".font-heading").first()).toBeVisible();
    // Tab bar should be visible (desktop layout)
    await expect(page.getByText("UNDERLYING")).toBeVisible();
  });
});

test.describe("Mobile Layout", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile only");
    await page.goto("/");
  });

  test("shows bottom sheet with drag handle", async ({ page }) => {
    // Bottom sheet should be visible on mobile
    const sheet = page.locator(".rounded-t-xl");
    await expect(sheet).toBeVisible();
    // Drag handle (pill)
    const handle = page.locator(".rounded-full.bg-white\\/25");
    await expect(handle).toBeVisible();
  });

  test("hides week navigation buttons on mobile", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Previous week" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Next week" })).toBeHidden();
  });

  test("shows single day column", async ({ page }) => {
    const dayHeaders = page.locator(".font-heading");
    await expect(dayHeaders).toHaveCount(1);
  });

  test("shows tabs in bottom sheet", async ({ page }) => {
    // The bottom sheet should contain tabs
    const sheet = page.locator(".rounded-t-xl");
    await expect(sheet.getByText("UNDERLYING")).toBeVisible();
  });
});

test.describe("Tablet Layout", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "tablet", "Tablet only");
    await page.goto("/");
  });

  test("shows 3 day columns", async ({ page }) => {
    const dayHeaders = page.locator(".font-heading");
    await expect(dayHeaders).toHaveCount(3);
  });

  test("hides bottom sheet (uses desktop layout)", async ({ page }) => {
    // Bottom sheet is md:hidden, so should not be visible on tablet (768px)
    const sheet = page.locator(".rounded-t-xl");
    await expect(sheet).toBeHidden();
  });
});
