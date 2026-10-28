import { describe, expect, it } from "vitest";
import { makeSignup } from "@/test/fixtures";
import { csvCell, signupsToCsv } from "./csv";

describe("csvCell", () => {
  it("quotes and escapes double quotes", () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it.each(["=SUM(A1)", "+1", "-1", "@cmd"])("defuses formula injection in %j", (value) => {
    expect(csvCell(value)).toBe(`"'${value}"`);
  });
});

describe("signupsToCsv", () => {
  it("writes a BOM, a header and one line per signup", () => {
    const csv = signupsToCsv([
      makeSignup({ email: "a@b.co", source: null, did_survey: true, created_at: "2026-10-23T11:00:00Z" }),
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    const lines = csv.slice(1).trimEnd().split("\r\n");
    expect(lines[0]).toBe("email,source,joined (Africa/Lagos),did_survey");
    expect(lines[1]).toMatch(/^"a@b\.co","","23 Oct 2026, 12:00",yes$/);
  });
});
