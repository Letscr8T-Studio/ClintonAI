// @vitest-environment node
import { randomBytes } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { failureReasons } from "@/content/app/outbox";
import type { EmailRow } from "@/types/database";
import { encryptBody } from "./crypto";
import { deliver } from "./deliver";

// Delivery with send options: attached files (sent, then deleted) and the "Likely opened" pixel.

const m = vi.hoisted(() => ({
  send: vi.fn(),
  update: vi.fn(),
  download: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/server/accounts/repository", () => ({
  getAccountForSending: async () => ({ id: "a1", email: "ada@example.com", status: "active" }),
  getRefreshToken: async () => "refresh",
  setAccountStatus: vi.fn(),
}));
vi.mock("@/server/google/oauth", async (orig) => ({
  ...(await orig<object>()),
  refreshAccessToken: async () => "access",
}));
vi.mock("@/server/google/gmail", async (orig) => ({ ...(await orig<object>()), sendRawMessage: m.send }));
vi.mock("@/server/profiles/repository", () => ({ getSenderName: async () => "Ada Obi" }));
vi.mock("./repository", () => ({ updateEmail: m.update, recordActivity: vi.fn() }));
vi.mock("./attachments", async (orig) => ({
  ...(await orig<object>()),
  downloadAttachments: m.download,
  removeAttachments: m.remove,
}));

const KEY = randomBytes(32);
const FILE = {
  path: "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222",
  name: "deck.pdf",
  size: 9,
  type: "application/pdf",
};
const email = (over: Partial<EmailRow> = {}): EmailRow =>
  ({
    id: "e1",
    user_id: "u1",
    account_id: "a1",
    subject: "Deck",
    to_recipients: ["investor@fund.co"],
    cc_recipients: [],
    bcc_recipients: [],
    body_encrypted: encryptBody("Deck attached.", KEY),
    attempt_count: 1,
    attachments: [],
    track_opens: false,
    safe_send: false,
    ...over,
  }) as EmailRow;
const sentMessage = () => Buffer.from(m.send.mock.calls[0]![1] as string, "base64url").toString("utf8");

beforeEach(() => {
  Object.values(m).forEach((fn) => fn.mockReset());
  vi.stubEnv("EMAIL_ENCRYPTION_KEY", KEY.toString("base64"));
  vi.stubEnv("APP_URL", "https://tryclinton.com");
  m.send.mockResolvedValue("gmail-1");
  m.download.mockResolvedValue([
    { name: "deck.pdf", type: "application/pdf", data: Buffer.from("%PDF fake") },
  ]);
});

describe("deliver with attachments", () => {
  it("sends the files with the email, then deletes them", async () => {
    expect(await deliver(email({ attachments: [FILE] }))).toBe("sent");
    expect(m.download).toHaveBeenCalledWith([FILE]);
    expect(sentMessage()).toContain('Content-Disposition: attachment; filename="deck.pdf"');
    expect(m.remove).toHaveBeenCalledWith([FILE.path]);
  });

  it("fails with a reason (and deletes what's left) when a file is missing or too big", async () => {
    m.download.mockResolvedValue(null);
    expect(await deliver(email({ attachments: [FILE] }))).toBe("failed");
    expect(m.send).not.toHaveBeenCalled();
    expect(m.update).toHaveBeenCalledWith("e1", {
      status: "failed",
      failure_reason: failureReasons.attachmentsMissing,
    });
    expect(m.remove).toHaveBeenCalledWith([FILE.path]);
  });
});

describe("deliver with Likely opened", () => {
  it("adds an HTML copy with the pixel, and stores only the token's hash", async () => {
    expect(await deliver(email({ track_opens: true }))).toBe("sent");
    const message = sentMessage();
    expect(message).toContain("multipart/alternative");
    const html = Buffer.from(
      message.split("text/html")[1]!.split("\r\n\r\n")[1]!.split("\r\n--")[0]!.replace(/\r\n/g, ""),
      "base64",
    ).toString("utf8");
    const token = /https:\/\/tryclinton\.com\/api\/o\/([A-Za-z0-9_-]{43})/.exec(html)![1]!;
    const saved = m.update.mock.calls[0]![1] as { open_token_hash: string };
    expect(saved.open_token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(saved.open_token_hash).not.toContain(token);
  });

  it("sends plain text with no pixel when it's off", async () => {
    await deliver(email());
    expect(sentMessage()).not.toContain("text/html");
    expect(m.update.mock.calls[0]![1]).not.toHaveProperty("open_token_hash");
  });
});
