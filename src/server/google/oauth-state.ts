import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { safeEqual } from "@/server/auth/session";

// The "Connect Gmail" round trip: a random state (CSRF) and a PKCE verifier, kept in a short-lived
// httpOnly cookie and bound to the signed-in user, so a callback can't be replayed or swapped.

export const OAUTH_COOKIE = "clinton_gmail_oauth";
export const OAUTH_COOKIE_PATH = "/api/google";

export const oauthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: OAUTH_COOKIE_PATH,
  maxAge: 10 * 60,
};

export type OAuthState = { state: string; verifier: string; userId: string };

export function createOAuthState(userId: string): OAuthState {
  return {
    state: randomBytes(24).toString("base64url"),
    verifier: randomBytes(48).toString("base64url"),
    userId,
  };
}

/** S256 PKCE challenge for a verifier. */
export function pkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function encodeOAuthState(value: OAuthState): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function decodeOAuthState(raw: string | undefined): OAuthState | null {
  if (!raw || raw.length > 1000) return null;
  try {
    const value = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Partial<OAuthState>;
    if (
      typeof value.state !== "string" ||
      typeof value.verifier !== "string" ||
      typeof value.userId !== "string"
    ) {
      return null;
    }
    return { state: value.state, verifier: value.verifier, userId: value.userId };
  } catch {
    return null;
  }
}

/** True only when Google echoed our state and the same user is finishing the flow. */
export function stateMatches(
  saved: OAuthState | null,
  returnedState: string | null,
  userId: string,
): boolean {
  if (!saved || !returnedState) return false;
  return safeEqual(saved.state, returnedState) && saved.userId === userId;
}
