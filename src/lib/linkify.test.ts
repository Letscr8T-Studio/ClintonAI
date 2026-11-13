import { describe, expect, it } from "vitest";
import { linkify } from "./linkify";

describe("linkify", () => {
  it("finds web addresses and leaves the rest as text, joining back to the original", () => {
    const text = "See the plan (https://example.com/plan) and https://x.co/a?b=1.";
    const pieces = linkify(text);
    expect(pieces).toEqual([
      { text: "See the plan (" },
      { text: "https://example.com/plan", href: "https://example.com/plan" },
      { text: ") and " },
      { text: "https://x.co/a?b=1", href: "https://x.co/a?b=1" },
      { text: "." },
    ]);
    expect(pieces.map((p) => p.text).join("")).toBe(text);
  });

  it("keeps brackets that belong to the address", () => {
    expect(linkify("https://en.wikipedia.org/wiki/Lagos_(city)")[0].href).toBe(
      "https://en.wikipedia.org/wiki/Lagos_(city)",
    );
  });

  it("never links anything but http and https", () => {
    for (const text of ["javascript:alert(1)", "data:text/html,x", "ftp://x.com", "no links here"])
      expect(linkify(text)).toEqual([{ text }]);
  });
});
