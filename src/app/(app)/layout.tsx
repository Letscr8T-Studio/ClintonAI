import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { appRoutes } from "@/config/routes";
import { requireProfile } from "@/server/auth/user";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Signed-in product shell. New users finish onboarding before anything else.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireProfile();
  if (!profile.onboarded_at) redirect(appRoutes.onboarding);

  return (
    <div className="min-h-dvh bg-paper">
      <AppHeader name={profile.display_name} email={user.email} />
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
