// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "@/test/fixtures";
import { POST } from "./route";

const m = vi.hoisted(() => ({ user: vi.fn(), withdraw: vi.fn() }));
vi.mock("@/server/auth/user", () => ({ getCurrentUser: m.user }));
vi.mock("@/server/safe-send/service", () => ({ withdraw: m.withdraw }));

const ID = "11111111-1111-4111-8111-111111111111";
const R = "22222222-2222-4222-8222-222222222222";
const call = (id: string, body: unknown) =>
  POST(jsonRequest(`http://localhost/api/safe-send/${id}/withdraw`, body), {
    params: Promise.resolve({ messageId: id }),
  });

beforeEach(() => {
  m.user.mockReset().mockResolvedValue({ id: "u1", email: "ada@example.com" });
  m.withdraw.mockReset().mockResolvedValue(true);
});

describe("POST /api/safe-send/:id/withdraw", () => {
  it("withdraws for everyone, or for one recipient, as the signed-in sender", async () => {
    expect(await (await call(ID, {})).json()).toEqual({ ok: true });
    expect(m.withdraw).toHaveBeenLastCalledWith("u1", ID, undefined);
    await call(ID, { recipientId: R });
    expect(m.withdraw).toHaveBeenLastCalledWith("u1", ID, R);
  });

  it("answers 404 when it's too late, and for bad ids", async () => {
    m.withdraw.mockResolvedValue(false);
    expect((await call(ID, {})).status).toBe(404);
    expect((await call("nope", {})).status).toBe(404);
    expect((await call(ID, { recipientId: "nope" })).status).toBe(400);
  });

  it("requires a signed-in user", async () => {
    m.user.mockResolvedValue(null);
    expect((await call(ID, {})).status).toBe(401);
    expect(m.withdraw).not.toHaveBeenCalled();
  });
});
