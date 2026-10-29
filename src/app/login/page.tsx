import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/app/auth/SignInForm";
import { CenteredCard } from "@/components/app/CenteredCard";
import { appRoutes } from "@/config/routes";
import { loginCopy, loginErrorMessage } from "@/content/app/auth";
import { safeNextPath } from "@/lib/redirect";
import { getCurrentUser } from "@/server/auth/user";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNextPath(params.next, appRoutes.home);
  if (await getCurrentUser()) redirect(next);

  const error = loginErrorMessage(params.error);

  return (
    <CenteredCard>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{loginCopy.title}</h1>
      <p className="mt-3 mb-6 text-body">{loginCopy.body}</p>
      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-ink"
        >
          {error}
        </p>
      ) : null}
      <SignInForm next={next} />
      <p className="mt-4 text-sm text-muted">{loginCopy.privacy}</p>
    </CenteredCard>
  );
}
