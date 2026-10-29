import { NextResponse, type NextRequest } from "next/server";
import { appRoutes } from "@/config/routes";
import { safeNextPath } from "@/lib/redirect";
import { getSupabaseForUser } from "@/server/auth/user-client";

// Google → Supabase Auth → here with a one-time code. Exchanging it sets the session cookies.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const toLogin = (reason: string) =>
    NextResponse.redirect(new URL(`${appRoutes.login}?error=${reason}`, request.url));

  // Google sends ?error=access_denied when the user backs out of the consent screen.
  if (searchParams.get("error")) return toLogin("cancelled");

  const code = searchParams.get("code");
  if (!code) return toLogin("callback");

  const supabase = await getSupabaseForUser();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Auth callback failed", error.message);
    return toLogin("callback");
  }

  const next = safeNextPath(searchParams.get("next"), appRoutes.home);
  return NextResponse.redirect(new URL(next, request.url));
}
