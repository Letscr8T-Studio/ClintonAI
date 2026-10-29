// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const exchangeCodeForSession = vi.fn();
vi.mock("@/server/auth/user-client", () => ({
  getSupabaseForUser: async () => ({ auth: { exchangeCodeForSession } }),
}));

const callback = (query: string) => GET(new NextRequest(`http://localhost:3000/auth/callback?${query}`));
const location = (res: Response) => res.headers.get("location");

beforeEach(() => {
  exchangeCodeForSession.mockReset();
  exchangeCodeForSession.mockResolvedValue({ error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /auth/callback", () => {
  it("exchanges the code and lands on the dashboard", async () => {
    const res = await callback("code=abc");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(location(res)).toBe("http://localhost:3000/dashboard");
  });

  it("honours a same-site next path", async () => {
    const res = await callback("code=abc&next=%2Fonboarding");
    expect(location(res)).toBe("http://localhost:3000/onboarding");
  });

  it("never redirects off-site (open redirect)", async () => {
    const res = await callback("code=abc&next=%2F%2Fevil.com");
    expect(location(res)).toBe("http://localhost:3000/dashboard");
  });

  it("sends a cancelled consent back to login", async () => {
    const res = await callback("error=access_denied");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(location(res)).toBe("http://localhost:3000/login?error=cancelled");
  });

  it("rejects a missing code", async () => {
    expect(location(await callback(""))).toBe("http://localhost:3000/login?error=callback");
  });

  it("rejects a code Supabase refuses", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "invalid grant" } });
    expect(location(await callback("code=stale"))).toBe("http://localhost:3000/login?error=callback");
  });
});
