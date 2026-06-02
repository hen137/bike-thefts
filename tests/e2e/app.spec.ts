import { test, expect } from "@playwright/test";

test.describe("App loads", () => {
  test("page title contains Toronto or Bike", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/toronto|bike/i);
  });

  test("Leaflet map container is visible", async ({ page }) => {
    await page.goto("/");
    const map = page.locator(".leaflet-container");
    await expect(map).toBeVisible({ timeout: 15000 });
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });
});
