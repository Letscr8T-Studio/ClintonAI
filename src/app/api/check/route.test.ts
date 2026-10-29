// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "@/test/fixtures";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({ user: vi.fn(), record: vi.fn(), model: vi.fn() }));
vi.mock("@/server/auth/user", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/server/ai/repository", () => ({ recordCheck: mocks.record }));
vi.mock("@/server/ai/model", () => ({ getCheckModel: mocks.model }));

const ENDPOINT = "http://localhost/api/check";
let userSeq = 0;

async function call(body: unknown) {
  const res = await POST(jsonRequest(ENDPOINT, body));
  return { status: res.status, body: await res.json() };
}

beforeEach(() => {
  Object.values(mocks).forEach((fn) => fn.mockReset());
  // A fresh user per test keeps the per-user rate limit from leaking between tests.
  mocks.user.mockResolvedValue({ id: `user-${++userSeq}`, email: "ada@example.com" });
  mocks.record.mockResolvedValue(undefined);
  mocks.model.mockReturnValue(null);
});

describe("POST /api/check", () => {
  it("returns findings and records only their types", async () => {
    const res = await call({ to: ["dami@brightlane.io"], subject: "Offer", body: "Hi Tunde, attached." });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.findings.map((f: { type: string }) => f.type)).toEqual([
      "missing_attachment",
      "greeting_mismatch",
    ]);

    const recorded = mocks.record.mock.calls[0]![0];
    expect(recorded).toMatchObject({
      findingTypes: ["missing_attachment", "greeting_mismatch"],
      model: null,
    });
    expect(JSON.stringify(recorded)).not.toContain("Tunde"); // never the email text
  });

  it("requires a signed-in user", async () => {
    mocks.user.mockResolvedValue(null);
    expect((await call({ to: ["a@x.co"], body: "Hi" })).status).toBe(401);
  });

  it("validates the draft", async () => {
    const res = await call({ to: [], body: "" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ ok: false, error: "Add at least one recipient." });
  });

  it("still answers when recording fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.record.mockRejectedValue(new Error("db down"));
    expect((await call({ to: ["a@x.co"], body: "Hi" })).status).toBe(200);
  });

  it("rate-limits a user after 30 checks a minute", async () => {
    mocks.user.mockResolvedValue({ id: "busy-user", email: "a@x.co" });
    for (let i = 0; i < 30; i++) await call({ to: ["a@x.co"], body: "Hi" });
    expect((await call({ to: ["a@x.co"], body: "Hi" })).status).toBe(429);
  });
});
