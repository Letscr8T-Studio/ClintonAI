import { NextResponse, type NextRequest } from "next/server";
import { appRoutes, isProtectedPath } from "@/config/routes";
import { buildCsp, newNonce } from "@/server/csp";
import { refreshUserSession, withSessionCookies } from "@/server/auth/refresh-session";

/** Pages that read the Supabase session, so it's refreshed here first. */
const needsSession = (pathname: string) => isProtectedPath(pathname) || pathname === appRoutes.login;

// Every page: a Content-Security-Policy with a fresh nonce (Next.js reads it from the request
// header and stamps its own scripts). Signed-in pages: keep the Supabase session fresh, and send
// signed-out visitors to sign in. Every page and route also checks the session on the server.
export async function proxy(request: NextRequest) {
  const nonce = newNonce();
  const csp = buildCsp({
    nonce,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    dev: process.env.NODE_ENV === "development",
  });
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);

  const { pathname } = request.nextUrl;
  let response: NextResponse;
  if (needsSession(pathname)) {
    const refreshed = await refreshUserSession(request, headers);
    response = refreshed.response;
    if (!refreshed.signedIn && isProtectedPath(pathname)) {
      const login = new URL(appRoutes.login, request.url);
      login.searchParams.set("next", pathname);
      response = withSessionCookies(response, NextResponse.redirect(login));
    }
  } else {
    response = NextResponse.next({ request: { headers } });
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Pages only: not API routes, static files, images or metadata files. Prefetches skip it too.
  matcher: [
    {
      source:
        "/((?!api|monitoring|_next/static|_next/image|favicon.ico|icon.svg|apple-icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
