import axe from "axe-core";

/**
 * Runs axe-core on a rendered tree and returns a readable list of violations.
 * Colour contrast is checked in the browser (Playwright), since jsdom has no layout or computed colours.
 */
export async function a11yViolations(container: Element): Promise<string[]> {
  const result = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  return result.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
  );
}
