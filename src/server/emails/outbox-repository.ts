import "server-only";
import type { OutboxEmail } from "@/types/emails";
import { getSupabaseForUser } from "@/server/auth/user-client";

// Reads for the Outbox and Home, as the signed-in user: RLS limits them to their own emails, and
// column grants keep the encrypted body (and the pixel token hash) out of reach.

const OUTBOX_COLUMNS =
  "id, subject, to_recipients, cc_recipients, attachments, scheduled, track_opens, opens_count, first_opened_at, status, safe_send, send_at, sent_at, failure_reason, created_at";
const fileNames = (value: unknown): string[] =>
  Array.isArray(value) ? value.flatMap((f) => (typeof f?.name === "string" ? [f.name] : [])) : [];
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
    attachments: fileNames(r.attachments),
    scheduled: r.scheduled,
    trackOpens: r.track_opens,
    opensCount: r.opens_count,
    firstOpenedAt: r.first_opened_at,
    status: r.status,
    sendAt: r.send_at,
    sentAt: r.sent_at,
    failureReason: r.failure_reason,
    createdAt: r.created_at,
  }));
}

/** Ever sent an email (or, with safeSendOnly, a Safe Send one) through Clinton AI. */
export async function hasSentEmail({ safeSendOnly = false } = {}): Promise<boolean> {
  const supabase = await getSupabaseForUser();
  let query = supabase.from("emails").select("id", { count: "exact", head: true }).eq("status", "sent");
  if (safeSendOnly) query = query.eq("safe_send", true);
  const { count, error } = await query;
  if (error) throw fail("count sent emails", error.message);
  return (count ?? 0) > 0;
}
