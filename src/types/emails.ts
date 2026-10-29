import type { EmailStatus } from "./database";

/** An email as the Outbox shows it. Never includes the body. */
export type OutboxEmail = {
  id: string;
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
