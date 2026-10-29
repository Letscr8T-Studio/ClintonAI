import "server-only";
import { failureReasons as reasons } from "@/content/app/outbox";
import type { EmailRow } from "@/types/database";
import { getAccountForSending, getRefreshToken, setAccountStatus } from "@/server/accounts/repository";
import { GmailSendError, sendRawMessage } from "@/server/google/gmail";
import { MimeError, buildPlainEmail } from "@/server/google/mime";
import { GoogleAuthError, refreshAccessToken } from "@/server/google/oauth";
import { getSenderName } from "@/server/profiles/repository";
import { DecryptError, decryptBody } from "./crypto";
import { recordActivity, updateEmail } from "./repository";

export const MAX_ATTEMPTS = 3;
/** Wait before attempt 2, then attempt 3. */
export const RETRY_DELAYS_MS = [60_000, 5 * 60_000];

export type DeliveryOutcome = "sent" | "retry" | "failed";

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/**
 * Sends one claimed email (status "sending") from the user's own Gmail (trust rule 5), then records
 * the result. Temporary Gmail trouble is retried with backoff; anything else fails with a reason.
 */
export async function deliver(email: EmailRow, now = new Date()): Promise<DeliveryOutcome> {
  const to = strings(email.to_recipients);
  const activity = (action: "sent" | "failed") =>
    recordActivity([{ userId: email.user_id, emailId: email.id, action, recipient: to[0] }]);

  const fail = async (reason: string): Promise<DeliveryOutcome> => {
    await updateEmail(email.id, { status: "failed", failure_reason: reason });
    await activity("failed");
    return "failed";
  };
  const retryOrFail = async (): Promise<DeliveryOutcome> => {
    if (email.attempt_count >= MAX_ATTEMPTS) return fail(reasons.gaveUp);
    const wait = RETRY_DELAYS_MS[email.attempt_count - 1] ?? RETRY_DELAYS_MS.at(-1)!;
    await updateEmail(email.id, {
      status: "held",
      send_at: new Date(now.getTime() + wait).toISOString(),
      failure_reason: reasons.temporary,
    });
    return "retry";
  };

  if (!email.account_id || !email.body_encrypted) return fail(reasons.noAccount);
  const account = await getAccountForSending(email.account_id);
  if (!account) return fail(reasons.noAccount);
  if (account.status === "revoked") return fail(reasons.revoked);

  let body: string;
  try {
    body = decryptBody(email.body_encrypted);
  } catch (error) {
    if (error instanceof DecryptError) return fail(reasons.unreadable);
    throw error;
  }

  const refreshToken = await getRefreshToken(account.id);
  if (!refreshToken) return fail(reasons.revoked);
  let accessToken: string;
  try {
    accessToken = await refreshAccessToken(refreshToken);
  } catch (error) {
    if (error instanceof GoogleAuthError && error.code === "invalid_grant") {
      await setAccountStatus(account.id, "revoked");
      return fail(reasons.revoked);
    }
    return retryOrFail();
  }

  try {
    const raw = buildPlainEmail({
      from: { email: account.email, name: await getSenderName(email.user_id) },
      to,
      cc: strings(email.cc_recipients),
      bcc: strings(email.bcc_recipients),
      subject: email.subject,
      body,
    });
    const messageId = await sendRawMessage(accessToken, raw);
    await updateEmail(email.id, {
      status: "sent",
      sent_at: now.toISOString(),
      provider_message_id: messageId,
      failure_reason: null,
    });
    await activity("sent");
    return "sent";
  } catch (error) {
    // Rate limits and Google outages are worth another try; a refused message is not.
    if (error instanceof GmailSendError && (error.status === 429 || error.status >= 500))
      return retryOrFail();
    if (error instanceof GmailSendError || error instanceof MimeError) return fail(reasons.refused);
    throw error;
  }
}
