import "server-only";
import { getSupabaseAdmin } from "@/server/supabase";

/**
 * One row per check: which kinds of findings, which model, how long. Trust rule 6: the email's
 * text is never written anywhere; the table has no column that could hold it.
 */
export async function recordCheck(input: {
  userId: string;
  findingTypes: string[];
  model: string | null;
  latencyMs: number;
}): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .from("ai_check_events")
    .insert({
      user_id: input.userId,
      finding_types: input.findingTypes.slice(0, 50),
      model: input.model,
      latency_ms: Math.max(0, Math.round(input.latencyMs)),
    })
    .select("id")
    .single();
  if (error) throw new Error(`Could not record check: ${error.message}`);
  return data.id;
}

/**
 * Ties the checks run while writing an email to the email that was sent, so the dashboard can
 * show what Clinton caught on it. Only the owner's own, not-yet-linked checks are touched.
 */
export async function linkChecks(userId: string, emailId: string, checkIds: string[]): Promise<void> {
  if (checkIds.length === 0) return;
  const { error } = await getSupabaseAdmin()
    .from("ai_check_events")
    .update({ email_id: emailId })
    .eq("user_id", userId)
    .is("email_id", null)
    .in("id", checkIds);
  if (error) throw new Error(`Could not link checks: ${error.message}`);
}
