import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/owner/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { OWNER_HOME_PATH, getAdminSession } from "@/server/auth/guard";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdminSession()) redirect(OWNER_HOME_PATH);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <Logo badge="Founders" />
        <h1 className="mt-6 mb-6 font-display text-3xl font-bold tracking-tight">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
