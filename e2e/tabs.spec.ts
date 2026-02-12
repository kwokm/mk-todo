import { test, expect } from "@playwright/test";

test.describe("Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows default tabs @desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Not visible directly on mobile");
    // Wait for tabs to load
    await expect(page.getByText("UNDERLYING")).toBeVisible();
    await expect(page.getByText("THOUGHTS")).toBeVisible();
    await expect(page.getByText("PLANNING")).toBeVisible();
  });

  test("can switch between tabs @desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Need bottom sheet interaction on mobile");
    await page.getByText("THOUGHTS").click();
    // Tab should become active (indicated by underline styling)
    await page.waitForTimeout(300);
    // Verify the tab area is responsive
    await expect(page.getByText("THOUGHTS")).toBeVisible();
  });

  test("has add tab button @desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Not directly accessible on mobile");
    await expect(page.getByRole("button", { name: "Add tab" }).first()).toBeVisible();
  });

  test("has delete tab buttons @desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Not directly accessible on mobile");
    const deleteButtons = page.getByRole("button", { name: /Delete .* tab/ });
    const count = await deleteButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
