import { z } from "zod";
import { delaySecondsSchema } from "./profile";

/** Each Safe Send recipient gets their own copy and link. */
export const SAFE_SEND_MAX_RECIPIENTS = 20;

// Draft validation, shared by the Compose form (inline errors) and POST /api/check.

export const LIMITS = { to: 100, cc: 50, bcc: 50, subject: 998, body: 50_000, attachments: 10 } as const;

/** Attachments: Gmail takes 25 MB per message, and base64 adds a third, so 18 MB of files. */
export const ATTACHMENT_MAX_BYTES = 18 * 1024 * 1024;

/** Send later: at least a minute ahead (anything sooner is what Smart Delay is for), at most 30 days. */
export const SCHEDULE = { minMs: 60_000, maxMs: 30 * 86_400_000 } as const;

/** "a@x.co, b@y.co; c@z.co" → ["a@x.co", "b@y.co", "c@z.co"], trimmed and de-duplicated. */
export function splitAddresses(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(/[,;\n]+/)
    .map((a) => a.trim())
    .filter((a) => {
      const key = a.toLowerCase();
      if (!a || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const address = z.email().max(254);

/** Entries in a list that are not valid email addresses. */
export function invalidAddresses(list: string[]): string[] {
  return list.filter((a) => !address.safeParse(a).success);
}

/** A file name safe for a mail header: no line breaks or path separators. */
const fileName = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine((n) => !/[\r\n/\\]/.test(n), "That file name can't be used.");
const mimeType = z
  .string()
  .max(127)
  .regex(/^[\w.+-]+\/[\w.+-]+$/)
  .catch("application/octet-stream");

/** POST /api/attachments: ask for a place to upload one file. */
export const uploadRequestSchema = z.object({
  name: fileName,
  size: z.number().int().min(1).max(ATTACHMENT_MAX_BYTES, "Files can be up to 18 MB in total."),
  type: mimeType,
});

export const attachmentSchema = z.object({
  /** "<user id>/<random id>": the route checks the folder is the sender's own. */
  path: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}$/),
  name: fileName,
  size: z.number().int().min(1).max(ATTACHMENT_MAX_BYTES),
  type: mimeType,
});

const totalSize = (files: { size: number }[]) => files.reduce((sum, f) => sum + f.size, 0);

export const checkRequestSchema = z.object({
  to: z.array(address).min(1, "Add at least one recipient.").max(LIMITS.to),
  cc: z.array(address).max(LIMITS.cc).default([]),
  bcc: z.array(address).max(LIMITS.bcc).default([]),
  subject: z.string().max(LIMITS.subject).default(""),
  body: z.string().trim().min(1, "Write something first.").max(LIMITS.body),
  /** File names, so "see attached" isn't flagged when something is attached. */
  attachments: z.array(z.string().max(255)).max(LIMITS.attachments).default([]),
  /** The writer's IANA time zone ("Africa/Lagos"), so times like "today at 10am" can be judged. */
  timeZone: z.string().max(64).optional(),
});

export type CheckRequest = z.infer<typeof checkRequestSchema>;

/** POST /api/emails: the checked draft, when it leaves, and how the AI check went (counts only). */
export const queueRequestSchema = checkRequestSchema
  .omit({ attachments: true, timeZone: true })
  .extend({
    attachments: z.array(attachmentSchema).max(LIMITS.attachments).default([]),
    delaySeconds: delaySecondsSchema.optional(),
    /** Send later: an exact time instead of the Smart Delay. */
    sendAt: z.iso.datetime({ offset: true }).optional(),
    findingsCount: z.number().int().min(0).max(100).default(0),
    findingsAccepted: z.number().int().min(0).max(100).default(0),
    safeSend: z.boolean().default(false),
    /** "Likely opened" for this email (off unless the user turned it on). */
    trackOpens: z.boolean().default(false),
    /** The checks run while writing it, so the dashboard can show what Clinton caught. */
    checkIds: z.array(z.uuid()).max(20).default([]),
  })
  .refine((d) => totalSize(d.attachments) <= ATTACHMENT_MAX_BYTES, {
    message: "Attachments can be up to 18 MB in total.",
    path: ["attachments"],
  })
  .refine((d) => !d.safeSend || d.to.length + d.cc.length + d.bcc.length <= SAFE_SEND_MAX_RECIPIENTS, {
    message: `Safe Send works for up to ${SAFE_SEND_MAX_RECIPIENTS} people.`,
    path: ["to"],
  })
  .refine((d) => !d.safeSend || d.attachments.length === 0, {
    message: "Safe Send can't carry attachments yet. Remove them or turn Safe Send off.",
    path: ["attachments"],
  })
  .refine((d) => !(d.safeSend && d.trackOpens), {
    message: "Safe Send already shows who opened it.",
    path: ["trackOpens"],
  });

export type QueueRequest = z.infer<typeof queueRequestSchema>;

/** Whether a Send later time is allowed, relative to now. */
export function scheduleError(sendAt: Date, now = new Date()): string | null {
  const ahead = sendAt.getTime() - now.getTime();
  if (Number.isNaN(ahead) || ahead < SCHEDULE.minMs) return "Pick a time at least a minute from now.";
  if (ahead > SCHEDULE.maxMs) return "Emails can be scheduled up to 30 days ahead.";
  return null;
}

export const emailIdSchema = z.uuid();

/** POST /api/safe-send/:messageId/withdraw: everyone, or one recipient. */
export const withdrawSchema = z.object({ recipientId: z.uuid().optional() });
