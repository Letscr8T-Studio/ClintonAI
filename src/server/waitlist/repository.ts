import "server-only";
import { getSupabaseAdmin } from "@/server/supabase";
import type { Signup, SignupFilters } from "@/types/waitlist";

// All database access for the waitlist lives here. Routes and pages never call Supabase directly.

export const PAGE_SIZE = 50;
const BATCH = 1000; // Supabase caps a single response at 1000 rows.
const SIGNUP_COLUMNS = "id, email, source, did_survey, created_at";

/** Adds an email. Joining twice is not an error. */
export async function addToWaitlist(email: string, source: string | null): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("waitlist")
    .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw new Error(`waitlist insert failed: ${error.message}`);
}

/** Flips did_survey to true for an email already on the list. Never flips it back. */
export async function markSurveyDone(email: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("waitlist")
    .update({ did_survey: true, survey_completed_at: new Date().toISOString() })
    .eq("email", email)
    .eq("did_survey", false);
  if (error) throw new Error(`survey update failed: ${error.message}`);
}

/** Every signup, newest first, read in pages. */
export async function listAllSignups(): Promise<Signup[]> {
  const supabase = getSupabaseAdmin();
  const rows: Signup[] = [];
  for (let from = 0; ; from += BATCH) {
    const { data, error } = await supabase
      .from("waitlist")
      .select(SIGNUP_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, from + BATCH - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < BATCH) break;
  }
  return rows;
}

/** Escapes LIKE wildcards so a search for "a_b" matches literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function searchSignups({ q, survey, page }: SignupFilters) {
  let query = getSupabaseAdmin()
    .from("waitlist")
    .select(SIGNUP_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("email", `%${escapeLike(q)}%`);
  if (survey !== "all") query = query.eq("did_survey", survey === "yes");

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as Signup[], total: count ?? 0 };
}
