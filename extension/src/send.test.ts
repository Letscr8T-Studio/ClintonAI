import { describe, expect, it, vi } from "vitest";
import { emailActionErrors } from "@/content/app/outbox";
import { queueEmail, takeBack } from "./send";

const request = { to: ["ada@example.com"], subject: "Hi", body: "Hello", attachments: [] };
const respond = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
const ID = "11111111-1111-4111-8111-111111111111";

describe("queueEmail", () => {
  it("posts the email to the Outbox with the site's session", async () => {
    const fetchImpl = respond(200, { ok: true, id: ID, sendAt: "2026-11-13T10:05:00Z" });
    expect(await queueEmail("https://tryclinton.com", request, fetchImpl)).toEqual({
      kind: "ok",
      id: ID,
      sendAt: "2026-11-13T10:05:00Z",
    });
    const [url, init] = vi.mocked(fetchImpl).mock.calls[0];
    expect(url).toBe("https://tryclinton.com/api/emails");
    expect(init).toMatchObject({ method: "POST", credentials: "include" });
    expect(JSON.parse(String(init?.body))).toMatchObject({ to: ["ada@example.com"], safeSend: false });
  });

  it("says why it can't, in the site's words, and never sends what the site would refuse", async () => {
    expect(
      await queueEmail("x", request, respond(409, { ok: false, error: "Connect Gmail first." })),
    ).toEqual({
      kind: "error",
      error: "Connect Gmail first.",
    });
    expect(await queueEmail("x", request, respond(401, { ok: false, error: "Unauthorized" }))).toEqual({
      kind: "signed-out",
    });
    const fetchImpl = respond(200, {});
    const noOne = await queueEmail("x", { ...request, to: [] }, fetchImpl);
    expect(noOne).toEqual({ kind: "error", error: "Add at least one recipient." });
    expect(fetchImpl).not.toHaveBeenCalled();
    const down = vi.fn(async () => Promise.reject(new TypeError("offline"))) as unknown as typeof fetch;
    expect(await queueEmail("x", request, down)).toEqual({ kind: "error", error: emailActionErrors.failed });
  });
});

describe("takeBack (Undo)", () => {
  it("takes a waiting email back with the edit action, and reports when it's too late", async () => {
    const fetchImpl = respond(200, { ok: true, draft: {} });
    expect(await takeBack("https://tryclinton.com", ID, fetchImpl)).toBe(true);
    expect(vi.mocked(fetchImpl).mock.calls[0][0]).toBe(`https://tryclinton.com/api/emails/${ID}/edit`);
    expect(await takeBack("x", ID, respond(404, { ok: false, error: "gone" }))).toBe(false);
  });

  it("refuses anything that isn't an email id", async () => {
    const fetchImpl = respond(200, { ok: true });
    expect(await takeBack("x", "../../owner", fetchImpl)).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
