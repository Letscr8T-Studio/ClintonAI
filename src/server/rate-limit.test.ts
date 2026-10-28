// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("limits after max hits and resets when the window passes", () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 1000 });
    const t = 1_000_000;
    expect(limiter.isLimited("ip", t)).toBe(false);
    limiter.hit("ip", t);
    limiter.hit("ip", t + 10);
    expect(limiter.isLimited("ip", t + 20)).toBe(true);
    expect(limiter.isLimited("other-ip", t + 20)).toBe(false);
    expect(limiter.isLimited("ip", t + 1001)).toBe(false);
  });

  it("reset clears a key", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });
    limiter.hit("ip");
    expect(limiter.isLimited("ip")).toBe(true);
    limiter.reset("ip");
    expect(limiter.isLimited("ip")).toBe(false);
  });
});
