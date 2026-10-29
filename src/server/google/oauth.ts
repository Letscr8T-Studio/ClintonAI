import "server-only";
import { z } from "zod";
import { getGoogleEnv } from "@/server/env";

// Google OAuth for "Connect Gmail" (not sign-in). Least privilege: send only, nothing that reads mail.

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const SCOPES = ["openid", "email", GMAIL_SEND_SCOPE];

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";

export class GoogleAuthError extends Error {
  constructor(
    message: string,
    /** Google's error code, e.g. "invalid_grant" when the user revoked access. */
    readonly code?: string,
  ) {
    super(message);
    this.name = "GoogleAuthError";
  }
}

type ConsentInput = { state: string; challenge: string; redirectUri: string; loginHint?: string | null };

export function buildConsentUrl({ state, challenge, redirectUri, loginHint }: ConsentInput): string {
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: getGoogleEnv().clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline", // a refresh token, so Smart Delay can send after the user has left
    prompt: "consent", // always return a refresh token, even on reconnect
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    ...(loginHint ? { login_hint: loginHint } : {}),
  }).toString();
  return url.toString();
}

const tokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string().default(""),
  id_token: z.string().optional(),
});
export type GoogleTokens = z.infer<typeof tokenSchema>;

async function postToken(body: Record<string, string>): Promise<GoogleTokens> {
  const { clientId, clientSecret } = getGoogleEnv();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...body }),
    cache: "no-store",
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = (json as { error?: string }).error;
    throw new GoogleAuthError(`Google token request failed (${res.status})`, code);
  }
  return tokenSchema.parse(json);
}

export function exchangeCode(code: string, verifier: string, redirectUri: string) {
  return postToken({
    grant_type: "authorization_code",
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const tokens = await postToken({ grant_type: "refresh_token", refresh_token: refreshToken });
  return tokens.access_token;
}

/** Best effort: revoking at Google is good hygiene, but disconnecting must not depend on it. */
export async function revokeToken(token: string): Promise<void> {
  await fetch(REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  }).catch(() => undefined);
}

/**
 * The verified address from the ID token. It comes straight from Google's token endpoint over
 * TLS (code flow), so per OpenID Connect the signature check can be skipped.
 */
export function emailFromIdToken(idToken: string | undefined): string | null {
  const payload = idToken?.split(".")[1];
  if (!payload) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: unknown;
      email_verified?: unknown;
    };
    return typeof claims.email === "string" && claims.email_verified === true ? claims.email : null;
  } catch {
    return null;
  }
}

export function grantedScopes(scope: string): string[] {
  return scope.split(" ").filter(Boolean);
}
