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
  /** File names only, for the list. */
  attachments: string[];
  /** Sent later at a time the user picked, rather than after the Smart Delay. */
  scheduled: boolean;
  /** "Likely opened" was on for it: opens are a guess (images preload or are blocked). */
  trackOpens: boolean;
  opensCount: number;
  firstOpenedAt: string | null;
  status: EmailStatus;
  sendAt: string;
  sentAt: string | null;
  failureReason: string | null;
  createdAt: string;
};

/** A file attached in Compose: uploaded to the user's own folder, sent with the email, then deleted. */
export type AttachmentRef = { path: string; name: string; size: number; type: string };

/** What the user wrote, as it goes into (or comes back out of) the Outbox. */
export type EmailDraft = {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  attachments: AttachmentRef[];
};

export type EmailActionResult = { ok: true } | { ok: false; error: string };
