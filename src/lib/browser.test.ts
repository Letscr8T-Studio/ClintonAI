import { afterEach, describe, expect, it, vi } from "vitest";
import { attributionSource, readStorage, writeStorage } from "./browser";

describe("attributionSource", () => {
  it("prefers utm_source, then ref", () => {
    expect(attributionSource("?utm_source=newsletter&ref=x", "")).toBe("newsletter");
    expect(attributionSource("?ref=linkedin", "https://google.com/")).toBe("linkedin");
  });

  it("falls back to the referrer host, then direct", () => {
    expect(attributionSource("", "https://www.google.com/search?q=x")).toBe("www.google.com");
    expect(attributionSource("", "")).toBe("direct");
    expect(attributionSource("", "not a url")).toBe("direct");
  });
});

describe("storage helpers", () => {
  afterEach(() => window.localStorage.clear());

  it("round-trips a value", () => {
    writeStorage("k", "v");
    expect(readStorage("k")).toBe("v");
  });

  it("never throws when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => writeStorage("k", "v")).not.toThrow();
    expect(readStorage("k")).toBeNull();
  });
});
