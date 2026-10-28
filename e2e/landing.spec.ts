import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const AXE_PATH = path.join(process.cwd(), "node_modules", "axe-core", "axe.min.js");

type AxeResult = { violations: { id: string; nodes: { target: string[] }[] }[] };
type AxeGlobal = { axe: { run: (context: { exclude: string[] }) => Promise<AxeResult> } };

async function axeViolations(page: Page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // Reveal everything scroll animations may still be hiding, so contrast is measured on final colours.
    document.querySelectorAll<HTMLElement>("*").forEach((el) => (el.style.animation = "none"));
    const { axe } = window as unknown as AxeGlobal;
    // The giant footer wordmark (.anim-mark) is aria-hidden ornament, intentionally faint.
    const { violations } = await axe.run({ exclude: [".anim-mark"] });
    return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}

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
    expect(await (await request.get("/sitemap.xml")).text()).toContain("<loc>");
  });

  test("founders console redirects to login and its API refuses anonymous calls", async ({
    page,
    request,
  }) => {
    await page.goto("/owner/dashboard");
    await expect(page).toHaveURL(/\/owner\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    expect((await request.get("/api/owner/export")).status()).toBe(401);
  });
});
