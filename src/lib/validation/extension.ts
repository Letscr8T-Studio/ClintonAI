import { z } from "zod";

// What GET /api/me tells the Chrome extension. The extension parses it with this same schema, so
// a change here that the extension doesn't expect fails loudly instead of half-working.

export const meSchema = z.object({
  ok: z.literal(true),
  email: z.string().nullable(),
  name: z.string().nullable(),
  /** The Gmail account Clinton AI sends from, or null before "Connect Gmail". */
  gmail: z.object({ email: z.string(), status: z.enum(["active", "revoked", "error"]) }).nullable(),
  defaultDelaySeconds: z.number().int().min(0),
});

export type Me = z.infer<typeof meSchema>;

/** One email the popup can still act on: waiting to leave, or a Safe Send that can be withdrawn. */
export const popupEmailSchema = z.object({
  id: z.string(),
  subject: z.string(),
  to: z.array(z.string()),
  kind: z.enum(["waiting", "withdrawable"]),
  /** When it leaves (waiting), or until when it can be withdrawn. */
  until: z.string(),
  scheduled: z.boolean(),
  /** For withdrawing: the Safe Send message, when there is one. */
  safeSendMessageId: z.string().nullable(),
});

/** What GET /api/outbox tells the extension's popup. Never any email text. */
export const popupOutboxSchema = z.object({ ok: z.literal(true), emails: z.array(popupEmailSchema) });

export type PopupEmail = z.infer<typeof popupEmailSchema>;
