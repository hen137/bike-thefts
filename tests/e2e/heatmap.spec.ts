import { test, expect } from "@playwright/test";

test.describe("Heatmap rendering", () => {
  test("heatmap canvas layer is present in DOM", async ({ page }) => {
    await page.goto("/");
    // leaflet.heat renders a <canvas> inside .leaflet-overlay-pane
    const canvas = page.locator(".leaflet-overlay-pane canvas");
    await expect(canvas).toBeAttached({ timeout: 30000 });
  });

  test("loading spinner disappears after data loads", async ({ page }) => {
    await page.goto("/");
    // Spinner should not be visible once data has resolved
    const spinner = page
      .locator(
        "[data-testid='loading-spinner'], .loading-spinner, [aria-label*='loading' i]"
      )
      .first();
    // If spinner is present, wait for it to disappear
    const spinnerVisible = await spinner.isVisible().catch(() => false);
    if (spinnerVisible) {
      await expect(spinner).not.toBeVisible({ timeout: 60000 });
    }
    // Either way, the map should be ready
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });
});
