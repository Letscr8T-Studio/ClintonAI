import "server-only";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseAuthEnv } from "@/server/env";

/**
 * Runs in the proxy on app routes: refreshes an expiring Supabase session and writes the new
 * cookies to both the request (for the page) and the response (for the browser).
 */
export async function refreshUserSession(
  request: NextRequest,
  /** Request headers to pass on to the page (e.g. the CSP nonce). */
  headers: Headers = new Headers(request.headers),
): Promise<{ response: NextResponse; signedIn: boolean }> {
  const { url, publishableKey } = getSupabaseAuthEnv();
  let response = NextResponse.next({ request: { headers } });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        headers.set("cookie", request.headers.get("cookie") ?? "");
        response = NextResponse.next({ request: { headers } });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  // Validates the token (not just decodes it). Must run before anything reads the session.
  const { data } = await supabase.auth.getClaims();
  return { response, signedIn: Boolean(data?.claims?.sub) };
}

/** Copies refreshed session cookies onto a redirect so they aren't lost. */
export function withSessionCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  return to;
}
