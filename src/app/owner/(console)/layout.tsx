import type { ReactNode } from "react";
import { SideNav, TabBar } from "@/components/owner/Nav";
import { Logo } from "@/components/ui/Logo";
import { requireAdmin } from "@/server/auth/guard";

function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action="/owner/logout" method="post">
      <button type="submit" className={className}>
        Log out
      </button>
    </form>
  );
}

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const email = await requireAdmin();

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-white p-4 lg:flex">
        <div className="px-2 pt-2 pb-6">
          <Logo badge="Founders" />
        </div>
        <SideNav />
        <div className="mt-auto rounded-2xl border border-line bg-paper p-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white uppercase"
            >
              {email[0]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{email.split("@")[0]}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>
          <LogoutButton className="mt-3 w-full cursor-pointer rounded-lg border border-line-strong bg-white py-2 text-sm font-semibold text-body transition hover:bg-brand-wash" />
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo badge="Founders" />
        <LogoutButton className="cursor-pointer rounded-lg border border-line-strong bg-white px-3 py-1.5 text-sm font-semibold text-body" />
      </header>

      <main id="main" className="px-4 py-6 pb-28 sm:px-6 lg:ml-64 lg:px-10 lg:py-10 lg:pb-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <TabBar />
    </div>
  );
}
