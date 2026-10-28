import { describe, expect, it } from "vitest";
import { makeSignup } from "@/test/fixtures";
import { buildAnalytics, parseRange } from "./analytics";

// Noon in Lagos on Fri 23 Oct 2026.
const NOW = Date.parse("2026-10-23T11:00:00Z");
const daysAgo = (n: number, hourUtc = 11) =>
  new Date(
    Date.parse(`2026-10-23T${String(hourUtc).padStart(2, "0")}:00:00Z`) - n * 86_400_000,
  ).toISOString();

describe("parseRange", () => {
  it("accepts 7, 30 and 90 and defaults to 30", () => {
    expect(parseRange("7")).toBe(7);
    expect(parseRange(["90"])).toBe(90);
    expect(parseRange("12")).toBe(30);
    expect(parseRange(undefined)).toBe(30);
  });
});

describe("buildAnalytics", () => {
  const rows = [
    makeSignup({ created_at: daysAgo(0), source: "linkedin", did_survey: true }),
    makeSignup({ created_at: daysAgo(0), source: "linkedin" }),
    makeSignup({ created_at: daysAgo(1), source: null }),
    makeSignup({ created_at: daysAgo(3), source: "whatsapp", did_survey: true }),
    makeSignup({ created_at: daysAgo(9), source: "whatsapp" }),
    makeSignup({ created_at: daysAgo(16), source: "x" }),
  ];
  const a = buildAnalytics(rows, 7, NOW);

  it("counts totals and survey rate", () => {
    expect(a.total).toBe(6);
    expect(a.surveyed).toBe(2);
    expect(a.surveyRate).toBe(33.3);
  });

  it("counts today, yesterday and the last 7 days", () => {
    expect(a.today).toBe(2);
    expect(a.yesterday).toBe(1);
    expect(a.last7).toBe(4);
  });

  it("compares the last 7 days with the 7 days just before them", () => {
    // Days 7-13 ago hold one signup (9 days ago). Day 16 belongs to the week before that.
    expect(a.prev7).toBe(1);
  });

  it("groups sources, treating empty as direct, largest first", () => {
    expect(a.sources).toEqual([
      { source: "linkedin", count: 2, surveyed: 1 },
      { source: "whatsapp", count: 2, surveyed: 1 },
      { source: "direct", count: 1, surveyed: 0 },
      { source: "x", count: 1, surveyed: 0 },
    ]);
  });

  it("builds series of the right length", () => {
    expect(a.daily).toHaveLength(7);
    expect(a.daily.at(-1)).toEqual({ day: "2026-10-23", count: 2 });
    expect(a.spark).toHaveLength(14);
    expect(a.cumulative).toHaveLength(30);
    expect(a.cumulative.at(-1)).toBe(6);
    expect(a.hours[12].count).toBe(6); // every fixture is 11:00 UTC, which is 12:00 in Lagos
    expect(a.weekdays.map((d) => d.label)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("handles an empty list", () => {
    const empty = buildAnalytics([], 30, NOW);
    expect(empty.total).toBe(0);
    expect(empty.surveyRate).toBe(0);
    expect(empty.sources).toEqual([]);
  });
});
