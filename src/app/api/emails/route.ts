import { NextResponse } from "next/server";
import { emailActionErrors as errors } from "@/content/app/outbox";
import { queueRequestSchema } from "@/lib/validation/compose";
import { getCurrentUser } from "@/server/auth/user";
import { queueEmail } from "@/server/emails/service";
import { fail, parseJson } from "@/server/http";
import { getProfile } from "@/server/profiles/repository";
import { createRateLimiter } from "@/server/rate-limit";

/** 20 emails per user per minute. */
const limiter = createRateLimiter({ max: 20, windowMs: 60_000 });

// POST /api/emails: put a checked email in the Outbox. It leaves when its Smart Delay ends.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  if (limiter.isLimited(user.id)) return fail(errors.rateLimited, 429);
  limiter.hit(user.id);

  const parsed = await parseJson(request, queueRequestSchema);
  if (parsed.response) return parsed.response;
  const { to, cc, subject, body, delaySeconds, findingsCount, findingsAccepted, safeSend, checkIds } =
    parsed.data;

  try {
    const delay = delaySeconds ?? (await getProfile(user.id))?.default_delay_seconds ?? 300;
    const queued = await queueEmail(user, {
      draft: { to, cc, subject, body },
      delaySeconds: delay,
      findingsCount,
      findingsAccepted,
      safeSend,
      checkIds,
    });
    if (!queued) return fail(errors.noAccount, 409);
    return NextResponse.json({ ok: true, id: queued.id, sendAt: queued.sendAt.toISOString() });
  } catch (error) {
    console.error("Queueing failed", error instanceof Error ? error.message : error);
    return fail(errors.failed, 500);
  }
}
