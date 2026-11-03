// @vitest-environment node
import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const markSurveyDone = vi.hoisted(() => vi.fn());
vi.mock("@/server/waitlist/repository", () => ({ markSurveyDone }));
vi.mock("@/lib/tally", () => ({ TALLY_FORM_ID: "form1" }));

const SECRET = "tally-signing-secret";
const response = (over: object = {}) =>
  JSON.stringify({
    eventId: "e1",
    eventType: "FORM_RESPONSE",
    data: {
      formId: "form1",
      fields: [
        { key: "q1", label: "What would you use first?", type: "MULTIPLE_CHOICE", value: ["x"] },
        { key: "h1", label: "email", type: "HIDDEN_FIELDS", value: " Ada@Example.com " },
      ],
      ...over,
    },
  });
const sign = (body: string, secret = SECRET) => createHmac("sha256", secret).update(body).digest("base64");
const post = (body: string, signature?: string) =>
  POST(
    new Request("http://localhost/api/webhooks/tally", {
      method: "POST",
      body,
      headers: signature ? { "tally-signature": signature } : {},
    }),
  );

beforeEach(() => {
  markSurveyDone.mockReset();
  vi.stubEnv("TALLY_SIGNING_SECRET", SECRET);
});

describe("POST /api/webhooks/tally", () => {
  it("marks the respondent's email as surveyed when Tally's signature checks out", async () => {
    const body = response();
    const res = await post(body, sign(body));
    expect(await res.json()).toEqual({ ok: true });
    expect(markSurveyDone).toHaveBeenCalledWith("ada@example.com");
  });

  it("refuses unsigned, wrongly signed or tampered requests", async () => {
    const body = response();
    expect((await post(body)).status).toBe(401);
    expect((await post(body, sign(body, "wrong-secret"))).status).toBe(401);
    expect((await post(body.replace("Ada", "Eve"), sign(body))).status).toBe(401);
    expect(markSurveyDone).not.toHaveBeenCalled();
  });

  it("acknowledges but ignores other forms, other events and responses without an email", async () => {
    for (const body of [
      response({ formId: "someone-elses-form" }),
      JSON.stringify({ eventType: "FORM_CREATED", data: { formId: "form1", fields: [] } }),
      response({ fields: [] }),
    ]) {
      expect((await post(body, sign(body))).status).toBe(200);
    }
    expect(markSurveyDone).not.toHaveBeenCalled();
  });

  it("is switched off until the signing secret is set", async () => {
    vi.stubEnv("TALLY_SIGNING_SECRET", "");
    const body = response();
    expect((await post(body, sign(body))).status).toBe(503);
  });
});
