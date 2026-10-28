import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { compareRows } from "@/content/compare";
import { mainNav } from "@/content/navigation";
import { a11yViolations } from "@/test/a11y";
import Home from "./page";

describe("Landing page", () => {
  it("has no detectable accessibility violations", async () => {
    const { container } = render(<Home />);
    expect(await a11yViolations(container)).toEqual([]);
  }, 30_000);

  it("has exactly one h1 and a main landmark", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("every in-page link points at an element that exists", () => {
    const { container } = render(<Home />);
    const anchors = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
    expect(anchors.length).toBeGreaterThan(0);
    for (const a of anchors) {
      const id = a.getAttribute("href")!.slice(1);
      expect(container.querySelector(`#${CSS.escape(id)}`), `#${id}`).not.toBeNull();
    }
  });

  it("renders the main navigation", () => {
    render(<Home />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const link of mainNav)
      expect(within(nav).getByRole("link", { name: link.label })).toBeInTheDocument();
  });

  it("reads Yes/No to screen readers in the comparison table", () => {
    render(<Home />);
    const table = screen.getByRole("table");
    const booleanRows = compareRows.filter((r) => typeof r.us === "boolean").length;
    expect(within(table).getAllByText("Yes")).toHaveLength(booleanRows);
  });

  it("uses the Clinton AI brand", () => {
    render(<Home />);
    expect(screen.getAllByRole("link", { name: `${site.name} home` }).length).toBeGreaterThan(0);
  });
});
