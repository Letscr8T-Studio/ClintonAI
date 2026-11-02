"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { PlusIcon } from "@/components/ui/app-icons";
import { GearIcon, HomeIcon, OutboxIcon, PenIcon } from "@/components/ui/icons";
import { appRoutes } from "@/config/routes";
import { commandsCopy } from "@/content/app/commands";
import { appShellCopy as copy } from "@/content/app/home";
import { cn } from "@/lib/cn";

const icons: Record<(typeof copy.nav)[number]["icon"], ComponentType<{ size?: number }>> = {
  home: HomeIcon,
  compose: PenIcon,
  outbox: OutboxIcon,
  settings: GearIcon,
};

/** Compose has its own button (the Write button), as in a native mail app. */
const tabs = copy.nav.filter((item) => item.href !== appRoutes.compose);

/**
 * Phones only: the main pages as a bottom tab bar, and a floating Write button above it, where
 * thumbs reach. Compose is a full screen of its own, so neither shows there.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  if (pathname === appRoutes.compose) return null;
  return (
    <nav
      aria-label={copy.tabsLabel}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line/80 bg-surface/90 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur-xl sm:hidden"
    >
      <Link
        href={appRoutes.compose}
        aria-label={commandsCopy.writeLabel}
        className="absolute right-4 bottom-[calc(100%+12px)] inline-flex h-14 items-center gap-2 rounded-2xl bg-brand pr-5 pl-4 font-semibold text-white no-underline shadow-cta transition-transform active:scale-95 sm:hidden"
      >
        <PlusIcon size={20} />
        {commandsCopy.write}
      </Link>
      <ul className="m-0 grid list-none grid-cols-3 p-0">
        {tabs.map((item) => {
          const Icon = icons[item.icon];
          const current = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 pt-2 pb-1 text-[11px] font-semibold no-underline",
                  current ? "text-brand-ink" : "text-muted",
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
