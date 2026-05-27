import { test, expect } from "@playwright/test";

test.describe("UI controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .locator(".leaflet-container")
      .waitFor({ state: "visible", timeout: 15000 });
  });

  test("top bar controls are visible without scrolling", async ({ page }) => {
    // There should be some control bar visible in the viewport
    const topBar = page
      .locator(
        "header, nav, [role='toolbar'], [class*='top-bar'], [class*='TopBar']"
      )
      .first();
    await expect(topBar).toBeInViewport();
  });

  test("theme toggle switches html class between light and dark", async ({
    page
  }) => {
    const toggle = page
      .locator(
        "[aria-label*='theme' i], [aria-label*='dark' i], [aria-label*='light' i], button:has([data-lucide='sun']), button:has([data-lucide='moon'])"
      )
      .first();

    const htmlEl = page.locator("html");
    const before = await htmlEl.getAttribute("class");

    await toggle.click();

    const after = await htmlEl.getAttribute("class");
    expect(after).not.toBe(before);
  });

  test("tile switcher button is visible and clickable", async ({ page }) => {
    const tileSwitcher = page
      .locator(
        "[aria-label*='tile' i], [aria-label*='map style' i], button:has-text('OSM'), button:has-text('CartoDB'), [class*='TileSwitcher'], [class*='tile-switcher']"
      )
      .first();
    await expect(tileSwitcher).toBeVisible();
    // Clicking should not crash the app
    await tileSwitcher.click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });
});
