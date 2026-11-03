import { NextResponse } from "next/server";
import { rewriteCopy } from "@/content/app/compose-options";
import { rewriteRequestSchema } from "@/lib/validation/rewrite";
import { canRewrite, rewriteEmail } from "@/server/ai/rewrite";
import { getCurrentUser } from "@/server/auth/user";
import { fail, parseJson } from "@/server/http";
import { createRateLimiter } from "@/server/rate-limit";

/** 20 rewrites per user per minute. */
const limiter = createRateLimiter({ name: "rewrite", max: 20, windowMs: 60_000 });

// POST /api/rewrite: "Rewrite with Clinton". Returns the new text; nothing is stored (trust rule 6)
// and Compose lets the user undo it (trust rule 4).
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  if (await limiter.take(user.id)) return fail(rewriteCopy.rateLimited, 429);

  const parsed = await parseJson(request, rewriteRequestSchema);
  if (parsed.response) return parsed.response;
  if (!canRewrite()) return fail(rewriteCopy.unavailable, 503);

  try {
    const text = await rewriteEmail(parsed.data.body, parsed.data.mode);
    return NextResponse.json({ ok: true, text });
  } catch (error) {
    // The reason only; never the email.
    console.warn("Rewrite failed", error instanceof Error ? error.name : "unknown");
    return fail(rewriteCopy.failed, 502);
  }
}
