import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CenteredCard } from "@/components/app/CenteredCard";
import { OnboardingFlow } from "@/components/app/onboarding/OnboardingFlow";
import { appRoutes } from "@/config/routes";
import { requireProfile } from "@/server/auth/user";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

export default async function OnboardingPage() {
  const { profile } = await requireProfile();
  if (profile.onboarded_at) redirect(appRoutes.home);

  return (
    <CenteredCard wide>
      <OnboardingFlow defaultDelaySeconds={profile.default_delay_seconds} />
    </CenteredCard>
  );
}
