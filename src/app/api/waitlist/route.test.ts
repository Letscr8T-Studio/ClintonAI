// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MESSAGES } from "@/lib/validation/waitlist";
import { jsonRequest } from "@/test/fixtures";
import { POST } from "./route";

const addToWaitlist = vi.fn();
vi.mock("@/server/waitlist/repository", () => ({
  addToWaitlist: (...args: unknown[]) => addToWaitlist(...args),
}));

const ENDPOINT = "http://localhost/api/waitlist";
let ipCounter = 0;
// Each test gets its own IP so the per-IP rate limit never leaks between tests.
const post = (body: unknown, ip = `10.0.0.${++ipCounter}`) =>
  jsonRequest(ENDPOINT, body, { "x-forwarded-for": ip });

async function call(request: Request) {
  const res = await POST(request);
  return { status: res.status, body: await res.json() };
}

beforeEach(() => {
  addToWaitlist.mockReset();
  addToWaitlist.mockResolvedValue(undefined);
});

describe("POST /api/waitlist", () => {
  it("saves a normalised email with its source", async () => {
    const res = await call(post({ email: " Ada@Example.com ", source: "linkedin" }));
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(addToWaitlist).toHaveBeenCalledWith("ada@example.com", "linkedin");
  });

  it("stores a missing source as null", async () => {
    await call(post({ email: "ada@example.com" }));
    expect(addToWaitlist).toHaveBeenCalledWith("ada@example.com", null);
  });

  it("rejects an invalid email", async () => {
    const res = await call(post({ email: "nope" }));
    expect(res).toEqual({ status: 400, body: { ok: false, error: MESSAGES.invalidEmail } });
    expect(addToWaitlist).not.toHaveBeenCalled();
  });

  it("rejects a body that isn't JSON", async () => {
    const res = await call(post("{not json"));
    expect(res.status).toBe(400);
  });

  it("silently accepts bots that fill the honeypot", async () => {
    const res = await call(post({ email: "bot@spam.co", company: "Acme" }));
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(addToWaitlist).not.toHaveBeenCalled();
  });

  it("hides database errors behind a generic message", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    addToWaitlist.mockRejectedValue(new Error("db down"));
    const res = await call(post({ email: "ada@example.com" }));
    expect(res).toEqual({ status: 500, body: { ok: false, error: MESSAGES.generic } });
  });

  it("rate-limits one IP after 10 requests a minute", async () => {
    for (let i = 0; i < 10; i++) await call(post({ email: "ada@example.com" }, "10.9.9.9"));
    const res = await call(post({ email: "ada@example.com" }, "10.9.9.9"));
    expect(res.status).toBe(429);
  });
});
