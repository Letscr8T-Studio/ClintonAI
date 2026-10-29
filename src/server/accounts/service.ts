import "server-only";
import type { ConnectOutcome } from "@/types/accounts";
import { sendRawMessage } from "@/server/google/gmail";
import { buildPlainEmail } from "@/server/google/mime";
import {
  GMAIL_SEND_SCOPE,
  GoogleAuthError,
  emailFromIdToken,
  grantedScopes,
  refreshAccessToken,
  revokeToken,
  type GoogleTokens,
} from "@/server/google/oauth";
import * as repo from "./repository";

/** Stores a freshly granted Gmail connection, if Google gave us everything we need. */
export async function connectGoogleAccount(userId: string, tokens: GoogleTokens): Promise<ConnectOutcome> {
  const scopes = grantedScopes(tokens.scope);
  // Google's consent screen lets people untick individual permissions.
  if (!scopes.includes(GMAIL_SEND_SCOPE)) return "missing_scope";

  const email = emailFromIdToken(tokens.id_token);
  if (!email || !tokens.refresh_token) return "failed";

  await repo.saveGoogleAccount({ userId, email, scopes, refreshToken: tokens.refresh_token });
  return "connected";
}

export type TestSendResult = { ok: true; email: string } | { ok: false; reason: "not_found" | "revoked" };

type Sender = { name: string | null };
type TestEmail = { subject: string; body: string };

/** Sends a plain email from the account to itself: proof that sending works end to end. */
export async function sendTestEmail(
  accountId: string,
  sender: Sender,
  email: TestEmail,
): Promise<TestSendResult> {
  const account = await repo.findOwnAccount(accountId);
  if (!account) return { ok: false, reason: "not_found" };
  if (account.status === "revoked") return { ok: false, reason: "revoked" };

  const refreshToken = await repo.getRefreshToken(account.id);
  if (!refreshToken) return { ok: false, reason: "revoked" };

  let accessToken: string;
  try {
    accessToken = await refreshAccessToken(refreshToken);
  } catch (error) {
    // invalid_grant: the user removed access in their Google account, or the token expired.
    if (error instanceof GoogleAuthError && error.code === "invalid_grant") {
      await repo.setAccountStatus(account.id, "revoked");
      return { ok: false, reason: "revoked" };
    }
    throw error;
  }

  const raw = buildPlainEmail({
    from: { email: account.email, name: sender.name },
    to: [account.email],
    subject: email.subject,
    body: email.body,
  });
  await sendRawMessage(accessToken, raw);
  return { ok: true, email: account.email };
}

/** Revokes at Google (best effort), then deletes the account and its stored token. */
export async function disconnectAccount(userId: string, accountId: string): Promise<boolean> {
  const account = await repo.findOwnAccount(accountId);
  if (!account) return false;
  const refreshToken = await repo.getRefreshToken(account.id);
  if (refreshToken) await revokeToken(refreshToken);
  await repo.deleteAccount(userId, account.id);
  return true;
}
