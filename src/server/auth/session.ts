import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getAdminEnv } from "@/server/env";

// Founders-only session: a signed cookie "<expiry>.<base64url email>.<signature>".
// Pure functions (no Next.js imports) so the proxy, routes and tests can all use them.

export const SESSION_COOKIE = "clinton_owner";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/** Constant-time comparison; hashing first makes the lengths equal. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(email: string, now = Date.now()): string | null {
  const env = getAdminEnv();
  if (!env) return null;
  const expires = Math.floor(now / 1000) + SESSION_MAX_AGE;
  const payload = `${expires}.${Buffer.from(email.trim().toLowerCase()).toString("base64url")}`;
  return `${payload}.${sign(payload, env.sessionSecret)}`;
}

/** The admin's email when the token is genuine, unexpired and the email is still allowed. */
export function verifySessionToken(token: string | undefined | null, now = Date.now()): string | null {
  const env = getAdminEnv();
  if (!token || !env) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [expires, emailPart, signature] = parts;
  if (!safeEqual(sign(`${expires}.${emailPart}`, env.sessionSecret), signature)) return null;
  if (!(Number(expires) > now / 1000)) return null;
  const email = Buffer.from(emailPart, "base64url").toString();
  return env.emails.includes(email) ? email : null;
}

/** True only for an allowed email with the right password. Runs both checks so timing reveals nothing. */
export function checkCredentials(email: string, password: string): boolean {
  const env = getAdminEnv();
  if (!env) {
    console.error(
      "[owner] ADMIN_EMAILS / ADMIN_PASSWORD / ADMIN_SESSION_SECRET are not set. Login is disabled.",
    );
    return false;
  }
  const candidate = email.trim().toLowerCase();
  let emailOk = false;
  for (const allowed of env.emails) if (safeEqual(candidate, allowed)) emailOk = true;
  const passwordOk = safeEqual(password, env.password);
  return emailOk && passwordOk;
}
