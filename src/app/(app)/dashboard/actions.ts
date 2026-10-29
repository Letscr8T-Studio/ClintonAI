"use server";

import { revalidatePath } from "next/cache";
import { appRoutes } from "@/config/routes";
import { accountMessages as m, testEmail } from "@/content/app/gmail";
import { accountActionSchema } from "@/lib/validation/accounts";
import type { AccountActionState } from "@/types/accounts";
import { disconnectAccount, sendTestEmail } from "@/server/accounts/service";
import { requireProfile, requireUser } from "@/server/auth/user";
import { createRateLimiter } from "@/server/rate-limit";

/** 3 test emails per user per 10 minutes. */
const testLimiter = createRateLimiter({ max: 3, windowMs: 10 * 60 * 1000 });

export async function sendTestEmailAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const { user, profile } = await requireProfile();
  const parsed = accountActionSchema.safeParse({ accountId: formData.get("accountId") });
  if (!parsed.success) return { ok: false, message: m.invalid };
  if (testLimiter.isLimited(user.id)) return { ok: false, message: m.rateLimited };
  testLimiter.hit(user.id);

  const firstName = profile.display_name?.split(" ")[0] ?? null;
  try {
    const result = await sendTestEmail(
      parsed.data.accountId,
      { name: profile.display_name },
      { subject: testEmail.subject, body: testEmail.body(firstName) },
    );
    if (result.ok) return { ok: true, message: m.testSent(result.email) };
    if (result.reason === "revoked") revalidatePath(appRoutes.home);
    revalidatePath(appRoutes.settings);
    return { ok: false, message: result.reason === "revoked" ? m.revoked : m.notFound };
  } catch (error) {
    console.error("Test send failed", error instanceof Error ? error.message : error);
    return { ok: false, message: m.failed };
  }
}

export async function disconnectAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await requireUser();
  const parsed = accountActionSchema.safeParse({ accountId: formData.get("accountId") });
  if (!parsed.success) return { ok: false, message: m.invalid };

  try {
    const done = await disconnectAccount(user.id, parsed.data.accountId);
    revalidatePath(appRoutes.home);
    revalidatePath(appRoutes.settings);
    return done ? { ok: true, message: m.disconnected } : { ok: false, message: m.notFound };
  } catch (error) {
    console.error("Disconnect failed", error instanceof Error ? error.message : error);
    return { ok: false, message: m.invalid };
  }
}
