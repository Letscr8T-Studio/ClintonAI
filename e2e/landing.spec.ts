import { expect, test } from "@playwright/test";
import { axeViolations } from "./axe";

test.describe("Landing page", () => {
  test("loads with the Clinton AI title and one h1", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Clinton AI/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("has no accessibility violations in a real browser, including colour contrast", async ({ page }) => {
    await page.goto("/");
    expect(await axeViolations(page)).toEqual([]);
  });

  test("validates the waitlist email without calling the API", async ({ page }) => {
    let apiCalled = false;
    await page.route("**/api/waitlist", (route) => {
      apiCalled = true;
      return route.abort();
    });
    await page.goto("/#join");
    await page.getByLabel("Your email", { exact: true }).fill("not-an-email");
    await page.getByRole("button", { name: "Join the waitlist" }).click();
    // Scoped: Next.js adds its own role="alert" route announcer to every page.
    await expect(page.locator("#join").getByRole("alert")).toContainText("doesn't look right");
    expect(apiCalled).toBe(false);
  });

  test("joins the waitlist (API mocked) and shows priority access", async ({ page }) => {
    await page.route("**/api/waitlist", (route) => route.fulfill({ json: { ok: true } }));
    await page.goto("/#join");
    await page.getByLabel("Your email", { exact: true }).fill("e2e@example.com");
    await page.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(page.getByRole("button", { name: "Get priority access" })).toBeVisible();
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });
});

test.describe("Mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("menu opens and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("Platform", () => {
  test("serves robots, sitemap and security headers", async ({ request }) => {
    const home = await request.get("/");
    expect(home.headers()["x-content-type-options"]).toBe("nosniff");
    expect(home.headers()["x-frame-options"]).toBe("DENY");
    expect(home.headers()["x-powered-by"]).toBeUndefined();
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /owner");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/privacy</loc>");
    const privacy = await request.get("/privacy");
    expect(privacy.status()).toBe(200);
    expect(await privacy.text()).toContain("including the Limited Use requirements");
    expect((await request.get("/terms")).status()).toBe(200);
  });

  test("sends a nonce-based Content-Security-Policy that the pages actually satisfy", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (m) => {
      if (/Content Security Policy|Content-Security-Policy/i.test(m.text())) violations.push(m.text());
    });
    const first = await page.goto("/");
    const csp = first!.headers()["content-security-policy"] ?? "";
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(csp).toContain("frame-ancestors 'none'");
    const again = await page.request.get("/");
    expect(again.headers()["content-security-policy"]).not.toBe(csp); // a fresh nonce per request
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    expect(violations).toEqual([]);
  });

  test("founders console sends visitors to sign in, and its API refuses anonymous calls", async ({
    page,
    request,
  }) => {
    await page.goto("/owner/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fowner/);
    expect((await request.get("/api/owner/export")).status()).toBe(401);
    expect((await request.get("/owner/mfa")).url()).toContain("/login");
  });
});
