import { describe, expect, it } from "vitest";
import { buildAnalytics } from "@/server/waitlist/analytics";
import { makeSignup } from "@/test/fixtures";
import { buildInsights } from "./analytics/insights";
import { formatChange, percent } from "./format";
import { parseSignupFilters, signupsHref } from "./signups/params";

describe("format helpers", () => {
  it("percent rounds and guards against zero", () => {
    expect(percent(1, 3)).toBe(33);
    expect(percent(5, 0)).toBe(0);
  });

  it("formatChange describes direction and size", () => {
    expect(formatChange(0, 0)).toBeNull();
    expect(formatChange(3, 0)).toEqual({ up: true, text: "New" });
    expect(formatChange(15, 10)).toEqual({ up: true, text: "50%" });
    expect(formatChange(5, 10)).toEqual({ up: false, text: "50%" });
  });
});

describe("signups query params", () => {
  it("sanitises raw params", () => {
    expect(parseSignupFilters({ q: "  ada ", survey: "maybe", page: "-3" })).toEqual({
      q: "ada",
      survey: "all",
      page: 1,
    });
    expect(parseSignupFilters({ survey: ["yes"], page: "2.9" })).toEqual({ q: "", survey: "yes", page: 2 });
  });

  it("builds hrefs that keep filters", () => {
    expect(signupsHref({ q: "", survey: "all", page: 1 }, 1)).toBe("/owner/signups");
    expect(signupsHref({ q: "a b", survey: "no", page: 1 }, 3)).toBe("/owner/signups?q=a+b&survey=no&page=3");
  });
});

describe("buildInsights", () => {
  it("shows placeholders when there are no signups", () => {
    const insights = buildInsights(buildAnalytics([], 30));
    expect(insights.map((i) => i.value)).toEqual(["–", "–", "–", "–"]);
  });

  it("names the best survey converter with 3+ signups", () => {
    const rows = [
      ...Array.from({ length: 3 }, () => makeSignup({ source: "linkedin", did_survey: true })),
      ...Array.from({ length: 4 }, () => makeSignup({ source: "x" })),
    ];
    const insights = buildInsights(buildAnalytics(rows, 30));
    expect(insights[0]).toMatchObject({ label: "Top source", value: "x" });
    expect(insights[3]).toMatchObject({ value: "linkedin", sub: "100% did the survey" });
  });
});
