import type { EmailStatus } from "./database";

export type SafeSendRecipient = {
  id: string;
  email: string;
  openCount: number;
  firstOpenedAt: string | null;
  withdrawnAt: string | null;
};

/** Safe Send status for one sent email (sender's view). Never includes content or links. */
export type SafeSendInfo = {
  messageId: string;
  expiresAt: string;
  withdrawnAt: string | null;
  contentDeletedAt: string | null;
  recipients: SafeSendRecipient[];
};

/** An email as the Outbox shows it. Never includes the body. */
export type OutboxEmail = {
  id: string;
  /** Chosen for this email when it was sent. */
  safeSend: boolean;
  /** Present once a Safe Send email has been delivered. */
  safeSendInfo?: SafeSendInfo;
  subject: string;
  to: string[];
  cc: string[];
  status: EmailStatus;
  sendAt: string;
  sentAt: string | null;
  failureReason: string | null;
  createdAt: string;
};

/** What the user wrote, as it goes into (or comes back out of) the Outbox. */
export type EmailDraft = { to: string[]; cc: string[]; subject: string; body: string };

export type EmailActionResult = { ok: true } | { ok: false; error: string };
