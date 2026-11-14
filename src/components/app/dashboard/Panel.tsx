import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type PanelLink = { href: string; label: string };

type Props = {
  id: string;
  title: string;
  /** Beside the title. */
  link?: PanelLink;
  /** "See all" at the bottom, pinned there however short the list. */
  footer?: PanelLink;
  delay?: number;
  className?: string;
  children: ReactNode;
};

/**
 * A titled dashboard card: one landmark per panel, named by its heading. It fills the height it's
 * given (so side-by-side columns end level), with the footer link at the bottom.
 */
export function Panel({ id, title, link, footer, delay = 0, className, children }: Props) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "cl-rise flex flex-col rounded-[28px] border border-line bg-surface shadow-card",
        className,
      )}
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
      <div className="flex-1">{children}</div>
      {footer ? (
        <Link
          href={footer.href}
          className="group flex items-center justify-between gap-3 rounded-b-[28px] border-t border-line px-5 py-3.5 text-sm font-semibold text-brand-ink no-underline hover:bg-brand-wash sm:px-6"
        >
          {footer.label}
          <ArrowRight
            size={14}
            color="currentColor"
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      ) : null}
    </section>
  );
}
