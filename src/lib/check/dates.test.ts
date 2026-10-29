import { describe, expect, it } from "vitest";
import { findDateMismatches } from "./dates";
import { findSensitiveData, passesLuhn } from "./sensitive";

const NOW = new Date("2026-10-29T12:00:00Z"); // a Thursday

describe("findDateMismatches", () => {
  it("flags a weekday that doesn't match the date (day first)", () => {
    const [hit] = findDateMismatches("Can we meet on Monday, 3 November?", NOW);
    expect(hit).toMatchObject({
      type: "date_mismatch",
      excerpt: "Monday, 3 November",
      params: { actual: "Tuesday", date: "3 November 2026" },
    });
  });

  it.each([
    ["Monday, 3 November", "Tuesday, 3 November"],
    ["Mon 3rd Nov", "Tue 3rd Nov"],
    ["MONDAY 3 November", "TUESDAY 3 November"],
    ["friday, november 6", "friday, november 6"],
  ])("suggests the right weekday in the writer's own form: %s", (written, fixed) => {
    const hits = findDateMismatches(`Meet ${written}?`, NOW);
    // 6 November 2026 really is a Friday: no finding, nothing to fix.
    expect(hits[0]?.suggestion ?? written).toBe(fixed);
  });

  it("flags month-first dates with ordinals and a year", () => {
    const [hit] = findDateMismatches("See you Fri, Nov 5th, 2026.", NOW);
    expect(hit?.params).toEqual({ actual: "Thursday", date: "5 November 2026" });
  });

  it.each(["Tuesday, 3 November", "Tue 3rd Nov", "Thursday October 29", "Monday the 2nd of November"])(
    "accepts the correct date %s",
    (text) => {
      expect(findDateMismatches(text, NOW)).toEqual([]);
    },
  );

  it("reads a past date with no year as next year", () => {
    // 5 January 2027 is a Tuesday.
    expect(findDateMismatches("Tuesday 5 January", NOW)).toEqual([]);
  });

  it("ignores dates that don't exist", () => {
    expect(findDateMismatches("Monday 31 June", NOW)).toEqual([]);
  });
});

describe("findSensitiveData", () => {
  it("flags a card number that passes the Luhn check", () => {
    const [hit] = findSensitiveData("Card: 4242 4242 4242 4242, expiry 12/28");
    expect(hit).toMatchObject({ type: "sensitive_data", params: { kind: "card" } });
  });

  it("ignores long numbers that are not card numbers", () => {
    expect(findSensitiveData("Order 1234 5678 9012 3456 shipped")).toEqual([]);
  });

  it("flags passwords and bank account numbers", () => {
    const kinds = findSensitiveData("My password is hunter2. Account number: 0123456789.").map(
      (h) => h.params?.kind,
    );
    expect(kinds).toEqual(["password", "account"]);
  });

  it("checks the Luhn algorithm", () => {
    expect(passesLuhn("79927398713")).toBe(true);
    expect(passesLuhn("79927398710")).toBe(false);
  });
});
