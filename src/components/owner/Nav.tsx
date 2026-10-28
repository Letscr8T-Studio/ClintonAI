"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
  overview: <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />,
  signups: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M17 4a4 4 0 0 1 0 8M22 21c0-3-1.7-5.4-4-6.5" />
    </>
  ),
  analytics: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

const items = [
  { href: "/owner/dashboard", label: "Overview", icon: icons.overview },
  { href: "/owner/signups", label: "Signups", icon: icons.signups },
  { href: "/owner/analytics", label: "Analytics", icon: icons.analytics },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SideNav() {
  const path = usePathname();
  return (
    <nav aria-label="Dashboard" className="space-y-1">
      {items.map((it) => {
        const active = path === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active ? "bg-brand-tint text-brand-deep" : "text-muted hover:bg-brand-wash hover:text-ink"
            }`}
          >
            <Icon>{it.icon}</Icon>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBar() {
  const path = usePathname();
  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {items.map((it) => {
        const active = path === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? "text-brand" : "text-muted"}`}
          >
            <Icon>{it.icon}</Icon>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
