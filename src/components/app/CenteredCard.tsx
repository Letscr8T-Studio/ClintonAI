import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/** Full-height page with one centred card under the logo: sign-in and onboarding. */
export function CenteredCard({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main
      id="main"
      className={cn(
        "mx-auto flex min-h-dvh flex-col justify-center px-4 py-10",
        wide ? "max-w-xl" : "max-w-md",
      )}
    >
      <Logo href="/" className="mb-6 self-center" />
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">{children}</div>
    </main>
  );
}
