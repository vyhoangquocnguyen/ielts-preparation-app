import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/IELTS/);
});

test("can navigate to speaking page", async ({ page }) => {
  await page.goto("/");

  // Check if we can navigate to speaking or if the page loads
  // Since authentication might be required, we expect to either see the page or be redirected/prompted.
  // For a basic smoke test on public pages or checking generic load:
  const response = await page.goto("/speaking");
  expect(response?.ok()).toBeTruthy();
});
