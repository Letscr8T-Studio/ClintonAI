import { describe, expect, it } from "vitest";
import { isValidEmail, normaliseEmail } from "./email";

describe("normaliseEmail", () => {
  it("trims and lower-cases a valid address", () => {
    expect(normaliseEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it.each([["not-an-email"], ["a@b"], ["@example.com"], ["a b@example.com"], [""]])("rejects %j", (value) => {
    expect(normaliseEmail(value)).toBeNull();
  });

  it("rejects non-strings and over-long addresses", () => {
    expect(normaliseEmail(42)).toBeNull();
    expect(normaliseEmail(undefined)).toBeNull();
    expect(normaliseEmail(`${"a".repeat(250)}@example.com`)).toBeNull();
  });

  it("isValidEmail mirrors normaliseEmail", () => {
    expect(isValidEmail("x@y.co")).toBe(true);
    expect(isValidEmail("nope")).toBe(false);
  });
});
