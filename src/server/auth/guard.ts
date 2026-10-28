import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createRateLimiter } from "@/server/rate-limit";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export const OWNER_LOGIN_PATH = "/owner/login";
export const OWNER_HOME_PATH = "/owner/dashboard";

/** 5 failed sign-ins per IP per 15 minutes. */
export const loginLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

export async function getAdminSession(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** For founders console pages: anyone not signed in goes to the login form. */
export async function requireAdmin(): Promise<string> {
  const email = await getAdminSession();
  if (!email) redirect(OWNER_LOGIN_PATH);
  return email;
}
