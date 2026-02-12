import { test, expect } from "@playwright/test";

test.describe("Calendar View", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for calendar to load
    await page.waitForSelector(".font-heading");
  });

  test("displays day columns with day names", async ({ page }) => {
    const dayHeaders = page.locator(".font-heading");
    const count = await dayHeaders.count();
    expect(count).toBeGreaterThan(0);
  });

  test("highlights today with purple accent", async ({ page }) => {
    // Today's column header should have purple color
    const todayHeader = page.locator('.font-heading.text-\\[\\#9333ea\\]');
    await expect(todayHeader).toBeVisible();
  });

  test("shows correct number of columns based on viewport @desktop", async ({ page, browserName }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop only");
    const dayHeaders = page.locator(".font-heading");
    await expect(dayHeaders).toHaveCount(5);
  });

  test("shows correct number of columns based on viewport @tablet", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "tablet", "Tablet only");
    const dayHeaders = page.locator(".font-heading");
    await expect(dayHeaders).toHaveCount(3);
  });

  test("shows single column on mobile @mobile", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile only");
    const dayHeaders = page.locator(".font-heading");
    await expect(dayHeaders).toHaveCount(1);
  });
});
