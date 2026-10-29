"use server";

import { redirect } from "next/navigation";
import { appRoutes } from "@/config/routes";
import { onboardingSchema } from "@/lib/validation/profile";
import { requireUser } from "@/server/auth/user";
import { completeOnboarding } from "@/server/profiles/repository";

export type OnboardingState = { error?: string };

export async function finishOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse({ delaySeconds: formData.get("delaySeconds") ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Choose a delay." };

  try {
    await completeOnboarding(user.id, parsed.data.delaySeconds);
  } catch (error) {
    console.error(error);
    return { error: "We couldn't save that. Please try again." };
  }
  redirect(appRoutes.home);
}
