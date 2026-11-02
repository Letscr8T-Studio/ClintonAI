// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DraftEmail } from "@/lib/check/types";
import { MODEL_TIMEOUT_MS, runCheck } from "./check";
import type { CheckModel } from "./model";
import { formatEmail, writtenAt, type CheckContext, type ModelAnswer } from "./prompt";

const NOW = new Date("2026-10-29T12:00:00Z");
const draft: DraftEmail = {
  to: ["dami@brightlane.io"],
  cc: [],
  subject: "Offer",
  body: "Hi Tunde,\n\nThe salary is 5m. We can't offer more than 4m. Looking forward to",
  attachments: [],
};

type Answer = Omit<ModelAnswer, "subject"> & { subject?: string };

const model = (answer: Answer | (() => Promise<ModelAnswer>)): CheckModel => ({
  name: "test/model",
  check: typeof answer === "function" ? answer : async () => ({ subject: "", ...answer }),
});

afterEach(() => vi.useRealTimers());

describe("runCheck", () => {
  it("returns rule findings, worded for the sender, when no model is configured", async () => {
    const result = await runCheck(draft, null, NOW);
    expect(result.modelUsed).toBe(false);
    expect(result.findings).toEqual([
      expect.objectContaining({
        source: "rules",
        type: "greeting_mismatch",
        message: "You wrote “Tunde”, but this is going to dami@brightlane.io.",
        excerpt: "Tunde",
      }),
    ]);
  });

  it("adds model findings after the rules", async () => {
    const result = await runCheck(
      draft,
      model({
        findings: [
          {
            type: "contradiction",
            message: "5m or 4m? The figures clash.",
            excerpt: "The salary is 5m",
            suggestion: "",
          },
          { type: "unfinished", message: "The last sentence stops mid-way.", excerpt: "", suggestion: "" },
        ],
      }),
      NOW,
    );
    expect(result.modelUsed).toBe(true);
    expect(result.findings.map((f) => [f.source, f.type])).toEqual([
      ["rules", "greeting_mismatch"],
      ["model", "contradiction"],
      ["model", "unfinished"],
    ]);
  });

  it("keeps a model suggestion only when it swaps real, quoted words for different ones", async () => {
    const result = await runCheck(
      draft,
      model({
        findings: [
          {
            type: "unfinished",
            message: "The last sentence stops mid-way.",
            excerpt: "Looking forward to",
            suggestion: "Looking forward to hearing from you.",
          },
          { type: "tone", message: "No quote.", excerpt: "", suggestion: "Something new." },
          { type: "clarity", message: "Same words.", excerpt: "Hi Tunde", suggestion: "Hi Tunde" },
        ],
      }),
      NOW,
    );
    const model_ = result.findings.filter((f) => f.source === "model");
    expect(model_.map((f) => f.suggestion)).toEqual(["Looking forward to hearing from you.", undefined]);
  });

  it("offers the model's subject line for an empty subject", async () => {
    const empty = { ...draft, subject: "" };
    const result = await runCheck(
      empty,
      model({ subject: "“Your offer from Brightlane”", findings: [] }),
      NOW,
    );
    expect(result.findings.find((f) => f.type === "empty_subject")).toMatchObject({
      field: "subject",
      suggestion: "Your offer from Brightlane", // quotes stripped
    });
  });

  it("never suggests a subject when there already is one, or when the line is unusable", async () => {
    const withSubject = await runCheck(draft, model({ subject: "Something else", findings: [] }), NOW);
    expect(withSubject.findings.some((f) => f.type === "empty_subject")).toBe(false);

    const empty = { ...draft, subject: " " };
    const multiLine = await runCheck(empty, model({ subject: "Line one\nBcc: x@y.z", findings: [] }), NOW);
    expect(multiLine.findings.find((f) => f.type === "empty_subject")?.suggestion).toBeUndefined();
  });

  it("gives the rule finding its certain fix", async () => {
    const [finding] = (await runCheck(draft, null, NOW)).findings;
    expect(finding).toMatchObject({ excerpt: "Tunde", suggestion: "Dami" });
  });

  it("drops model findings that quote text not in the email, or repeat a rule", async () => {
    const result = await runCheck(
      draft,
      model({
        findings: [
          { type: "other", message: "Invented quote.", excerpt: "text that is not there", suggestion: "" },
          { type: "recipient", message: "Wrong person?", excerpt: "Tunde", suggestion: "" },
        ],
      }),
      NOW,
    );
    expect(result.findings.filter((f) => f.source === "model")).toEqual([]);
  });

  it("drops a model finding that repeats the name rule, but keeps unrelated ones", async () => {
    const result = await runCheck(
      { ...draft, body: "Hi Tunde,\n\nI've attached it. The salary is 5m, not 4m." },
      model({
        findings: [
          {
            type: "recipient",
            message: "Greeting names Tunde but it's going to Dami.",
            excerpt: "",
            suggestion: "",
          },
          { type: "other", message: "Same name issue.", excerpt: "Hi Tunde", suggestion: "" },
          {
            type: "contradiction",
            message: "5m or 4m?",
            excerpt: "I've attached it. The salary is 5m, not 4m.",
            suggestion: "",
          },
        ],
      }),
      NOW,
    );
    expect(result.findings.filter((f) => f.source === "model").map((f) => f.type)).toEqual(["contradiction"]);
  });

  it("falls back to the rules when the model errors", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await runCheck(
      draft,
      model(() => Promise.reject(new Error("500"))),
      NOW,
    );
    expect(result.modelUsed).toBe(false);
    expect(result.findings).toHaveLength(1);
  });

  it("gives up on a slow model after the time budget", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const slow = model(
      () =>
        new Promise<ModelAnswer>((_resolve, reject) => {
          // Behaves like fetch: rejects when the signal aborts.
          slowSignal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }),
    );
    let slowSignal: AbortSignal | undefined;
    const check = slow.check;
    slow.check = (d, signal, context) => {
      slowSignal = signal;
      return check(d, signal, context);
    };

    const pending = runCheck(draft, slow, NOW);
    await vi.advanceTimersByTimeAsync(MODEL_TIMEOUT_MS + 1);
    const result = await pending;
    expect(slowSignal?.aborted).toBe(true);
    expect(result.modelUsed).toBe(false);
    expect(result.findings.map((f) => f.source)).toEqual(["rules"]);
  });

  it("tells the model the writer's own date and time, so passed times can be caught", async () => {
    const check = vi.fn(async () => ({ subject: "", findings: [] }));
    await runCheck(draft, { name: "test/model", check }, NOW, "Africa/Lagos");
    const context = (check.mock.calls[0] as unknown[])[2] as CheckContext;
    expect(writtenAt(context)).toBe("Thursday, 29 October 2026 at 13:00 (Africa/Lagos)");
    expect(formatEmail(draft, context).split("\n")[0]).toBe(`Written: ${writtenAt(context)}`);
  });

  it("points at a time that has passed but never rewrites it (only the sender knows the new time)", async () => {
    const passed = { ...draft, body: "Hi Dami, let's talk today by 10am." };
    const result = await runCheck(
      passed,
      model({
        findings: [
          {
            type: "timing",
            message: "That time has already passed.",
            excerpt: "today by 10am",
            suggestion: "tomorrow by 10am",
          },
        ],
      }),
      NOW,
      "Africa/Lagos",
    );
    const timing = result.findings.find((f) => f.type === "timing");
    expect(timing).toMatchObject({ excerpt: "today by 10am" });
    expect(timing).not.toHaveProperty("suggestion");
  });

  it("drops a fix whose words overlap a fix already shown (one would break the other)", async () => {
    const typo = { ...draft, body: "Dear Tunde,\n\ni mizz you so much." };
    const result = await runCheck(
      typo,
      model({
        findings: [
          { type: "spelling", message: "Typo.", excerpt: "mizz", suggestion: "miss" },
          {
            type: "clarity",
            message: "Name and greeting don't match.",
            excerpt: "Dear Tunde,\n\ni mizz you",
            suggestion: "Dear Dami,\n\ni miss you",
          },
        ],
      }),
      NOW,
    );
    expect(result.findings.map((f) => f.type)).toEqual(["greeting_mismatch", "spelling"]);
  });

  it("falls back to UTC for a time zone it doesn't recognise", () => {
    expect(writtenAt({ now: NOW, timeZone: "Mars/Olympus" })).toBe(
      "Thursday, 29 October 2026 at 12:00 (UTC)",
    );
  });
});
