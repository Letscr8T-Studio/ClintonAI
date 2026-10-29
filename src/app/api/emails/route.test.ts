// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { emailActionErrors } from "@/content/app/outbox";
import { jsonRequest } from "@/test/fixtures";
import { POST as act } from "./[id]/[action]/route";
import { POST as queue } from "./route";

const m = vi.hoisted(() => ({
  user: vi.fn(),
  profile: vi.fn(),
  queue: vi.fn(),
  cancel: vi.fn(),
  sendNow: vi.fn(),
  edit: vi.fn(),
}));
vi.mock("@/server/auth/user", () => ({ getCurrentUser: m.user }));
vi.mock("@/server/profiles/repository", () => ({ getProfile: m.profile }));
vi.mock("@/server/emails/service", () => ({
  queueEmail: m.queue,
  cancelEmail: m.cancel,
  sendNow: m.sendNow,
  takeBackForEdit: m.edit,
}));

const ID = "11111111-1111-4111-8111-111111111111";
const draft = { to: ["dami@x.co"], subject: "Hi", body: "Hello" };
let seq = 0;
const action = (id: string, name: string) =>
  act(new Request(`http://localhost/api/emails/${id}/${name}`, { method: "POST" }), {
    params: Promise.resolve({ id, action: name }),
  });

beforeEach(() => {
  Object.values(m).forEach((fn) => fn.mockReset());
  m.user.mockResolvedValue({ id: `u${++seq}`, email: "ada@example.com" });
  m.profile.mockResolvedValue({ default_delay_seconds: 600 });
  m.queue.mockResolvedValue({ id: ID, sendAt: new Date("2026-10-30T10:10:00Z") });
});

describe("POST /api/emails", () => {
  it("queues with the user's default Smart Delay", async () => {
    const res = await queue(jsonRequest("http://localhost/api/emails", draft));
    expect(await res.json()).toEqual({ ok: true, id: ID, sendAt: "2026-10-30T10:10:00.000Z" });
    expect(m.queue.mock.calls[0]![1]).toMatchObject({ delaySeconds: 600, draft: { ...draft, cc: [] } });
  });

  it("uses a delay chosen for this email", async () => {
    await queue(jsonRequest("http://localhost/api/emails", { ...draft, delaySeconds: 60 }));
    expect(m.queue.mock.calls[0]![1].delaySeconds).toBe(60);
  });

  it("rejects a delay outside 1-30 minutes, and bad drafts", async () => {
    expect(
      (await queue(jsonRequest("http://localhost/api/emails", { ...draft, delaySeconds: 5 }))).status,
    ).toBe(400);
    expect((await queue(jsonRequest("http://localhost/api/emails", { ...draft, to: [] }))).status).toBe(400);
  });

  it("needs a connected Gmail and a signed-in user", async () => {
    m.queue.mockResolvedValue(null);
    const res = await queue(jsonRequest("http://localhost/api/emails", draft));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, error: emailActionErrors.noAccount });
    m.user.mockResolvedValue(null);
    expect((await queue(jsonRequest("http://localhost/api/emails", draft))).status).toBe(401);
  });
});

describe("POST /api/emails/:id/:action", () => {
  it("cancels, sends now and takes back for editing", async () => {
    m.cancel.mockResolvedValue(true);
    m.sendNow.mockResolvedValue("sent");
    m.edit.mockResolvedValue({ ...draft, cc: [] });
    expect(await (await action(ID, "cancel")).json()).toEqual({ ok: true });
    expect(await (await action(ID, "send-now")).json()).toEqual({ ok: true, outcome: "sent" });
    expect(await (await action(ID, "edit")).json()).toEqual({ ok: true, draft: { ...draft, cc: [] } });
  });

  it("answers 404 for emails that already left, bad ids and unknown actions", async () => {
    m.cancel.mockResolvedValue(false);
    expect((await action(ID, "cancel")).status).toBe(404);
    expect((await action("not-a-uuid", "cancel")).status).toBe(404);
    expect((await action(ID, "explode")).status).toBe(404);
    expect(m.cancel).toHaveBeenCalledTimes(1);
  });
});
