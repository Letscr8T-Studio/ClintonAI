import { z } from "zod";
import { LIMITS } from "./compose";

/** What "Rewrite with Clinton" can do to the message. */
export const REWRITE_MODES = ["fix", "shorter", "friendlier", "formal"] as const;
export type RewriteMode = (typeof REWRITE_MODES)[number];

/** POST /api/rewrite. The text is sent to the model and never stored (trust rule 6). */
export const rewriteRequestSchema = z.object({
  body: z.string().trim().min(1, "Write something first.").max(LIMITS.body),
  mode: z.enum(REWRITE_MODES),
});

export type RewriteRequest = z.infer<typeof rewriteRequestSchema>;
