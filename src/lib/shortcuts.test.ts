import { describe, expect, it } from "vitest";
import { filterCommands, isTyping, matchKeys } from "./shortcuts";

const list = [
  { id: "compose", label: "Write an email", keywords: "new compose", keys: ["C"] },
  { id: "home", label: "Home", keys: ["G", "H"] },
  { id: "outbox", label: "Outbox", keywords: "waiting sent", keys: ["G", "O"] },
  { id: "dark", label: "Dark theme" },
];

describe("matchKeys", () => {
  it("matches single and two-key shortcuts, case-insensitively", () => {
    expect(matchKeys(["c"], list)).toMatchObject({ kind: "match", command: { id: "compose" } });
    expect(matchKeys(["g"], list)).toEqual({ kind: "pending" });
    expect(matchKeys(["g", "o"], list)).toMatchObject({ kind: "match", command: { id: "outbox" } });
  });

  it("ignores keys that start nothing", () => {
    expect(matchKeys(["x"], list)).toEqual({ kind: "none" });
    expect(matchKeys(["g", "x"], list)).toEqual({ kind: "none" });
  });
});

describe("filterCommands", () => {
  it("keeps everything for an empty query", () => {
    expect(filterCommands(list, "  ")).toHaveLength(4);
  });

  it("matches every typed word against the label and keywords", () => {
    expect(filterCommands(list, "sent").map((c) => c.id)).toEqual(["outbox"]);
    expect(filterCommands(list, "write new").map((c) => c.id)).toEqual(["compose"]);
    expect(filterCommands(list, "write dark")).toEqual([]);
  });
});

describe("isTyping", () => {
  it("is true in fields and editable areas, false elsewhere", () => {
    expect(isTyping(document.createElement("input"))).toBe(true);
    expect(isTyping(document.createElement("textarea"))).toBe(true);
    expect(isTyping(document.createElement("button"))).toBe(false);
    expect(isTyping(null)).toBe(false);
  });
});
