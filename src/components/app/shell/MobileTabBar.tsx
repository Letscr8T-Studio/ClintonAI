"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { HomeIcon, OutboxIcon, PenIcon } from "@/components/ui/icons";
import { appShellCopy as copy } from "@/content/app/home";
import { cn } from "@/lib/cn";

const icons: Record<(typeof copy.nav)[number]["icon"], ComponentType<{ size?: number }>> = {
  home: HomeIcon,
  compose: PenIcon,
  outbox: OutboxIcon,
};

/** Phones only: the main nav as a bottom tab bar, where thumbs reach. */
export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label={copy.tabsLabel}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line/80 bg-white/90 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur-xl sm:hidden"
    >
      <ul className="m-0 grid list-none grid-cols-3 p-0">
        {copy.nav.map((item) => {
          const Icon = icons[item.icon];
          const current = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 pt-2 pb-1 text-[11px] font-semibold no-underline",
                  current ? "text-brand-deep" : "text-muted",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                    current && "bg-brand-tint",
                  )}
                >
                  <Icon size={21} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
