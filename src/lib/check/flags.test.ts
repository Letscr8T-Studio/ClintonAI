import { describe, expect, it } from "vitest";
import { flagAt, flagRanges, segments } from "./flags";
import type { Finding } from "./types";

const finding = (id: string, excerpt?: string): Finding => ({
  id,
  source: "rules",
  type: "placeholder",
  field: "body",
  message: id,
  ...(excerpt ? { excerpt } : {}),
});

const text = "Dear Kemi,\n\ni mizz you. See [NAME].";

describe("flagRanges", () => {
  it("finds each finding's words in the live text, in reading order", () => {
    const flags = flagRanges(text, [finding("b", "[NAME]"), finding("a", "mizz")]);
    expect(flags.map((f) => [f.finding.id, text.slice(f.start, f.end)])).toEqual([
      ["a", "mizz"],
      ["b", "[NAME]"],
    ]);
  });

  it("drops findings whose words are gone or that quote nothing", () => {
    expect(flagRanges(text, [finding("gone", "miss"), finding("none")])).toEqual([]);
  });

  it("keeps the earlier of two overlapping flags", () => {
    const flags = flagRanges(text, [finding("wide", "i mizz you"), finding("narrow", "mizz")]);
    expect(flags.map((f) => f.finding.id)).toEqual(["wide"]);
  });
});

describe("segments", () => {
  it("splits the text into runs that join back to exactly the text", () => {
    const parts = segments(text, flagRanges(text, [finding("a", "mizz"), finding("b", "[NAME]")]));
    expect(parts.map((p) => p.text).join("")).toBe(text);
    expect(parts.filter((p) => p.flag).map((p) => p.text)).toEqual(["mizz", "[NAME]"]);
  });

  it("handles a flag at the very start and end", () => {
    const parts = segments("mizz", flagRanges("mizz", [finding("a", "mizz")]));
    expect(parts).toHaveLength(1);
  });
});

describe("flagAt", () => {
  it("finds the flag under (or touching) the caret", () => {
    const flags = flagRanges(text, [finding("a", "mizz")]);
    const start = text.indexOf("mizz");
    expect(flagAt(flags, start)?.finding.id).toBe("a");
    expect(flagAt(flags, start + 4)?.finding.id).toBe("a");
    expect(flagAt(flags, 0)).toBeUndefined();
  });
});
