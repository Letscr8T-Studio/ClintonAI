import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-sm font-medium text-muted">{eyebrow}</p>}
        <h1 className="font-display text-[28px] leading-tight font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

type SectionTitleProps = { title: string; sub?: string; href?: string; cta?: string };

export function SectionTitle({ title, sub, href, cta = "View all" }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-brand hover:text-brand-deep">
          {cta} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

/** Empty-state line used inside cards. */
export function Empty({ children = "No signups yet." }: { children?: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
