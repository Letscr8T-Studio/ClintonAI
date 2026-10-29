import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { appRoutes } from "@/config/routes";
import type { Profile } from "@/types/database";
import { getProfile } from "@/server/profiles/repository";
import { getSupabaseForUser } from "./user-client";

export type CurrentUser = { id: string; email: string | null };

/** The signed-in user, verified with Supabase Auth. Cached for one request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
});

/** For signed-in pages: visitors without a session go to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(appRoutes.login);
  return user;
}

/** The user and their profile. The profile is created by a database trigger on sign-up. */
export async function requireProfile(): Promise<{ user: CurrentUser; profile: Profile }> {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile) throw new Error("Profile missing for signed-in user");
  return { user, profile };
}
