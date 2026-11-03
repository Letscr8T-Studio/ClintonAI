// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rewriteCopy } from "@/content/app/compose-options";
import { jsonRequest } from "@/test/fixtures";
import { POST as attachments, DELETE as removeAttachment } from "../attachments/route";
import { POST } from "./route";

const USER = "11111111-1111-4111-8111-111111111111";
const m = vi.hoisted(() => ({ rewrite: vi.fn(), can: vi.fn(), upload: vi.fn(), remove: vi.fn() }));
let seq = 0;
vi.mock("@/server/auth/user", () => ({
  getCurrentUser: async () => ({ id: USER, email: `u${++seq}@x.co` }),
}));
vi.mock("@/server/ai/rewrite", () => ({ rewriteEmail: m.rewrite, canRewrite: m.can }));
vi.mock("@/server/emails/attachments", () => ({ createUpload: m.upload, removeAttachments: m.remove }));

beforeEach(() => {
  Object.values(m).forEach((fn) => fn.mockReset());
  m.can.mockReturnValue(true);
});

describe("POST /api/rewrite", () => {
  it("returns Clinton's version of the text", async () => {
    m.rewrite.mockResolvedValue("Hi Dami, I miss you.");
    const res = await POST(
      jsonRequest("http://localhost/api/rewrite", { body: "hi dami i mizz u", mode: "fix" }),
    );
    expect(await res.json()).toEqual({ ok: true, text: "Hi Dami, I miss you." });
    expect(m.rewrite).toHaveBeenCalledWith("hi dami i mizz u", "fix");
  });

  it("says plainly when it can't rewrite, and rejects unknown modes and empty text", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    m.rewrite.mockRejectedValue(new Error("timeout"));
    const failed = await POST(jsonRequest("http://localhost/api/rewrite", { body: "Hi", mode: "shorter" }));
    expect(await failed.json()).toEqual({ ok: false, error: rewriteCopy.failed });
    m.can.mockReturnValue(false);
    expect(
      (await POST(jsonRequest("http://localhost/api/rewrite", { body: "Hi", mode: "fix" }))).status,
    ).toBe(503);
    expect(
      (await POST(jsonRequest("http://localhost/api/rewrite", { body: "Hi", mode: "poem" }))).status,
    ).toBe(400);
    expect((await POST(jsonRequest("http://localhost/api/rewrite", { body: " ", mode: "fix" }))).status).toBe(
      400,
    );
  });
});

describe("/api/attachments", () => {
  it("gives a one-time upload URL in the user's own folder, for files up to 18 MB", async () => {
    m.upload.mockResolvedValue({ path: `${USER}/f1`, url: "https://storage/sign/x" });
    const ok = await attachments(
      jsonRequest("http://localhost/api/attachments", {
        name: "deck.pdf",
        size: 2048,
        type: "application/pdf",
      }),
    );
    expect(await ok.json()).toEqual({ ok: true, path: `${USER}/f1`, url: "https://storage/sign/x" });
    expect(m.upload).toHaveBeenCalledWith(USER);
    const big = jsonRequest("http://localhost/api/attachments", {
      name: "a.zip",
      size: 30 * 1024 * 1024,
      type: "x/y",
    });
    expect((await attachments(big)).status).toBe(400);
  });

  it("removes only the user's own files", async () => {
    const own = `${USER}/22222222-2222-4222-8222-222222222222`;
    const other = "33333333-3333-4333-8333-333333333333/22222222-2222-4222-8222-222222222222";
    const del = (path: string) =>
      removeAttachment(
        new Request("http://localhost/api/attachments", { method: "DELETE", body: JSON.stringify({ path }) }),
      );
    expect((await (await del(own)).json()).ok).toBe(true);
    expect(m.remove).toHaveBeenCalledWith([own]);
    expect((await del(other)).status).toBe(403);
    expect(m.remove).toHaveBeenCalledTimes(1);
  });
});
