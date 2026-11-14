import "server-only";
import { DASHBOARD_DAYS } from "@/content/app/dashboard";
import type { ActivityItem, CaughtEmail, DashboardStats } from "@/types/dashboard";
import { getSupabaseForUser } from "@/server/auth/user-client";

// Every read here runs as the signed-in user, so RLS limits it to their own rows.

const fail = (what: string, message: string) => new Error(`Could not load ${what}: ${message}`);
const since = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export async function getStats(days = DASHBOARD_DAYS): Promise<DashboardStats> {
  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase.rpc("dashboard_stats", { p_since: since(days) }).single();
  if (error) throw fail("your numbers", error.message);
  return {
    sent: data.sent,
    caught: data.caught,
    fixed: data.fixed,
    safeSendPeople: data.safe_send_people,
    safeSendOpened: data.safe_send_opened,
    waiting: data.waiting,
    withdrawable: data.withdrawable,
  };
}

/** Recent emails Clinton flagged something on, with the kinds of mistake (not the words). */
export async function listCaught(limit = 6, days = DASHBOARD_DAYS): Promise<CaughtEmail[]> {
  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase
    .from("emails")
    .select(
      "id, subject, status, findings_count, findings_accepted, created_at, ai_check_events (finding_types)",
    )
    .gt("findings_count", 0)
    .gte("created_at", since(days))
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw fail("what Clinton caught", error.message);
  return data.map((e) => ({
    id: e.id,
    subject: e.subject,
    status: e.status,
    caught: e.findings_count,
    fixed: Math.min(e.findings_accepted, e.findings_count),
    kinds: [...new Set(e.ai_check_events.flatMap((c) => c.finding_types))],
    createdAt: e.created_at,
  }));
}

/**
 * The history, newest first. `skipHeld` leaves out "put in the Outbox" entries: on Home they
 * repeat every email; the History page shows them.
 */
export async function listActivity(
  limit = 12,
  { skipHeld = false, days = DASHBOARD_DAYS } = {},
): Promise<ActivityItem[]> {
  const supabase = await getSupabaseForUser();
  let query = supabase
    .from("activity_log")
    .select("id, action, recipient_email, created_at, emails (subject)")
    .gte("created_at", since(days));
  if (skipHeld) query = query.neq("action", "held");
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);
  if (error) throw fail("your activity", error.message);
  return data.map((a) => ({
    id: a.id,
    action: a.action,
    recipient: a.recipient_email,
    subject: a.emails?.subject ?? null,
    at: a.created_at,
  }));
}
