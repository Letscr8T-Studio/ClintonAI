import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/server/auth/session";

const PUBLIC_OWNER_PATHS = new Set(["/owner/login", "/owner/logout"]);

// First line of defence for the founders console. Every /owner page and
// /api/owner route also checks the session itself on the server.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_OWNER_PATHS.has(pathname)) return NextResponse.next();
  if (verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/owner/login", request.url));
}

export const config = {
  matcher: ["/owner/:path*", "/api/owner/:path*"],
};
