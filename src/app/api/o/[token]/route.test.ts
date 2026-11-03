// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashOpenToken, newOpenToken } from "@/server/emails/tracking";
import { GET } from "./route";

const recordOpen = vi.hoisted(() => vi.fn());
vi.mock("@/server/emails/repository", () => ({ recordOpen }));

const load = (token: string) =>
  GET(new Request(`http://localhost/api/o/${token}`), { params: Promise.resolve({ token }) });

beforeEach(() => {
  recordOpen.mockReset();
  recordOpen.mockResolvedValue(undefined);
});

describe("GET /api/o/:token (Likely opened pixel)", () => {
  it("records the open by the token's hash and answers with an uncached 1×1 GIF", async () => {
    const { token } = newOpenToken();
    const res = await load(token);
    expect(recordOpen).toHaveBeenCalledWith(hashOpenToken(token));
    expect(res.headers.get("content-type")).toBe("image/gif");
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(20);
  });

  it("ignores anything that isn't one of our tokens, but still answers with the image", async () => {
    const res = await load("not-a-token");
    expect(recordOpen).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("never fails the image when recording fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    recordOpen.mockRejectedValue(new Error("db down"));
    expect((await load(newOpenToken().token)).status).toBe(200);
  });
});
