import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInPanel } from "@/components/app/auth/SignInPanel";
import { SignInStage } from "@/components/app/auth/SignInStage";
import { appRoutes } from "@/config/routes";
import { loginErrorMessage } from "@/content/app/auth";
import { safeNextPath } from "@/lib/redirect";
import { getCurrentUser } from "@/server/auth/user";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNextPath(params.next, appRoutes.home);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <SignInStage />
      <main id="main" className="stage-paper flex items-center px-5 py-12 sm:px-10 lg:py-16">
        <SignInPanel next={next} error={loginErrorMessage(params.error)} />
      </main>
    </div>
  );
}
