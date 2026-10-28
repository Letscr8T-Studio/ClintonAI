import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { compareRows } from "./compare";
import { faqs } from "./faq";
import { footerNav, mainNav, primaryCta, sectionIds } from "./navigation";
import { pillars } from "./platform";
import { roadmapStages } from "./roadmap";

// Guards for content edits: catches broken anchors, duplicates and off-brand copy.

const allCopy = JSON.stringify({ pillars, faqs, compareRows, roadmapStages });
const ids = new Set<string>(Object.values(sectionIds));
const unique = (values: string[]) => new Set(values).size === values.length;

describe("content integrity", () => {
  it("every nav link points at a known section id", () => {
    for (const link of [...mainNav, ...footerNav.flat(), primaryCta]) {
      expect(ids, link.href).toContain(link.href.replace(/^#/, ""));
    }
  });

  it("has no duplicate pillars, questions or compare rows", () => {
    expect(unique(pillars.map((p) => p.num))).toBe(true);
    expect(unique(faqs.map((f) => f.question))).toBe(true);
    expect(unique(compareRows.map((r) => r.feature))).toBe(true);
  });

  it("platform card spans fill whole desktop rows of 6", () => {
    const total = pillars.reduce((sum, p) => sum + p.span, 0);
    expect(total % 6).toBe(0);
  });

  it("uses the Clinton AI brand, not the old Unsend product domain", () => {
    // "Unsend" stays as the take-back feature name; only the old product identity is banned.
    expect(site.name).toBe("Clinton AI");
    expect(JSON.stringify({ site, allCopy })).not.toMatch(/unsend\.io/i);
  });

  it("never promises to delete email from someone's inbox (trust rule 10)", () => {
    expect(allCopy).not.toMatch(/delete(s|d)? (it |the email )?from (their|the recipient'?s?) inbox/i);
  });
});
