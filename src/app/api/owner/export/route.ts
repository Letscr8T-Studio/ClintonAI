import { NextResponse } from "next/server";
import { lagosDay } from "@/lib/time";
import { getAdminSession } from "@/server/auth/guard";
import { fail } from "@/server/http";
import { signupsToCsv } from "@/server/waitlist/csv";
import { listAllSignups } from "@/server/waitlist/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/owner/export: every signup as a CSV download. Founders only.
export async function GET() {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);

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
