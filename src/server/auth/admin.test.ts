// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  user: vi.fn(),
  admin: vi.fn(),
  level: vi.fn(),
  log: vi.fn(),
  redirect: vi.fn((to: string) => {
    throw new Error(`redirect:${to}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("not-found");
  }),
}));
vi.mock("react", async (orig) => ({ ...(await orig<object>()), cache: <T>(fn: T) => fn }));
vi.mock("next/navigation", () => ({ redirect: m.redirect, notFound: m.notFound }));
vi.mock("./user", () => ({ getCurrentUser: m.user }));
vi.mock("./user-client", () => ({
  getSupabaseForUser: async () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: m.admin }) }) }),
    auth: { mfa: { getAuthenticatorAssuranceLevel: m.level } },
  }),
}));
vi.mock("@/server/supabase", () => ({
  getSupabaseAdmin: () => ({ from: () => ({ insert: m.log }) }),
}));

const { getAdminAccess, requireAdmin } = await import("./admin");
const ADA = { id: "u1", email: "ada@example.com" };

beforeEach(() => {
  Object.values(m).forEach((fn) => "mockClear" in fn && fn.mockClear());
  m.user.mockResolvedValue(ADA);
  m.admin.mockResolvedValue({ data: { user_id: "u1" } });
  m.level.mockResolvedValue({ data: { currentLevel: "aal2", nextLevel: "aal2" } });
  m.log.mockResolvedValue({ error: null });
});

describe("founders console access", () => {
  it("lets in a signed-in admin who passed the second step, and logs the visit", async () => {
    expect(await getAdminAccess()).toEqual({ kind: "ok", user: ADA });
    expect(await requireAdmin("view signups")).toEqual(ADA);
    expect(m.log).toHaveBeenCalledWith({ user_id: "u1", action: "view signups" });
  });

  it("sends visitors to sign in, and shows non-admins a 404 (the console doesn't exist for them)", async () => {
    m.user.mockResolvedValue(null);
    await expect(requireAdmin("x")).rejects.toThrow("redirect:/login?next=%2Fowner%2Fdashboard");
    m.user.mockResolvedValue(ADA);
    m.admin.mockResolvedValue({ data: null });
    await expect(requireAdmin("x")).rejects.toThrow("not-found");
    expect(m.log).not.toHaveBeenCalled();
  });

  it("asks admins for their authenticator: to set one up, or for this session's code", async () => {
    m.level.mockResolvedValue({ data: { currentLevel: "aal1", nextLevel: "aal1" } });
    expect((await getAdminAccess()).kind).toBe("enroll");
    m.level.mockResolvedValue({ data: { currentLevel: "aal1", nextLevel: "aal2" } });
    expect((await getAdminAccess()).kind).toBe("verify");
    await expect(requireAdmin("x")).rejects.toThrow("redirect:/owner/mfa");
  });
});
