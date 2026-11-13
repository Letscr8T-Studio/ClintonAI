import { describe, expect, it, vi } from "vitest";
import { fetchAccount } from "./account";

const me = {
  ok: true,
  email: "ada@example.com",
  name: "Ada",
  gmail: { email: "ada@gmail.com", status: "active" },
  defaultDelaySeconds: 300,
};
const respond = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("fetchAccount", () => {
  it("asks /api/me with the site's cookies and never a cached answer", async () => {
    const fetchImpl = respond(200, me);
    expect(await fetchAccount("https://tryclinton.com", fetchImpl)).toEqual({ kind: "ready", me });
    expect(fetchImpl).toHaveBeenCalledWith("https://tryclinton.com/api/me", {
      credentials: "include",
      cache: "no-store",
    });
  });

  it("is signed out on 401", async () => {
    expect(await fetchAccount("x", respond(401, { ok: false }))).toEqual({ kind: "signed-out" });
  });

  it("is offline when the site is down, errors, or answers in an unexpected shape", async () => {
    const down = vi.fn(async () =>
      Promise.reject(new TypeError("Failed to fetch")),
    ) as unknown as typeof fetch;
    expect(await fetchAccount("x", down)).toEqual({ kind: "offline" });
    expect(await fetchAccount("x", respond(500, { ok: false }))).toEqual({ kind: "offline" });
    expect(await fetchAccount("x", respond(200, { ok: true, email: 3 }))).toEqual({ kind: "offline" });
  });
});
