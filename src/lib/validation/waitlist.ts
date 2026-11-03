import { z } from "zod";
import { normaliseEmail } from "@/lib/email";

// Request bodies for the public waitlist API. Shared so client and server agree on the contract.

export const MESSAGES = {
  invalidEmail: "That email doesn't look right.",
  invalidRequest: "Invalid request.",
  generic: "Something went wrong. Please try again.",
  rateLimited: "Too many attempts. Please wait a minute and try again.",
} as const;

// `.optional()` before each transform: in Zod 4 a missing key would otherwise fail
// with a generic "nonoptional" error instead of reaching our own checks.
const email = z
  .unknown()
  .optional()
  .transform((value, ctx) => {
    const normalised = normaliseEmail(value);
    if (!normalised) {
      ctx.addIssue({ code: "custom", message: MESSAGES.invalidEmail });
      return z.NEVER;
    }
    return normalised;
  });

const optionalText = (max: number) =>
  z
    .unknown()
    .optional()
    .transform((value) => (typeof value === "string" ? value.trim().slice(0, max) : ""));

export const joinWaitlistSchema = z.object({
  email,
  /** Honeypot: hidden from people, bots tend to fill it. */
  company: optionalText(200),
  source: optionalText(200),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

/** Shape every public JSON endpoint returns. */
export type ApiResult = { ok: true } | { ok: false; error: string };
