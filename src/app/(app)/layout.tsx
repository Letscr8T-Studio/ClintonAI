import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/shell/AppHeader";
import { MobileTabBar } from "@/components/app/shell/MobileTabBar";
import { appRoutes } from "@/config/routes";
import { requireProfile } from "@/server/auth/user";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Signed-in product shell. New users finish onboarding before anything else.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireProfile();
  if (!profile.onboarded_at) redirect(appRoutes.onboarding);

  return (
    <div className="stage-paper min-h-dvh">
      <AppHeader name={profile.display_name} email={user.email} />
      <main id="main" className="mx-auto max-w-[1200px] px-5 pt-6 pb-28 sm:px-8 sm:pt-8 sm:pb-16">
        {children}
      </main>
      <MobileTabBar />
    </div>
  );
}
