// @vitest-environment node
import { randomBytes } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmailRow } from "@/types/database";
import { hashToken, newDataKey, sealContent } from "./keys";
import { expireDue, prepareSafeSend, viewByToken, withdraw } from "./service";

const repo = vi.hoisted(() => ({
  createSafeSend: vi.fn(),
  getDataKey: vi.fn(),
  openByTokenHash: vi.fn(),
  shred: vi.fn(),
  withdrawMessage: vi.fn(),
  withdrawRecipients: vi.fn(),
  messageEmailId: vi.fn(),
}));
const storage = vi.hoisted(() => ({
  uploadContent: vi.fn(),
  downloadContent: vi.fn(),
  removeContent: vi.fn(),
}));
const activity = vi.hoisted(() => vi.fn());
vi.mock("./repository", () => repo);
vi.mock("./storage", () => storage);
vi.mock("@/server/emails/repository", () => ({ recordActivity: activity }));

const email = {
  id: "e1",
  user_id: "u1",
  to_recipients: ["Kemi@Client.co", "tunde@client.co"],
  cc_recipients: ["kemi@client.co"],
  bcc_recipients: ["boss@me.co"],
} as unknown as EmailRow;

const row = (over = {}) => ({
  recipient_id: "r1",
  recipient_email: "kemi@client.co",
  message_id: "m1",
  subject: "Pricing",
  sender_name: "Ada Obi",
  sender_email: "ada@gmail.com",
  sent_at: "2026-10-31T10:00:00Z",
  expires_at: new Date(Date.now() + 3_600_000).toISOString(),
  withdrawn_at: null,
  content_deleted_at: null,
  storage_path: "u1/x.bin",
  ...over,
});
const token = randomBytes(32).toString("base64url");

beforeEach(() => {
  [...Object.values(repo), ...Object.values(storage), activity].forEach((fn) => fn.mockReset());
  vi.stubEnv("EMAIL_ENCRYPTION_KEY", randomBytes(32).toString("base64"));
  vi.stubEnv("APP_URL", "http://localhost:3000/");
  repo.createSafeSend.mockResolvedValue({ messageId: "m1", expiresAt: "x" });
});

describe("prepareSafeSend", () => {
  it("stores only ciphertext and gives each person (deduplicated, incl. Bcc) their own link", async () => {
    const prepared = await prepareSafeSend(email, "Secret salary details");
    const sealed = storage.uploadContent.mock.calls[0]![1] as string;
    expect(sealed).not.toContain("Secret");
    expect(prepared.links.map((l) => l.email)).toEqual(["kemi@client.co", "tunde@client.co", "boss@me.co"]);

    const stored = repo.createSafeSend.mock.calls[0]![0].recipients as { email: string; tokenHash: string }[];
    for (const [i, link] of prepared.links.entries()) {
      expect(link.url).toMatch(/^http:\/\/localhost:3000\/m\/[A-Za-z0-9_-]{43}$/);
      expect(stored[i]!.tokenHash).toBe(hashToken(link.url.split("/m/")[1]!)); // hash only, never the token
    }
  });

  it("deletes the uploaded file if the database step fails", async () => {
    repo.createSafeSend.mockRejectedValue(new Error("db"));
    await expect(prepareSafeSend(email, "x")).rejects.toThrow("db");
    expect(storage.removeContent).toHaveBeenCalledWith([storage.uploadContent.mock.calls[0]![0]]);
  });
});

describe("viewByToken", () => {
  it("decrypts the message for a valid, open link", async () => {
    const key = newDataKey();
    repo.openByTokenHash.mockResolvedValue(row());
    repo.getDataKey.mockResolvedValue(key);
    storage.downloadContent.mockResolvedValue(sealContent("Hello Kemi", key));
    expect(await viewByToken(token)).toMatchObject({
      kind: "readable",
      body: "Hello Kemi",
      senderName: "Ada Obi",
    });
    expect(repo.openByTokenHash).toHaveBeenCalledWith(hashToken(token));
  });

  it("says withdrawn, expired or not found, without decrypting anything", async () => {
    repo.openByTokenHash.mockResolvedValue(row({ withdrawn_at: "2026-10-31T11:00:00Z" }));
    expect(await viewByToken(token)).toEqual({
      kind: "withdrawn",
      senderName: "Ada Obi",
      withdrawnAt: "2026-10-31T11:00:00Z",
    });
    repo.openByTokenHash.mockResolvedValue(row({ expires_at: "2020-01-01T00:00:00Z" }));
    expect((await viewByToken(token)).kind).toBe("expired");
    repo.openByTokenHash.mockResolvedValue(null);
    expect((await viewByToken(token)).kind).toBe("not_found");
    expect((await viewByToken("not-a-token")).kind).toBe("not_found");
    expect(repo.getDataKey).not.toHaveBeenCalled();
  });
});

describe("withdraw and expire", () => {
  it("withdrawing for everyone shreds the content at once", async () => {
    repo.withdrawMessage.mockResolvedValue({ emailId: "e1" });
    repo.shred.mockResolvedValue([{ id: "m1", storage_path: "u1/x.bin", user_id: "u1", email_id: "e1" }]);
    expect(await withdraw("u1", "m1")).toBe(true);
    expect(repo.shred).toHaveBeenCalledWith("m1");
    expect(storage.removeContent).toHaveBeenCalledWith(["u1/x.bin"]);
    expect(activity).toHaveBeenCalledWith([{ userId: "u1", emailId: "e1", action: "withdrawn" }]);
  });

  it("withdrawing for one person keeps the content for the others", async () => {
    repo.withdrawRecipients.mockResolvedValue(["kemi@client.co"]);
    repo.messageEmailId.mockResolvedValue("e1");
    expect(await withdraw("u1", "m1", "r1")).toBe(true);
    expect(repo.shred).not.toHaveBeenCalled();
    expect(activity).toHaveBeenCalledWith([
      { userId: "u1", emailId: "e1", action: "withdrawn", recipient: "kemi@client.co" },
    ]);
  });

  it("refuses when it's too late (already withdrawn or expired)", async () => {
    repo.withdrawMessage.mockResolvedValue(null);
    expect(await withdraw("u1", "m1")).toBe(false);
    expect(repo.shred).not.toHaveBeenCalled();
  });

  it("expiry shreds every message past its 24 hours", async () => {
    repo.shred.mockResolvedValue([{ id: "m1", storage_path: "p", user_id: "u1", email_id: "e1" }]);
    expect(await expireDue()).toBe(1);
    expect(repo.shred).toHaveBeenCalledWith();
    expect(activity).toHaveBeenCalledWith([{ userId: "u1", emailId: "e1", action: "expired" }]);
  });
});
