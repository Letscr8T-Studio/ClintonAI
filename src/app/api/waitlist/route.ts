import { MESSAGES, joinWaitlistSchema } from "@/lib/validation/waitlist";
import { clientIp, fail, ok, parseJson } from "@/server/http";
import { createRateLimiter } from "@/server/rate-limit";
import { addToWaitlist } from "@/server/waitlist/repository";

export const runtime = "nodejs";

const limiter = createRateLimiter({ max: 10, windowMs: 60_000 });

// POST /api/waitlist  { email, company?, source? }
// Saves the email. Joining twice is success; a filled honeypot is silently accepted.
export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  if (limiter.isLimited(ip)) return fail(MESSAGES.rateLimited, 429);
  limiter.hit(ip);

  const { data, response } = await parseJson(request, joinWaitlistSchema);
  if (response) return response;
  if (data.company) return ok();

  try {
    await addToWaitlist(data.email, data.source || null);
    return ok();
  } catch (err) {
    console.error("[api/waitlist]", err);
    return fail(MESSAGES.generic, 500);
  }
}
