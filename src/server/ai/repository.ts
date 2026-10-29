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
}): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("ai_check_events")
    .insert({
      user_id: input.userId,
      finding_types: input.findingTypes.slice(0, 50),
      model: input.model,
      latency_ms: Math.max(0, Math.round(input.latencyMs)),
    });
  if (error) throw new Error(`Could not record check: ${error.message}`);
}
