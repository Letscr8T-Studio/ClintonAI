import { NextResponse } from "next/server";
import { lagosDay } from "@/lib/time";
import { getAdminAccess, logAdminAccess } from "@/server/auth/admin";
import { fail } from "@/server/http";
import { signupsToCsv } from "@/server/waitlist/csv";
import { listAllSignups } from "@/server/waitlist/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/owner/export: every signup as a CSV download. Founders only (with their second step).
export async function GET() {
  const access = await getAdminAccess();
  if (access.kind !== "ok") return fail("Unauthorized", 401);
  await logAdminAccess(access.user.id, "export signups");

  try {
    const csv = signupsToCsv(await listAllSignups());
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="clinton-ai-waitlist-${lagosDay(new Date())}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/owner/export]", err);
    return fail("Export failed.", 500);
  }
}
