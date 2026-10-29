import "server-only";
import type { Profile } from "@/types/database";
import { getSupabaseForUser } from "@/server/auth/user-client";

// Runs as the signed-in user: RLS limits reads and writes to their own profile, and column
// grants limit updates to the settings columns.

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Could not load profile: ${error.message}`);
  return data;
}

export async function completeOnboarding(userId: string, delaySeconds: number): Promise<void> {
  const supabase = await getSupabaseForUser();
  const { error } = await supabase
    .from("profiles")
    .update({ default_delay_seconds: delaySeconds, onboarded_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(`Could not save onboarding: ${error.message}`);
}
