// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { meSchema } from "@/lib/validation/extension";
import { GET } from "./route";

const USER = "11111111-1111-4111-8111-111111111111";
const m = vi.hoisted(() => ({ user: vi.fn(), profile: vi.fn(), accounts: vi.fn() }));
vi.mock("@/server/auth/user", () => ({ getCurrentUser: m.user }));
vi.mock("@/server/profiles/repository", () => ({ getProfile: m.profile }));
vi.mock("@/server/accounts/repository", () => ({ listAccounts: m.accounts }));

beforeEach(() => {
  m.user.mockResolvedValue({ id: USER, email: "ada@example.com" });
  m.profile.mockResolvedValue({ display_name: "Ada", default_delay_seconds: 120 });
  m.accounts.mockResolvedValue([]);
});

describe("GET /api/me", () => {
  it("refuses visitors without a session", async () => {
    m.user.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(m.profile).not.toHaveBeenCalled();
  });

  it("describes the signed-in user in the shape the extension parses, never cached", async () => {
    m.accounts.mockResolvedValue([
      { id: "a", email: "old@gmail.com", status: "revoked", connectedAt: "" },
      { id: "b", email: "ada@gmail.com", status: "active", connectedAt: "" },
    ]);
    const res = await GET();
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(meSchema.parse(await res.json())).toEqual({
      ok: true,
      email: "ada@example.com",
      name: "Ada",
      gmail: { email: "ada@gmail.com", status: "active" },
      defaultDelaySeconds: 120,
    });
  });

  it("reports no Gmail before Connect Gmail, and a revoked one when that's all there is", async () => {
    expect((await (await GET()).json()).gmail).toBeNull();
    m.accounts.mockResolvedValue([{ id: "a", email: "old@gmail.com", status: "revoked", connectedAt: "" }]);
    expect((await (await GET()).json()).gmail).toEqual({ email: "old@gmail.com", status: "revoked" });
  });
});
