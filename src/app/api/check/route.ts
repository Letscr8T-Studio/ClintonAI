import { NextResponse } from "next/server";
import { panelCopy } from "@/content/app/compose";
import { checkRequestSchema } from "@/lib/validation/compose";
import { runCheck } from "@/server/ai/check";
import { getCheckModel } from "@/server/ai/model";
import { recordCheck } from "@/server/ai/repository";
import { getCurrentUser } from "@/server/auth/user";
import { fail, parseJson } from "@/server/http";
import { createRateLimiter } from "@/server/rate-limit";

/** 30 checks per user per minute. */
const limiter = createRateLimiter({ max: 30, windowMs: 60_000 });

// POST /api/check: the pre-send AI check. Advises only (trust rule 4); the text is not stored (rule 6).
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  if (limiter.isLimited(user.id)) return fail(panelCopy.rateLimited, 429);
  limiter.hit(user.id);

  const parsed = await parseJson(request, checkRequestSchema);
  if (parsed.response) return parsed.response;

  const result = await runCheck(parsed.data, getCheckModel());
  await recordCheck({
    userId: user.id,
    findingTypes: result.findings.map((f) => f.type),
    model: result.modelUsed ? result.modelName : null,
    latencyMs: result.latencyMs,
  }).catch((error: unknown) =>
    console.error("Check not recorded", error instanceof Error ? error.message : error),
  );

  return NextResponse.json({ ok: true, findings: result.findings, modelUsed: result.modelUsed });
}
