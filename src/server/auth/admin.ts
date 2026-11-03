import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { appRoutes } from "@/config/routes";
import { getSupabaseAdmin } from "@/server/supabase";
import { getCurrentUser, type CurrentUser } from "./user";
import { getSupabaseForUser } from "./user-client";

// Founders console access: the product's own sign-in, a row in public.admins, and a second step
// (an authenticator app code, Supabase TOTP MFA). Every visit and export is logged.

export type AdminAccess =
  | { kind: "ok"; user: CurrentUser }
  /** Not signed in. */
  | { kind: "signin" }
  /** Signed in, not an admin: the console doesn't exist for them. */
  | { kind: "forbidden" }
  /** An admin without an authenticator yet: set one up. */
  | { kind: "enroll"; user: CurrentUser }
  /** An admin with an authenticator who hasn't entered a code this session. */
  | { kind: "verify"; user: CurrentUser };

export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  const user = await getCurrentUser();
  if (!user) return { kind: "signin" };
  const supabase = await getSupabaseForUser();
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return { kind: "forbidden" };
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === "aal2") return { kind: "ok", user };
  return level?.nextLevel === "aal2" ? { kind: "verify", user } : { kind: "enroll", user };
});

/** Best effort: a failed log line never blocks the founders, but is reported. */
export async function logAdminAccess(userId: string, action: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("admin_access_log").insert({ user_id: userId, action });
  if (error) console.error("Admin access not logged", error.message);
}

/**
 * For console pages: the admin, or off to sign in, the second step, or a 404. With an `action`
 * the visit is logged (pages pass one; the shared layout doesn't, so a view is logged once).
 */
export async function requireAdmin(action?: string): Promise<CurrentUser> {
  const access = await getAdminAccess();
  switch (access.kind) {
    case "ok":
      if (action) await logAdminAccess(access.user.id, action);
      return access.user;
    case "signin":
      redirect(`${appRoutes.login}?next=${encodeURIComponent(appRoutes.owner)}`);
    case "forbidden":
      notFound();
    case "enroll":
    case "verify":
      redirect(appRoutes.ownerMfa);
  }
}
