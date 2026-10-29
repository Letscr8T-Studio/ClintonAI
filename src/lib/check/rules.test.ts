import { describe, expect, it } from "vitest";
import { MANY_RECIPIENTS, runRules } from "./rules";
import type { DraftEmail } from "./types";

const NOW = new Date("2026-10-29T12:00:00Z");
const draft = (over: Partial<DraftEmail> = {}): DraftEmail => ({
  to: ["dami@brightlane.io"],
  cc: [],
  subject: "Offer letter",
  body: "Hi Dami,\n\nWelcome aboard.",
  attachments: [],
  ...over,
});
const types = (d: DraftEmail) => runRules(d, NOW).map((h) => h.type);

describe("runRules", () => {
  it("finds nothing in a clean email", () => {
    expect(runRules(draft(), NOW)).toEqual([]);
  });

  describe("missing attachment", () => {
    it("flags an attachment that is mentioned but missing", () => {
      const [hit] = runRules(draft({ body: "Hi Dami,\n\nI've attached the offer." }), NOW);
      expect(hit).toMatchObject({ type: "missing_attachment", field: "body", excerpt: "attached" });
    });

    it("stays quiet when something is attached", () => {
      expect(types(draft({ body: "Please find attached.", attachments: ["offer.pdf"] }))).toEqual([]);
    });
  });

  describe("greeting name", () => {
    it("flags a greeting that doesn't match the only recipient", () => {
      const [hit] = runRules(draft({ body: "Hi Tunde,\n\nCongratulations!" }), NOW);
      expect(hit).toMatchObject({
        type: "greeting_mismatch",
        excerpt: "Tunde",
        params: { name: "Tunde", recipient: "dami@brightlane.io" },
      });
    });

    it.each([
      ["a matching short name", "Hi Dami,", "damilola.o@x.co"],
      ["a matching long name", "Dear Damilola,", "dami@x.co"],
      ["a generic greeting", "Hi team,", "dami@x.co"],
      ["a generic mailbox", "Hi Tunde,", "info@x.co"],
      ["no name in the address", "Hi Tunde,", "a1@x.co"],
    ])("ignores %s", (_label, greeting, to) => {
      expect(types(draft({ to: [to], body: `${greeting}\n\nThanks` }))).toEqual([]);
    });

    it("only checks one-person emails", () => {
      expect(types(draft({ to: ["dami@x.co", "kemi@x.co"], body: "Hi Tunde," }))).toEqual([]);
    });
  });

  it("flags many recipients", () => {
    const to = Array.from({ length: MANY_RECIPIENTS + 1 }, (_, i) => `person${i}@x.co`);
    const hit = runRules(draft({ to, body: "Hello," }), NOW).find((h) => h.type === "many_recipients");
    expect(hit?.params).toEqual({ count: MANY_RECIPIENTS + 1 });
  });

  it.each([
    ["{first_name}", "Hi {first_name},"],
    ["{{company}}", "Thanks for choosing {{company}}."],
    ["[Name]", "Dear [Name],"],
    ["XXX", "The price is XXX."],
    ["TBD", "Launch date: TBD"],
  ])("flags the unfilled placeholder %s", (excerpt, body) => {
    const hit = runRules(draft({ body }), NOW).find((h) => h.type === "placeholder");
    expect(hit?.excerpt).toBe(excerpt);
  });

  it("suggests the recipient's name for a wrong greeting", () => {
    const [hit] = runRules(draft({ to: ["dami.olu@brightlane.io"], body: "Hi Tunde," }), NOW);
    expect(hit).toMatchObject({ excerpt: "Tunde", suggestion: "Dami" });
  });

  it("fills a name placeholder from the address, but never guesses other placeholders", () => {
    const named = runRules(draft({ body: "Dear [Name], hello." }), NOW).find((h) => h.type === "placeholder");
    expect(named).toMatchObject({ excerpt: "[Name]", suggestion: "Dami" });
    const company = runRules(draft({ body: "Thanks for choosing {{company}}." }), NOW).find(
      (h) => h.type === "placeholder",
    );
    expect(company?.suggestion).toBeUndefined();
  });

  it("flags a placeholder in the subject", () => {
    const hit = runRules(draft({ subject: "Proposal for {company}" }), NOW).find(
      (h) => h.type === "placeholder",
    );
    expect(hit).toMatchObject({ field: "subject", excerpt: "{company}" });
  });

  it("flags an empty subject", () => {
    expect(types(draft({ subject: "  " }))).toEqual(["empty_subject"]);
  });

  it("puts findings in a stable order", () => {
    expect(types(draft({ subject: "", body: "Hi Tunde,\n\nAttached is {doc}." }))).toEqual([
      "missing_attachment",
      "greeting_mismatch",
      "placeholder",
      "empty_subject",
    ]);
  });
});
