import { NextResponse, type NextRequest } from "next/server";
import { appRoutes, isProtectedPath } from "@/config/routes";
import { refreshUserSession, withSessionCookies } from "@/server/auth/refresh-session";
import { SESSION_COOKIE, verifySessionToken } from "@/server/auth/session";

const PUBLIC_OWNER_PATHS = new Set(["/owner/login", "/owner/logout"]);

// First line of defence. Every page and route also checks the session itself on the server.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/owner") || pathname.startsWith("/api/owner")) return guardOwner(request);

  // Product routes: keep the Supabase session fresh, and send signed-out visitors to sign in.
  const { response, signedIn } = await refreshUserSession(request);
  if (signedIn || !isProtectedPath(pathname)) return response;

  const login = new URL(appRoutes.login, request.url);
  login.searchParams.set("next", pathname);
  return withSessionCookies(response, NextResponse.redirect(login));
}

/** Founders console: separate signed cookie (see docs/launch-checklist.md for its replacement). */
function guardOwner(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_OWNER_PATHS.has(pathname)) return NextResponse.next();
  if (verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/owner/login", request.url));
}

export const config = {
  // Static list (Next.js requirement). Add new signed-in routes here and in src/config/routes.ts.
  matcher: [
    "/owner/:path*",
    "/api/owner/:path*",
    "/dashboard/:path*",
    "/compose/:path*",
    "/outbox/:path*",
    "/onboarding",
    "/login",
  ],
};
