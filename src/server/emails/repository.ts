import "server-only";
import type { ActivityAction, EmailRow } from "@/types/database";
import type { OutboxEmail } from "@/types/emails";
import { getSupabaseForUser } from "@/server/auth/user-client";
import { getSupabaseAdmin } from "@/server/supabase";

// Reads for the Outbox run as the user (RLS, no body column). Writes and anything touching the
// encrypted body run with the service role, always filtered by the owner.

const OUTBOX_COLUMNS =
  "id, subject, to_recipients, cc_recipients, status, safe_send, send_at, sent_at, failure_reason, created_at";
const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
const fail = (what: string, message: string) => new Error(`Could not ${what}: ${message}`);

/** The last `days` of the user's emails, newest first. */
export async function listOutbox(days = 7): Promise<OutboxEmail[]> {
  const since = new Date(Date.now() - days * 86_400_000);
  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase
    .from("emails")
    .select(OUTBOX_COLUMNS)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw fail("load the Outbox", error.message);
  return data.map((r) => ({
    id: r.id,
    safeSend: r.safe_send,
    subject: r.subject,
    to: list(r.to_recipients),
    cc: list(r.cc_recipients),
    status: r.status,
    sendAt: r.send_at,
    sentAt: r.sent_at,
    failureReason: r.failure_reason,
    createdAt: r.created_at,
  }));
}

export async function hasSentEmail(): Promise<boolean> {
  const supabase = await getSupabaseForUser();
  const { count, error } = await supabase
    .from("emails")
    .select("id", { count: "exact", head: true })
    .eq("status", "sent");
  if (error) throw fail("count sent emails", error.message);
  return (count ?? 0) > 0;
}

export async function insertHeldEmail(row: {
  userId: string;
  accountId: string;
  subject: string;
  to: string[];
  cc: string[];
  bodyEncrypted: string;
  safeSend: boolean;
  sendAt: Date;
  findingsCount: number;
  findingsAccepted: number;
}): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .from("emails")
    .insert({
      user_id: row.userId,
      account_id: row.accountId,
      subject: row.subject,
      to_recipients: row.to,
      cc_recipients: row.cc,
      body_encrypted: row.bodyEncrypted,
      safe_send: row.safeSend,
      send_at: row.sendAt.toISOString(),
      findings_count: row.findingsCount,
      findings_accepted: row.findingsAccepted,
    })
    .select("id")
    .single();
  if (error) throw fail("hold the email", error.message);
  return data.id;
}

/** A held email with its encrypted body, if it belongs to the user and hasn't left yet. */
export async function findHeldEmail(userId: string, id: string): Promise<EmailRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("emails")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("status", "held")
    .maybeSingle();
  if (error) throw fail("load the email", error.message);
  return data;
}

/** Held -> cancelled for the given emails of this user (the trigger wipes their bodies). */
export async function cancelHeld(
  userId: string,
  filter: { id?: string; accountId?: string },
): Promise<string[]> {
  let query = getSupabaseAdmin()
    .from("emails")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("status", "held");
  if (filter.id) query = query.eq("id", filter.id);
  if (filter.accountId) query = query.eq("account_id", filter.accountId);
  const { data, error } = await query.select("id");
  if (error) throw fail("cancel", error.message);
  return data.map((r) => r.id);
}

export async function claimEmails(input: {
  limit?: number;
  emailId?: string;
  userId?: string;
}): Promise<EmailRow[]> {
  const { data, error } = await getSupabaseAdmin().rpc("claim_emails", {
    p_limit: input.limit ?? 20,
    ...(input.emailId ? { p_email_id: input.emailId, p_user_id: input.userId } : {}),
  });
  if (error) throw fail("claim emails", error.message);
  return data;
}

export async function updateEmail(
  id: string,
  change: {
    status: "sent" | "held" | "failed";
    sent_at?: string;
    provider_message_id?: string;
    send_at?: string;
    failure_reason?: string | null;
  },
): Promise<void> {
  const { error } = await getSupabaseAdmin().from("emails").update(change).eq("id", id);
  if (error) throw fail("update the email", error.message);
}

export async function recordActivity(
  entries: { userId: string; emailId: string; action: ActivityAction; recipient?: string }[],
): Promise<void> {
  if (entries.length === 0) return;
  const { error } = await getSupabaseAdmin()
    .from("activity_log")
    .insert(
      entries.map((e) => ({
        user_id: e.userId,
        email_id: e.emailId,
        action: e.action,
        recipient_email: e.recipient ?? null,
      })),
    );
  if (error) throw fail("record activity", error.message);
}
