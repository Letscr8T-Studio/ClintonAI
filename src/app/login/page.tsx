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
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-paper lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-1">
      <SignInStage />
      <main
        id="main"
        className="stage-paper relative z-10 -mt-7 flex items-start rounded-t-[28px] px-5 pt-8 pb-10 shadow-[0_-24px_48px_-24px_rgba(10,20,90,0.45)] sm:items-center sm:px-10 sm:pt-12 lg:mt-0 lg:items-center lg:rounded-none lg:py-16 lg:shadow-none"
      >
        <SignInPanel next={next} error={loginErrorMessage(params.error)} />
      </main>
    </div>
  );
}
