import { describe, expect, it } from "vitest";
import { MESSAGES, joinWaitlistSchema, surveyCompleteSchema } from "./waitlist";

describe("joinWaitlistSchema", () => {
  it("normalises the email and defaults optional fields", () => {
    const parsed = joinWaitlistSchema.parse({ email: " Ada@Example.com " });
    expect(parsed).toEqual({ email: "ada@example.com", company: "", source: "" });
  });

  it("truncates long sources and ignores non-string values", () => {
    const parsed = joinWaitlistSchema.parse({ email: "a@b.co", source: "x".repeat(500), company: 7 });
    expect(parsed.source).toHaveLength(200);
    expect(parsed.company).toBe("");
  });

  it("rejects a bad email with the user-facing message", () => {
    const result = joinWaitlistSchema.safeParse({ email: "nope" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(MESSAGES.invalidEmail);
  });
});

describe("surveyCompleteSchema", () => {
  it("requires a valid email", () => {
    expect(surveyCompleteSchema.safeParse({}).success).toBe(false);
    expect(surveyCompleteSchema.parse({ email: "A@B.CO" }).email).toBe("a@b.co");
  });
});
