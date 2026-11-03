// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createRateLimiter, memoryStore } from "./rate-limit";

describe("createRateLimiter", () => {
  it("refuses after max attempts and starts over when the window passes", async () => {
    let now = 1_000_000;
    const limiter = createRateLimiter({ name: "t", max: 2, windowMs: 1000, store: memoryStore(() => now) });
    expect(await limiter.take("ip")).toBe(false);
    expect(await limiter.take("ip")).toBe(false);
    expect(await limiter.take("ip")).toBe(true);
    expect(await limiter.take("other-ip")).toBe(false);
    now += 1000;
    expect(await limiter.take("ip")).toBe(false);
  });

  it("hashes the key with the limiter's name, so no IP or email is stored", async () => {
    const store = vi.fn(async () => 1);
    await createRateLimiter({ name: "waitlist", max: 1, windowMs: 60_000, store }).take("203.0.113.9");
    await createRateLimiter({ name: "check", max: 1, windowMs: 60_000, store }).take("203.0.113.9");
    const [a, b] = store.mock.calls.map((c) => (c as unknown[])[0] as string);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain("203.0.113.9");
    expect(a).not.toBe(b);
  });

  it("lets the request through (and logs) when the store is down", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = async () => Promise.reject(new Error("db down"));
    expect(await createRateLimiter({ name: "t", max: 1, windowMs: 1000, store }).take("k")).toBe(false);
    expect(log).toHaveBeenCalled();
  });
});
