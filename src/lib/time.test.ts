import { describe, expect, it } from "vitest";
import {
  formatClock,
  formatCountdown,
  formatTimeLeft,
  greeting,
  lagosDay,
  lagosHour,
  longDay,
  shortDay,
  timeAgo,
} from "./time";

describe("formatClock", () => {
  it.each([
    [0, "00:00"],
    [59, "00:59"],
    [1499, "24:59"],
    [-5, "00:00"],
  ])("%i seconds → %s", (secs, expected) => {
    expect(formatClock(secs)).toBe(expected);
  });
});

describe("Lagos dates", () => {
  it("uses Lagos (UTC+1) for the calendar day and hour", () => {
    expect(lagosDay("2026-10-23T23:30:00Z")).toBe("2026-10-24");
    expect(lagosHour("2026-10-23T23:30:00Z")).toBe(0);
  });

  it("formats day keys", () => {
    expect(shortDay("2026-10-23")).toBe("23 Oct");
    expect(longDay("2026-10-23")).toBe("Fri 23 Oct");
  });

  it("greets by Lagos time of day", () => {
    expect(greeting(new Date("2026-10-23T08:00:00Z"))).toBe("Good morning");
    expect(greeting(new Date("2026-10-23T13:00:00Z"))).toBe("Good afternoon");
    expect(greeting(new Date("2026-10-23T19:00:00Z"))).toBe("Good evening");
  });
});

describe("timeAgo", () => {
  const now = Date.parse("2026-10-23T12:00:00Z");
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it.each([
    [10_000, "just now"],
    [5 * 60_000, "5m ago"],
    [3 * 3_600_000, "3h ago"],
    [2 * 86_400_000, "2d ago"],
  ])("%i ms ago → %s", (ms, expected) => {
    expect(timeAgo(ago(ms), now)).toBe(expected);
  });

  it("falls back to a date after a week", () => {
    expect(timeAgo(ago(10 * 86_400_000), now)).toBe("13 Oct 2026");
  });
});

describe("formatTimeLeft", () => {
  it("shows hours and minutes, then minutes, then a floor", () => {
    expect(formatTimeLeft(18 * 3_600_000 + 42 * 60_000 + 5_000)).toBe("18h 42m");
    expect(formatTimeLeft(42 * 60_000)).toBe("42m");
    expect(formatTimeLeft(30_000)).toBe("under a minute");
  });
});

describe("formatCountdown", () => {
  it("is mm:ss under an hour, then hours and minutes, then days and hours", () => {
    expect(formatCountdown(299)).toBe("04:59");
    expect(formatCountdown(3 * 3600 + 5 * 60 + 9)).toBe("3h 05m");
    expect(formatCountdown(2 * 86400 + 4 * 3600 + 59)).toBe("2d 4h");
  });
});
