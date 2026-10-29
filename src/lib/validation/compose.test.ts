import { describe, expect, it } from "vitest";
import { describeHit } from "@/content/app/compose";
import { checkRequestSchema, invalidAddresses, splitAddresses } from "./compose";

describe("splitAddresses", () => {
  it("splits on commas, semicolons and new lines, trimming and de-duplicating", () => {
    expect(splitAddresses(" a@x.co, b@y.co;\nA@X.co ,, ")).toEqual(["a@x.co", "b@y.co"]);
  });
});

describe("invalidAddresses", () => {
  it("returns only the bad entries", () => {
    expect(invalidAddresses(["a@x.co", "nope", "b@y"])).toEqual(["nope", "b@y"]);
  });
});

describe("checkRequestSchema", () => {
  it("accepts a draft and fills defaults", () => {
    expect(checkRequestSchema.parse({ to: ["a@x.co"], body: "Hi" })).toEqual({
      to: ["a@x.co"],
      cc: [],
      subject: "",
      body: "Hi",
      attachments: [],
    });
  });

  it("needs a recipient and a body", () => {
    const result = checkRequestSchema.safeParse({ to: [], body: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.message)).toEqual([
      "Add at least one recipient.",
      "Write something first.",
    ]);
  });

  it("rejects invalid addresses", () => {
    expect(checkRequestSchema.safeParse({ to: ["not-an-email"], body: "Hi" }).success).toBe(false);
  });
});

describe("describeHit", () => {
  it("words each rule finding for the sender", () => {
    expect(
      describeHit({
        type: "greeting_mismatch",
        field: "body",
        params: { name: "Tunde", recipient: "dami@x.co" },
      }),
    ).toBe("You wrote “Tunde”, but this is going to dami@x.co.");
    expect(
      describeHit({
        type: "date_mismatch",
        field: "body",
        excerpt: "Monday, 3 November",
        params: { date: "3 November 2026", actual: "Tuesday" },
      }),
    ).toBe("You wrote “Monday, 3 November”, but 3 November 2026 is a Tuesday.");
  });

  it("never repeats sensitive data back", () => {
    const text = describeHit({
      type: "sensitive_data",
      field: "body",
      excerpt: "4242 4242 4242 4242",
      params: { kind: "card" },
    });
    expect(text).not.toContain("4242");
  });
});
