import { NextResponse, type NextRequest } from "next/server";
import { appRoutes } from "@/config/routes";
import { getSupabaseForUser } from "@/server/auth/user-client";

// POST only, from the sign-out form, so a link or prefetch can never sign someone out.
export async function POST(request: NextRequest) {
  const supabase = await getSupabaseForUser();
  await supabase.auth.signOut();
  // 303 turns the POST into a GET of the login page.
  return NextResponse.redirect(new URL(appRoutes.login, request.url), { status: 303 });
}
