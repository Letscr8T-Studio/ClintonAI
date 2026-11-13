import { describe, expect, it, vi } from "vitest";
import { fetchOutbox, runOutboxAction } from "./outbox";

const ID = "11111111-1111-4111-8111-111111111111";
const respond = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
const email = {
  id: ID,
  subject: "Hi",
  to: ["a@x.com"],
  kind: "waiting",
  until: "2026-11-13T10:05:00Z",
  scheduled: false,
  safeSendMessageId: null,
};

describe("popup Outbox calls", () => {
  it("loads the Outbox with the site's session, and checks its shape", async () => {
    const fetchImpl = respond(200, { ok: true, emails: [email] });
    expect(await fetchOutbox("https://tryclinton.com", fetchImpl)).toEqual({ kind: "ok", emails: [email] });
    expect(vi.mocked(fetchImpl).mock.calls[0]).toEqual([
      "https://tryclinton.com/api/outbox",
      { credentials: "include", cache: "no-store" },
    ]);
    expect(await fetchOutbox("x", respond(200, { ok: true, emails: [{ id: 1 }] }))).toEqual({
      kind: "offline",
    });
    expect(await fetchOutbox("x", respond(401, { ok: false }))).toEqual({ kind: "signed-out" });
  });

  it("cancels, sends now and withdraws through the Outbox page's own routes", async () => {
    const fetchImpl = respond(200, { ok: true });
    expect(await runOutboxAction("https://t.co", { type: "cancel", id: ID }, fetchImpl)).toBe(true);
    expect(await runOutboxAction("https://t.co", { type: "send-now", id: ID }, fetchImpl)).toBe(true);
    expect(await runOutboxAction("https://t.co", { type: "withdraw", messageId: ID }, fetchImpl)).toBe(true);
    const calls = vi.mocked(fetchImpl).mock.calls;
    expect(calls.map(([url]) => url)).toEqual([
      `https://t.co/api/emails/${ID}/cancel`,
      `https://t.co/api/emails/${ID}/send-now`,
      `https://t.co/api/safe-send/${ID}/withdraw`,
    ]);
    expect(calls[2][1]).toMatchObject({ method: "POST", credentials: "include", body: "{}" });
  });

  it("refuses ids that aren't ids, and reports a refusal", async () => {
    const fetchImpl = respond(200, { ok: true });
    expect(await runOutboxAction("x", { type: "cancel", id: "../owner" }, fetchImpl)).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(await runOutboxAction("x", { type: "cancel", id: ID }, respond(404, { ok: false }))).toBe(false);
  });
});
