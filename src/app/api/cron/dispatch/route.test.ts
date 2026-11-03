// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const dispatchDue = vi.hoisted(() => vi.fn());
const expireDue = vi.hoisted(() => vi.fn());
vi.mock("@/server/emails/service", () => ({ dispatchDue }));
vi.mock("@/server/safe-send/service", () => ({ expireDue }));
vi.mock("@/server/emails/attachments", () => ({ removeStaleAttachments: async () => 4 }));

const SECRET = "s".repeat(40);
const call = (auth?: string) =>
  POST(
    new Request("http://localhost/api/cron/dispatch", {
      method: "POST",
      headers: auth ? { authorization: auth } : {},
    }),
  );

beforeEach(() => {
  dispatchDue.mockReset();
  dispatchDue.mockResolvedValue({ sent: 2, retry: 0, failed: 1 });
  expireDue.mockReset();
  expireDue.mockResolvedValue(3);
  vi.stubEnv("CRON_SECRET", SECRET);
});

describe("POST /api/cron/dispatch", () => {
  it("sends due emails when called with the secret", async () => {
    const res = await call(`Bearer ${SECRET}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, sent: 2, retry: 0, failed: 1, expired: 3, swept: 4 });
  });

  it.each([
    ["no header", undefined],
    ["a wrong secret", "Bearer nope"],
  ])("refuses %s", async (_label, auth) => {
    expect((await call(auth)).status).toBe(401);
    expect(dispatchDue).not.toHaveBeenCalled();
  });

  it("refuses everything when no secret is configured", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
    expect(dispatchDue).not.toHaveBeenCalled();
  });
});
