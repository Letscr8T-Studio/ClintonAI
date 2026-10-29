import path from "node:path";
import type { Page } from "@playwright/test";

const AXE_PATH = path.join(process.cwd(), "node_modules", "axe-core", "axe.min.js");

type AxeResult = { violations: { id: string; nodes: { target: string[] }[] }[] };
type AxeGlobal = { axe: { run: (context: { exclude: string[] }) => Promise<AxeResult> } };

/** axe-core in a real browser, so colour contrast is checked too. */
export async function axeViolations(page: Page) {
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
