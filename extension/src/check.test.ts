import { describe, expect, it, vi } from "vitest";
import { runCheck } from "./check";

const draft = { to: ["ada@example.com"], cc: [], bcc: [], subject: "Hi", body: "Hello", attachments: [] };
const respond = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
const finding = { id: "m1", source: "model", type: "tone", field: "body", message: "A bit sharp." };

describe("runCheck", () => {
  it("posts the draft to /api/check with the site's session and returns the findings", async () => {
    const fetchImpl = respond(200, { ok: true, findings: [finding], modelUsed: true, checkId: null });
    expect(await runCheck("https://tryclinton.com", draft, fetchImpl)).toEqual({
      kind: "ok",
      findings: [finding],
      modelUsed: true,
      checkId: null,
    });
    const [url, init] = vi.mocked(fetchImpl).mock.calls[0];
    expect(url).toBe("https://tryclinton.com/api/check");
    expect(init).toMatchObject({ method: "POST", credentials: "include" });
    expect(JSON.parse(String(init?.body))).toMatchObject({ to: ["ada@example.com"], body: "Hello" });
  });

  it("drops kinds of finding this build can't label", async () => {
    const odd = { ...finding, id: "x", type: "astrology" };
    const reply = await runCheck(
      "x",
      draft,
      respond(200, { ok: true, findings: [finding, odd], modelUsed: true }),
    );
    expect(reply).toMatchObject({ kind: "ok", findings: [finding] });
  });

  it("tells signed out, rate limited and failed apart", async () => {
    expect(await runCheck("x", draft, respond(401, { ok: false, error: "Unauthorized" }))).toEqual({
      kind: "signed-out",
    });
    expect(await runCheck("x", draft, respond(429, { ok: false, error: "Slow down" }))).toEqual({
      kind: "limited",
      error: "Slow down",
    });
    expect(await runCheck("x", draft, respond(500, { ok: false, error: "Oops" }))).toEqual({
      kind: "failed",
    });
    const down = vi.fn(async () => Promise.reject(new TypeError("offline"))) as unknown as typeof fetch;
    expect(await runCheck("x", draft, down)).toEqual({ kind: "failed" });
  });

  it("never sends a draft the check wouldn't accept", async () => {
    const fetchImpl = respond(200, {});
    expect(await runCheck("x", { ...draft, to: ["not an address"] }, fetchImpl)).toEqual({ kind: "failed" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
