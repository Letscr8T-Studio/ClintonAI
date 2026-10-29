import "server-only";
import type { SafeSendInfo } from "@/types/emails";
import { getSupabaseForUser } from "@/server/auth/user-client";
import { getSupabaseAdmin } from "@/server/supabase";

// Writes and anything secret go through the locked-down database functions (service role).
// The sender's Outbox view reads as the user (RLS: own rows, no keys, paths or token hashes).

const fail = (what: string, message: string) => new Error(`Could not ${what}: ${message}`);

export async function createSafeSend(input: {
  emailId: string;
  userId: string;
  storagePath: string;
  dataKey: string;
  recipients: { email: string; tokenHash: string }[];
}): Promise<{ messageId: string; expiresAt: string }> {
  const { data, error } = await getSupabaseAdmin().rpc("create_safe_send", {
    p_email_id: input.emailId,
    p_user_id: input.userId,
    p_storage_path: input.storagePath,
    p_data_key: input.dataKey,
    p_recipients: input.recipients.map((r) => ({ email: r.email, token_hash: r.tokenHash })),
  });
  const row = data?.[0];
  if (error || !row) throw fail("create the Safe Send message", error?.message ?? "no row");
  return { messageId: row.message_id, expiresAt: row.expires_at };
}

export async function getDataKey(messageId: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin().rpc("get_safe_send_key", { p_message_id: messageId });
  if (error) throw fail("read the Safe Send key", error.message);
  return data ?? null;
}

/** Opening a link: the page's data, and the open counted (only while readable). */
export async function openByTokenHash(tokenHash: string) {
  const { data, error } = await getSupabaseAdmin().rpc("open_safe_send", { p_token_hash: tokenHash });
  if (error) throw fail("open the Safe Send message", error.message);
  return data?.[0] ?? null;
}

/** Destroys keys (one message, or every expired one) and returns the files to delete. */
export async function shred(messageId?: string) {
  const { data, error } = await getSupabaseAdmin().rpc(
    "shred_safe_send",
    messageId ? { p_message_id: messageId } : {},
  );
  if (error) throw fail("shred Safe Send content", error.message);
  return data;
}

/** Withdraw for everyone (still inside the 24 hours). True if this call withdrew it. */
export async function withdrawMessage(
  userId: string,
  messageId: string,
): Promise<{ emailId: string } | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("safe_send_messages")
    .update({ withdrawn_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("user_id", userId)
    .is("withdrawn_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("email_id")
    .maybeSingle();
  if (error) throw fail("withdraw", error.message);
  return data ? { emailId: data.email_id } : null;
}

/** Withdraw for particular people, by recipient id or address. Returns the addresses withdrawn. */
export async function withdrawRecipients(
  userId: string,
  messageId: string,
  who: { ids: string[] } | { emails: string[] },
): Promise<string[]> {
  let query = getSupabaseAdmin()
    .from("safe_send_recipients")
    .update({ withdrawn_at: new Date().toISOString() })
    .eq("message_id", messageId)
    .eq("user_id", userId)
    .is("withdrawn_at", null);
  query = "ids" in who ? query.in("id", who.ids) : query.in("recipient_email", who.emails);
  const { data, error } = await query.select("recipient_email");
  if (error) throw fail("withdraw", error.message);
  return data.map((r) => r.recipient_email);
}

/** Which email a Safe Send message belongs to (for the activity history). */
export async function messageEmailId(userId: string, messageId: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("safe_send_messages")
    .select("email_id")
    .eq("id", messageId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw fail("load Safe Send", error.message);
  return data?.email_id ?? null;
}

/** Removes a message that never went out (sending failed before the first copy left). */
export async function deleteUnsent(messageId: string): Promise<void> {
  await shred(messageId);
  const { error } = await getSupabaseAdmin().from("safe_send_messages").delete().eq("id", messageId);
  if (error) throw fail("clean up Safe Send", error.message);
}

/** The Outbox's Safe Send panels, for the given emails. */
export async function listForEmails(emailIds: string[]): Promise<Map<string, SafeSendInfo>> {
  const result = new Map<string, SafeSendInfo>();
  if (emailIds.length === 0) return result;
  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase
    .from("safe_send_messages")
    .select(
      "id, email_id, expires_at, withdrawn_at, content_deleted_at, safe_send_recipients (id, recipient_email, open_count, first_opened_at, withdrawn_at)",
    )
    .in("email_id", emailIds);
  if (error) throw fail("load Safe Send", error.message);
  for (const m of data) {
    result.set(m.email_id, {
      messageId: m.id,
      expiresAt: m.expires_at,
      withdrawnAt: m.withdrawn_at,
      contentDeletedAt: m.content_deleted_at,
      recipients: m.safe_send_recipients.map((r) => ({
        id: r.id,
        email: r.recipient_email,
        openCount: r.open_count,
        firstOpenedAt: r.first_opened_at,
        withdrawnAt: r.withdrawn_at,
      })),
    });
  }
  return result;
}
