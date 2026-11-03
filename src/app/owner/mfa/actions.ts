"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { appRoutes } from "@/config/routes";
import { mfaCopy as copy } from "@/content/owner";
import { getAdminAccess, logAdminAccess } from "@/server/auth/admin";
import { getSupabaseForUser } from "@/server/auth/user-client";

export type Enrolment = { factorId: string; qrCode: string; secret: string } | { error: string };
export type VerifyState = { error?: string };

const codeSchema = z.string().regex(/^\d{6}$/, copy.badCode);

/** Admins without an authenticator: a new TOTP factor (QR code + secret to type in). */
export async function startEnrolment(): Promise<Enrolment> {
  const access = await getAdminAccess();
  if (access.kind !== "enroll") return { error: copy.notNeeded };
  const supabase = await getSupabaseForUser();
  // Half-finished set-ups from earlier visits would pile up (Supabase allows 10): clear them.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Founders console",
  });
  if (error || !data) return { error: copy.failed };
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

/** Checks the 6-digit code; on success the session is raised to the second level (aal2). */
export async function verifyCode(_prev: VerifyState, form: FormData): Promise<VerifyState> {
  const access = await getAdminAccess();
  if (access.kind === "ok") redirect(appRoutes.owner);
  if (access.kind !== "enroll" && access.kind !== "verify") return { error: copy.notNeeded };
  const code = codeSchema.safeParse(String(form.get("code") ?? "").replace(/\s/g, ""));
  if (!code.success) return { error: copy.badCode };

  const supabase = await getSupabaseForUser();
  let factorId = String(form.get("factorId") ?? "");
  if (access.kind === "verify") {
    const { data } = await supabase.auth.mfa.listFactors();
    factorId = data?.totp[0]?.id ?? "";
  }
  if (!factorId) return { error: copy.failed };
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.data });
  if (error) return { error: copy.wrongCode };
  await logAdminAccess(
    access.user.id,
    access.kind === "enroll" ? "set up authenticator" : "second step passed",
  );
  redirect(appRoutes.owner);
}
