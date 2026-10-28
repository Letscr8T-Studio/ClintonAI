import { NextResponse } from "next/server";
import { OWNER_LOGIN_PATH } from "@/server/auth/guard";
import { SESSION_COOKIE } from "@/server/auth/session";

function logout(request: Request) {
  const response = NextResponse.redirect(new URL(OWNER_LOGIN_PATH, request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

export const GET = logout;
export const POST = logout;
