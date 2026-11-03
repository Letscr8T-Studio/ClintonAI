// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { emailActionErrors } from "@/content/app/outbox";
import { jsonRequest } from "@/test/fixtures";
import { POST as queue } from "./route";

// POST /api/emails with send options: Bcc, attachments (own folder only), Send later, Likely opened.

const m = vi.hoisted(() => ({ queue: vi.fn(), sendNow: vi.fn() }));
const USER = "11111111-1111-4111-8111-111111111111";
let seq = 0;
vi.mock("@/server/auth/user", () => ({
  getCurrentUser: async () => ({ id: USER, email: `u${++seq}@x.co` }),
}));
vi.mock("@/server/profiles/repository", () => ({ getProfile: async () => ({ default_delay_seconds: 0 }) }));
vi.mock("@/server/emails/service", () => ({ queueEmail: m.queue, sendNow: m.sendNow }));

const draft = { to: ["dami@x.co"], bcc: ["boss@me.co"], subject: "Deck", body: "Attached." };
const file = (folder = USER) => ({
  path: `${folder}/22222222-2222-4222-8222-222222222222`,
  name: "deck.pdf",
  size: 1024,
  type: "application/pdf",
});
const post = (body: object) => queue(jsonRequest("http://localhost/api/emails", { ...draft, ...body }));

beforeEach(() => {
  Object.values(m).forEach((fn) => fn.mockReset());
  m.queue.mockResolvedValue({ id: "e1", sendAt: new Date("2026-11-04T08:00:00Z") });
});

describe("POST /api/emails send options", () => {
  it("passes Bcc, attachments and Likely opened through", async () => {
    await post({ attachments: [file()], trackOpens: true, delaySeconds: 300 });
    expect(m.queue.mock.calls[0]![1]).toMatchObject({
      draft: { bcc: ["boss@me.co"], attachments: [file()] },
      trackOpens: true,
      sendAt: null,
    });
  });

  it("schedules for the time picked, and never sends it straight away (even with Smart Delay off)", async () => {
    const at = new Date(Date.now() + 86_400_000).toISOString();
    expect((await (await post({ sendAt: at })).json()).ok).toBe(true);
    expect(m.queue.mock.calls[0]![1].sendAt).toEqual(new Date(at));
    expect(m.sendNow).not.toHaveBeenCalled();
  });

  it("refuses a time too soon or too far ahead", async () => {
    const soon = await post({ sendAt: new Date(Date.now() + 10_000).toISOString() });
    expect(soon.status).toBe(400);
    const far = await post({ sendAt: new Date(Date.now() + 40 * 86_400_000).toISOString() });
    expect((await far.json()).error).toMatch(/30 days/);
    expect(m.queue).not.toHaveBeenCalled();
  });

  it("refuses files from someone else's folder", async () => {
    const res = await post({ attachments: [file("33333333-3333-4333-8333-333333333333")] });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: emailActionErrors.badAttachment });
  });

  it("refuses attachments or open tracking together with Safe Send, and more than 18 MB", async () => {
    expect((await post({ safeSend: true, attachments: [file()] })).status).toBe(400);
    expect((await post({ safeSend: true, trackOpens: true })).status).toBe(400);
    const big = { ...file(), size: 10 * 1024 * 1024 };
    const two = [big, { ...big, path: `${USER}/44444444-4444-4444-8444-444444444444` }];
    expect((await post({ attachments: two })).status).toBe(400);
    expect(m.queue).not.toHaveBeenCalled();
  });
});
