import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MfaForm } from "@/components/owner/MfaForm";
import { Logo } from "@/components/ui/Logo";
import { appRoutes } from "@/config/routes";
import { mfaCopy as copy } from "@/content/owner";
import { getAdminAccess } from "@/server/auth/admin";

export const metadata: Metadata = { title: "Second step" };

/** Founders console, step two: set up or enter the authenticator code. Admins only. */
export default async function OwnerMfaPage() {
  const access = await getAdminAccess();
  if (access.kind === "signin") redirect(`${appRoutes.login}?next=${encodeURIComponent(appRoutes.owner)}`);
  if (access.kind === "forbidden") notFound();
  if (access.kind === "ok") redirect(appRoutes.owner);

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-12">
      <Logo badge="Founders" />
      <div>
        <h1 className="m-0 font-display text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 mb-0 text-body">{access.kind === "enroll" ? copy.enrollBody : copy.verifyBody}</p>
        <p className="mt-1 mb-0 text-sm text-muted">{access.user.email}</p>
      </div>
      <MfaForm mode={access.kind} />
      <form action={appRoutes.signOut} method="post">
        <button
          type="submit"
          className="cursor-pointer text-sm font-medium text-muted underline-offset-4 hover:underline"
        >
          {copy.signOut}
        </button>
      </form>
    </main>
  );
}
