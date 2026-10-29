"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { appRoutes } from "@/config/routes";
import { safeNextPath } from "@/lib/redirect";
import { getSupabaseForUser } from "@/server/auth/user-client";

/**
 * Starts "Continue with Google". Supabase stores the PKCE verifier in a cookie and returns
 * Google's consent URL. Sign-in only asks for name and email; Gmail sending is a separate step.
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const origin = (await headers()).get("origin");
  if (!origin) redirect(`${appRoutes.login}?error=oauth`);

  const next = safeNextPath(formData.get("next"), appRoutes.home);
  const callback = new URL(appRoutes.authCallback, origin);
  callback.searchParams.set("next", next);

  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), queryParams: { prompt: "select_account" } },
  });

  if (error || !data.url) {
    console.error("Google sign-in could not start", error?.message);
    redirect(`${appRoutes.login}?error=oauth`);
  }
  redirect(data.url);
}
