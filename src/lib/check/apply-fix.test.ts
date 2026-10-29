import { describe, expect, it } from "vitest";
import { applyFix } from "./apply-fix";
import type { Finding } from "./types";

const finding = (over: Partial<Finding>): Finding => ({
  id: "f",
  source: "rules",
  type: "greeting_mismatch",
  field: "body",
  message: "",
  ...over,
});

describe("applyFix", () => {
  it("replaces the quoted words and selects the new ones", () => {
    expect(applyFix("Hi Tunde, welcome.", finding({ excerpt: "Tunde", suggestion: "Dami" }))).toEqual({
      value: "Hi Dami, welcome.",
      start: 3,
      length: 4,
      changed: true,
    });
  });

  it("fills an empty field", () => {
    const fix = applyFix(
      "  ",
      finding({ type: "empty_subject", field: "subject", suggestion: "Your offer" }),
    );
    expect(fix).toEqual({ value: "Your offer", start: 0, length: 10, changed: true });
  });

  it("only points when there is no suggestion", () => {
    expect(applyFix("I've attached it", finding({ excerpt: "attached" }))).toEqual({
      value: "I've attached it",
      start: 5,
      length: 8,
      changed: false,
    });
  });

  it("changes nothing if the words are no longer there", () => {
    const fix = applyFix("Hi Dami", finding({ excerpt: "Tunde", suggestion: "Dami" }));
    expect(fix).toMatchObject({ value: "Hi Dami", start: -1, changed: false });
  });

  it("never overwrites a field the user has since filled", () => {
    const fix = applyFix("My subject", finding({ type: "empty_subject", field: "subject", suggestion: "X" }));
    expect(fix).toMatchObject({ value: "My subject", changed: false });
  });
});
