"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { appRoutes } from "@/config/routes";
import { appShellCopy as copy } from "@/content/app/home";
import { cn } from "@/lib/cn";
import { AccountMenu } from "./AccountMenu";

type Props = { name: string | null; email: string | null };

/** Sticky, frosted header: logo, main nav (current page marked), account menu. */
export function AppHeader({ name, email }: Props) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Logo href={appRoutes.home} compact />
          <nav aria-label={copy.navLabel}>
            <ul className="m-0 flex list-none gap-1 p-0">
              {copy.nav.map((item) => {
                const current = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-sm font-medium no-underline transition-colors",
                        current ? "bg-ink text-white" : "text-body hover:bg-white hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <AccountMenu name={name} email={email} />
      </div>
    </header>
  );
}
