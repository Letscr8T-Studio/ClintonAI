// @vitest-environment node
import { randomBytes } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { failureReasons } from "@/content/app/outbox";
import type { EmailRow } from "@/types/database";
import type * as Gmail from "@/server/google/gmail";
import type * as OAuth from "@/server/google/oauth";
import { GmailSendError } from "@/server/google/gmail";
import { GoogleAuthError } from "@/server/google/oauth";
import { encryptBody } from "./crypto";
import { RETRY_DELAYS_MS, deliver } from "./deliver";

const m = vi.hoisted(() => ({
  account: vi.fn(),
  token: vi.fn(),
  setStatus: vi.fn(),
  refresh: vi.fn(),
  send: vi.fn(),
  name: vi.fn(),
  update: vi.fn(),
  activity: vi.fn(),
}));
vi.mock("@/server/accounts/repository", () => ({
  getAccountForSending: m.account,
  getRefreshToken: m.token,
  setAccountStatus: m.setStatus,
}));
vi.mock("@/server/google/oauth", async (orig) => ({
  ...(await orig<typeof OAuth>()),
  refreshAccessToken: m.refresh,
}));
vi.mock("@/server/google/gmail", async (orig) => ({
  ...(await orig<typeof Gmail>()),
  sendRawMessage: m.send,
}));
vi.mock("@/server/profiles/repository", () => ({ getSenderName: m.name }));
vi.mock("./repository", () => ({ updateEmail: m.update, recordActivity: m.activity }));

const KEY = randomBytes(32);
const NOW = new Date("2026-10-30T10:00:00Z");

const email = (over: Partial<EmailRow> = {}): EmailRow =>
  ({
    id: "e1",
    user_id: "u1",
    account_id: "a1",
    subject: "Q3 update",
    to_recipients: ["investor@fund.co"],
    cc_recipients: [],
    bcc_recipients: [],
    body_encrypted: encryptBody("Hello investors", KEY),
    attempt_count: 1,
    ...over,
  }) as EmailRow;

beforeEach(() => {
  Object.values(m).forEach((fn) => fn.mockReset());
  vi.stubEnv("EMAIL_ENCRYPTION_KEY", KEY.toString("base64"));
  m.account.mockResolvedValue({ id: "a1", email: "ada@example.com", status: "active", connectedAt: "" });
  m.token.mockResolvedValue("refresh");
  m.refresh.mockResolvedValue("access");
  m.send.mockResolvedValue("gmail-123");
  m.name.mockResolvedValue("Ada Obi");
});

describe("deliver", () => {
  it("sends from the user's own address and records it", async () => {
    expect(await deliver(email(), NOW)).toBe("sent");
    const message = Buffer.from(m.send.mock.calls[0]![1] as string, "base64url").toString("utf8");
    expect(message).toContain('From: "Ada Obi" <ada@example.com>');
    expect(message).toContain("To: investor@fund.co");
    expect(m.update).toHaveBeenCalledWith("e1", {
      status: "sent",
      sent_at: NOW.toISOString(),
      provider_message_id: "gmail-123",
      failure_reason: null,
    });
    expect(m.activity).toHaveBeenCalledWith([
      { userId: "u1", emailId: "e1", action: "sent", recipient: "investor@fund.co" },
    ]);
  });

  it("retries a temporary Gmail failure with backoff", async () => {
    m.send.mockRejectedValue(new GmailSendError("busy", 503));
    expect(await deliver(email({ attempt_count: 1 }), NOW)).toBe("retry");
    expect(m.update).toHaveBeenCalledWith("e1", {
      status: "held",
      send_at: new Date(NOW.getTime() + RETRY_DELAYS_MS[0]!).toISOString(),
      failure_reason: failureReasons.temporary,
    });
  });

  it("gives up after the third attempt", async () => {
    m.send.mockRejectedValue(new GmailSendError("busy", 429));
    expect(await deliver(email({ attempt_count: 3 }), NOW)).toBe("failed");
    expect(m.update).toHaveBeenCalledWith("e1", { status: "failed", failure_reason: failureReasons.gaveUp });
  });

  it("fails at once, and marks the account revoked, when Google access was removed", async () => {
    m.refresh.mockRejectedValue(new GoogleAuthError("nope", "invalid_grant"));
    expect(await deliver(email(), NOW)).toBe("failed");
    expect(m.setStatus).toHaveBeenCalledWith("a1", "revoked");
    expect(m.send).not.toHaveBeenCalled();
  });

  it("does not retry a message Gmail refused", async () => {
    m.send.mockRejectedValue(new GmailSendError("bad", 400));
    expect(await deliver(email(), NOW)).toBe("failed");
    expect(m.update).toHaveBeenCalledWith("e1", { status: "failed", failure_reason: failureReasons.refused });
  });

  it("fails without sending when Gmail was disconnected", async () => {
    expect(await deliver(email({ account_id: null }), NOW)).toBe("failed");
    expect(m.send).not.toHaveBeenCalled();
  });

  it("fails, without sending, if the body can't be decrypted", async () => {
    expect(await deliver(email({ body_encrypted: encryptBody("x", randomBytes(32)) }), NOW)).toBe("failed");
    expect(m.update).toHaveBeenCalledWith("e1", {
      status: "failed",
      failure_reason: failureReasons.unreadable,
    });
    expect(m.send).not.toHaveBeenCalled();
  });
});
