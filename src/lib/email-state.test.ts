import { describe, expect, it } from "vitest";
import { outboxDefaults } from "@/test/fixtures";
import type { OutboxEmail, SafeSendInfo } from "@/types/emails";
import { emailState } from "./email-state";

const NOW = new Date("2026-11-02T10:00:00Z").getTime();
const later = new Date(NOW + 3_600_000).toISOString();
const earlier = new Date(NOW - 3_600_000).toISOString();

const email = (over: Partial<OutboxEmail> = {}): OutboxEmail => ({
  id: "e1",
  safeSend: false,
  subject: "Hi",
  to: ["a@b.co"],
  cc: [],
  ...outboxDefaults,
  status: "sent",
  sendAt: later,
  sentAt: earlier,
  failureReason: null,
  createdAt: earlier,
  ...over,
});
const info = (over: Partial<SafeSendInfo> = {}): SafeSendInfo => ({
  messageId: "m1",
  expiresAt: later,
  withdrawnAt: null,
  contentDeletedAt: null,
  recipients: [],
  ...over,
});

describe("emailState", () => {
  it("a waiting email can be cancelled until it leaves", () => {
    expect(emailState(email({ status: "held" }), NOW)).toEqual({ kind: "waiting", until: later });
  });

  it("a plain sent email can no longer be taken back", () => {
    expect(emailState(email(), NOW)).toEqual({ kind: "sent" });
  });

  it("a Safe Send email can be withdrawn until it expires", () => {
    expect(emailState(email({ safeSend: true, safeSendInfo: info() }), NOW)).toEqual({
      kind: "withdrawable",
      until: later,
    });
  });

  it("a withdrawn Safe Send says so, even before its window ends", () => {
    expect(emailState(email({ safeSendInfo: info({ withdrawnAt: earlier }) }), NOW).kind).toBe("withdrawn");
  });

  it("a Safe Send past its window (or shredded) has expired", () => {
    expect(emailState(email({ safeSendInfo: info({ expiresAt: earlier }) }), NOW).kind).toBe("expired");
    expect(emailState(email({ safeSendInfo: info({ contentDeletedAt: earlier }) }), NOW).kind).toBe(
      "expired",
    );
  });

  it("passes other statuses through", () => {
    expect(emailState(email({ status: "failed" }), NOW).kind).toBe("failed");
    expect(emailState(email({ status: "cancelled" }), NOW).kind).toBe("cancelled");
    expect(emailState(email({ status: "sending" }), NOW).kind).toBe("sending");
  });
});
