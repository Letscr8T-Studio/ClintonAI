import { NextResponse } from "next/server";
import { safeEqual } from "@/server/auth/session";
import { dispatchDue } from "@/server/emails/service";
import { expireDue } from "@/server/safe-send/service";
import { getCronSecret } from "@/server/env";
import { fail } from "@/server/http";

// Called by pg_cron (via pg_net) every 20 seconds with the shared secret. Sends every due email
// and shreds expired Safe Send content.
// Not a user route: no session; the secret is the only way in.
export async function POST(request: Request) {
  const secret = getCronSecret();
  const sent = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || !safeEqual(sent, secret)) return fail("Unauthorized", 401);

  try {
    const counts = await dispatchDue();
    // Same heartbeat: Safe Send content whose 24 hours are up is shredded.
    const expired = await expireDue();
    return NextResponse.json({ ok: true, ...counts, expired });
  } catch (error) {
    console.error("Dispatch failed", error instanceof Error ? error.message : error);
    return fail("Dispatch failed", 500);
  }
}
