// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { popupOutboxSchema } from "@/lib/validation/extension";
import type { OutboxEmail } from "@/types/emails";
import { GET } from "./route";

const m = vi.hoisted(() => ({ user: vi.fn(), list: vi.fn() }));
vi.mock("@/server/auth/user", () => ({ getCurrentUser: m.user }));
vi.mock("@/server/emails/outbox-repository", () => ({ listOutbox: m.list }));
vi.mock("@/server/safe-send/service", () => ({ attachSafeSend: async (e: OutboxEmail[]) => e }));

const inMinutes = (n: number) => new Date(Date.now() + n * 60_000).toISOString();
const email = (patch: Partial<OutboxEmail>): OutboxEmail => ({
  id: "e",
  safeSend: false,
  subject: "Hi",
  to: ["ada@example.com"],
  cc: [],
  attachments: [],
  scheduled: false,
  trackOpens: false,
  opensCount: 0,
  firstOpenedAt: null,
  status: "held",
  sendAt: inMinutes(5),
  sentAt: null,
  failureReason: null,
  createdAt: inMinutes(-1),
  ...patch,
});

beforeEach(() => m.user.mockResolvedValue({ id: "u1", email: "me@example.com" }));

describe("GET /api/outbox", () => {
  it("refuses visitors without a session", async () => {
    m.user.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });

  it("lists only what can still be acted on, soonest first, without any email text", async () => {
    m.list.mockResolvedValue([
      email({ id: "later", sendAt: inMinutes(60), scheduled: true, cc: ["bo@example.com"] }),
      email({ id: "soon", sendAt: inMinutes(2) }),
      email({ id: "sent", status: "sent" }),
      email({ id: "cancelled", status: "cancelled" }),
      email({
        id: "safe",
        status: "sent",
        safeSend: true,
        safeSendInfo: {
          messageId: "m1",
          expiresAt: inMinutes(30),
          withdrawnAt: null,
          contentDeletedAt: null,
          recipients: [],
        },
      }),
    ]);
    const res = await GET();
    expect(res.headers.get("cache-control")).toBe("no-store");
    const { emails } = popupOutboxSchema.parse(await res.json());
    expect(emails.map((e) => [e.id, e.kind])).toEqual([
      ["soon", "waiting"],
      ["safe", "withdrawable"],
      ["later", "waiting"],
    ]);
    expect(emails[2]).toMatchObject({ to: ["ada@example.com", "bo@example.com"], scheduled: true });
    expect(emails[1].safeSendMessageId).toBe("m1");
    expect(JSON.stringify(emails)).not.toMatch(/body/);
  });
});
