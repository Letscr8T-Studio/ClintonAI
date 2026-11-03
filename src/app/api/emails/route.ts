import { NextResponse } from "next/server";
import { emailActionErrors as errors } from "@/content/app/outbox";
import { queueRequestSchema, scheduleError } from "@/lib/validation/compose";
import { getCurrentUser } from "@/server/auth/user";
import { queueEmail, sendNow } from "@/server/emails/service";
import { fail, parseJson } from "@/server/http";
import { getProfile } from "@/server/profiles/repository";
import { createRateLimiter } from "@/server/rate-limit";

/** 20 emails per user per minute. */
const limiter = createRateLimiter({ name: "emails", max: 20, windowMs: 60_000 });

// POST /api/emails: put a checked email in the Outbox. It leaves when its Smart Delay ends, or at
// the time the user picked (Send later).
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  if (await limiter.take(user.id)) return fail(errors.rateLimited, 429);

  const parsed = await parseJson(request, queueRequestSchema);
  if (parsed.response) return parsed.response;
  const { to, cc, bcc, subject, body, attachments, delaySeconds, sendAt, ...rest } = parsed.data;

  // Files can only come from the sender's own upload folder.
  if (attachments.some((a) => !a.path.startsWith(`${user.id}/`))) return fail(errors.badAttachment, 400);
  const scheduledAt = sendAt ? new Date(sendAt) : null;
  const tooSoon = scheduledAt ? scheduleError(scheduledAt) : null;
  if (tooSoon) return fail(tooSoon, 400);

  try {
    const delay = delaySeconds ?? (await getProfile(user.id))?.default_delay_seconds ?? 300;
    const queued = await queueEmail(user, {
      draft: { to, cc, bcc, subject, body, attachments },
      delaySeconds: delay,
      sendAt: scheduledAt,
      findingsCount: rest.findingsCount,
      findingsAccepted: rest.findingsAccepted,
      safeSend: rest.safeSend,
      trackOpens: rest.trackOpens,
      checkIds: rest.checkIds,
    });
    if (!queued) return fail(errors.noAccount, 409);
    // Smart Delay off: send it now instead of waiting for the dispatcher. If this fails, the
    // email is still held and due, so the dispatcher picks it up with the normal retries.
    if (delay === 0 && !scheduledAt) {
      await sendNow(user, queued.id).catch((error: unknown) =>
        console.error("Immediate send failed", error instanceof Error ? error.message : error),
      );
    }
    return NextResponse.json({ ok: true, id: queued.id, sendAt: queued.sendAt.toISOString() });
  } catch (error) {
    console.error("Queueing failed", error instanceof Error ? error.message : error);
    return fail(errors.failed, 500);
  }
}
