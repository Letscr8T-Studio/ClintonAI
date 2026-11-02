import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/shell/AppHeader";
import { CommandMenu } from "@/components/app/shell/CommandMenu";
import { MobileTabBar } from "@/components/app/shell/MobileTabBar";
import { appRoutes } from "@/config/routes";
import { requireProfile } from "@/server/auth/user";
import { getTheme } from "@/server/theme";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Signed-in product shell. New users finish onboarding before anything else. data-theme sets
// light or dark for every page in it (theme.css).
export default async function AppLayout({ children }: { children: ReactNode }) {
  const [{ user, profile }, theme] = await Promise.all([requireProfile(), getTheme()]);
  if (!profile.onboarded_at) redirect(appRoutes.onboarding);

  return (
    <div data-theme={theme} className="stage-paper min-h-dvh text-ink">
      <AppHeader name={profile.display_name} email={user.email} />
      <main id="main" className="mx-auto max-w-[1200px] px-5 pt-6 pb-44 sm:px-8 sm:pt-8 sm:pb-16">
        {children}
      </main>
      <MobileTabBar />
      <CommandMenu initialTheme={theme} />
    </div>
  );
}
