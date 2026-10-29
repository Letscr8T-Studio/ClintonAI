// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OAUTH_COOKIE, encodeOAuthState } from "@/server/google/oauth-state";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({ user: vi.fn(), exchange: vi.fn(), connect: vi.fn() }));
vi.mock("@/server/auth/user", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/server/google/oauth", () => ({ exchangeCode: mocks.exchange }));
vi.mock("@/server/accounts/service", () => ({ connectGoogleAccount: mocks.connect }));

const saved = { state: "good-state", verifier: "v".repeat(64), userId: "user-1" };

function callback(query: string, cookie: string | null = encodeOAuthState(saved)) {
  const request = new NextRequest(`http://localhost:3000/api/google/callback?${query}`);
  if (cookie) request.cookies.set(OAUTH_COOKIE, cookie);
  return GET(request);
}
const location = (res: Response) => res.headers.get("location");

beforeEach(() => {
  Object.values(mocks).forEach((fn) => fn.mockReset());
  mocks.user.mockResolvedValue({ id: "user-1", email: "ada@example.com" });
  mocks.exchange.mockResolvedValue({ access_token: "a", expires_in: 1, scope: "" });
  mocks.connect.mockResolvedValue("connected");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/google/callback", () => {
  it("exchanges the code with the PKCE verifier and reports success", async () => {
    const res = await callback("code=abc&state=good-state");
    expect(mocks.exchange).toHaveBeenCalledWith(
      "abc",
      saved.verifier,
      "http://localhost:3000/api/google/callback",
    );
    expect(mocks.connect).toHaveBeenCalledWith("user-1", expect.anything());
    expect(location(res)).toBe("http://localhost:3000/dashboard?gmail=connected");
    expect(res.headers.get("set-cookie")).toMatch(new RegExp(`${OAUTH_COOKIE}=;.*Max-Age=0`));
  });

  it("rejects a forged state (CSRF)", async () => {
    const res = await callback("code=abc&state=forged");
    expect(mocks.exchange).not.toHaveBeenCalled();
    expect(location(res)).toBe("http://localhost:3000/dashboard?gmail=failed");
  });

  it("rejects a flow started by a different user", async () => {
    mocks.user.mockResolvedValue({ id: "user-2", email: "x@y.co" });
    expect(location(await callback("code=abc&state=good-state"))).toMatch(/gmail=failed$/);
    expect(mocks.exchange).not.toHaveBeenCalled();
  });

  it("rejects a missing cookie", async () => {
    expect(location(await callback("code=abc&state=good-state", null))).toMatch(/gmail=failed$/);
  });

  it("reports a cancelled consent", async () => {
    expect(location(await callback("error=access_denied&state=good-state"))).toMatch(/gmail=cancelled$/);
  });

  it("passes through a missing send permission", async () => {
    mocks.connect.mockResolvedValue("missing_scope");
    expect(location(await callback("code=abc&state=good-state"))).toMatch(/gmail=missing_scope$/);
  });

  it("reports failure when Google refuses the code", async () => {
    mocks.exchange.mockRejectedValue(new Error("invalid_grant"));
    expect(location(await callback("code=abc&state=good-state"))).toMatch(/gmail=failed$/);
  });

  it("sends signed-out visitors to sign in", async () => {
    mocks.user.mockResolvedValue(null);
    expect(location(await callback("code=abc&state=good-state"))).toBe("http://localhost:3000/login");
  });
});
