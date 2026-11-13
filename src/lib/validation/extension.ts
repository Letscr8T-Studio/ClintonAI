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
