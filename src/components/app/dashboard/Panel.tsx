import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  title: string;
  link?: { href: string; label: string };
  delay?: number;
  className?: string;
  children: ReactNode;
};

/** A titled dashboard card: one landmark per panel, named by its heading. */
export function Panel({ id, title, link, delay = 0, className, children }: Props) {
  return (
    <section
      aria-labelledby={id}
      className={cn("cl-rise rounded-[28px] border border-line bg-surface shadow-card", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-baseline justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <h2 id={id} className="m-0 font-display text-lg font-bold tracking-tight text-ink">
          {title}
        </h2>
        {link ? (
          <Link
            href={link.href}
            className="shrink-0 text-sm font-semibold text-brand-ink underline-offset-4 hover:underline"
          >
            {link.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
