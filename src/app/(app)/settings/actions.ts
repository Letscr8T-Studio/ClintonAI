"use server";

import { revalidatePath } from "next/cache";
import { appRoutes } from "@/config/routes";
import { settingsCopy as copy } from "@/content/app/settings";
import { delaySecondsSchema, displayNameSchema } from "@/lib/validation/profile";
import { themeSchema } from "@/lib/validation/theme";
import { requireUser } from "@/server/auth/user";
import { updateSettings } from "@/server/profiles/repository";
import { setThemeCookie } from "@/server/theme";

export type SettingResult = { ok: true } | { ok: false; error: string };

async function save(patch: Parameters<typeof updateSettings>[1]): Promise<SettingResult> {
  const user = await requireUser();
  try {
    await updateSettings(user.id, patch);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return { ok: false, error: copy.saveFailed };
  }
  // Home and Compose show the delay too.
  revalidatePath(appRoutes.home);
  revalidatePath(appRoutes.settings);
  return { ok: true };
}

export async function saveDefaultDelay(seconds: number): Promise<SettingResult> {
  const parsed = delaySecondsSchema.safeParse(seconds);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? copy.saveFailed };
  return save({ default_delay_seconds: parsed.data });
}

/** "Likely opened" for new emails (each email can still switch it in Compose). */
export async function saveOpenTracking(on: boolean): Promise<SettingResult> {
  if (typeof on !== "boolean") return { ok: false, error: copy.saveFailed };
  return save({ open_tracking: on });
}

/** Appearance is per device, so it lives in a cookie rather than the profile. */
export async function saveTheme(theme: string): Promise<SettingResult> {
  await requireUser();
  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) return { ok: false, error: copy.saveFailed };
  await setThemeCookie(parsed.data);
  return { ok: true };
}

export async function saveDisplayName(name: string): Promise<SettingResult> {
  const parsed = displayNameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? copy.saveFailed };
  return save({ display_name: parsed.data });
}
