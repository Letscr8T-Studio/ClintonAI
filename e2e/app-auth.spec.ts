import { expect, test } from "@playwright/test";
import { axeViolations } from "./axe";

test.describe("Signed-in app", () => {
  test("sends signed-out visitors from the dashboard to sign in, remembering where they were", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
    await expect(page.getByRole("heading", { level: 1, name: "Sign in to Clinton AI" })).toBeVisible();
  });

  test("protects onboarding too", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login\?next=%2Fonboarding$/);
  });

  test("the sign-in page offers Google and is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("explains a cancelled sign-in", async ({ page }) => {
    await page.goto("/login?error=cancelled");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("cancelled");
  });

  test("sign-in pages are not indexed", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});
