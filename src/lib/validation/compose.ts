import { z } from "zod";

// Draft validation, shared by the Compose form (inline errors) and POST /api/check.

export const LIMITS = { to: 100, cc: 50, subject: 998, body: 50_000, attachments: 20 } as const;

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

export const checkRequestSchema = z.object({
  to: z.array(address).min(1, "Add at least one recipient.").max(LIMITS.to),
  cc: z.array(address).max(LIMITS.cc).default([]),
  subject: z.string().max(LIMITS.subject).default(""),
  body: z.string().trim().min(1, "Write something first.").max(LIMITS.body),
  attachments: z.array(z.string().max(255)).max(LIMITS.attachments).default([]),
});

export type CheckRequest = z.infer<typeof checkRequestSchema>;
