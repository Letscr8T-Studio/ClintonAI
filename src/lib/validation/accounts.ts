import { z } from "zod";

/** Body of the per-account actions (send a test email, disconnect). */
export const accountActionSchema = z.object({ accountId: z.uuid() });
