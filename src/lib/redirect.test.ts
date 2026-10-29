import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirect";

describe("safeNextPath", () => {
  it("keeps same-site paths, including query strings", () => {
    expect(safeNextPath("/dashboard", "/x")).toBe("/dashboard");
    expect(safeNextPath("/onboarding?step=2", "/x")).toBe("/onboarding?step=2");
  });

  it.each([
    ["protocol-relative", "//evil.com"],
    ["backslash trick", "/\\evil.com"],
    ["absolute URL", "https://evil.com/dashboard"],
    ["scheme", "javascript:alert(1)"],
    ["relative path", "dashboard"],
    ["embedded backslash", "/ok\\..\\evil"],
    ["control character", "/da\nshboard"],
    ["empty", ""],
    ["too long", `/${"a".repeat(300)}`],
  ])("falls back on %s", (_name, value) => {
    expect(safeNextPath(value, "/dashboard")).toBe("/dashboard");
  });

  it("falls back on non-strings", () => {
    expect(safeNextPath(null, "/home")).toBe("/home");
    expect(safeNextPath(["/a"], "/home")).toBe("/home");
  });
});
