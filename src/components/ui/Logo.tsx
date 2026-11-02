import { palette } from "@/config/brand";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { ClintonMark } from "./icons";

type LogoProps = {
  /** White version for brand-blue backgrounds. */
  light?: boolean;
  /** Small label after the wordmark, e.g. "Founders". */
  badge?: string;
  /** Mark only on small screens (the wordmark returns from `sm`). Needs `href` or the label stays. */
  compact?: boolean;
  /** Wraps the logo in a link. Omit for a static logo. */
  href?: string;
  className?: string;
};

/** Clinton AI lockup: the "Held C" tile + "Clinton AI" wordmark in one typeface (docs/product/brand.md). */
export function Logo({ light = false, badge, href, compact = false, className }: LogoProps) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-[10px]",
          light ? "bg-white" : "bg-brand",
        )}
      >
        <ClintonMark size={22} color={light ? palette.brand : palette.white} />
      </span>
      <span
        className={cn(
          "font-display text-[22px] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap",
          compact && "hidden sm:inline",
        )}
      >
        {site.name}
      </span>
      {badge ? (
        <span className="rounded-md bg-night px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-white uppercase">
          {badge}
        </span>
      ) : null}
    </>
  );

  const classes = cn("flex items-center gap-2.5 no-underline", light ? "text-white" : "text-ink", className);

  if (!href) {
    return (
      <span role="img" aria-label={site.name} className={classes}>
        {content}
      </span>
    );
  }
  return (
    <a href={href} aria-label={`${site.name} home`} className={classes}>
      {content}
    </a>
  );
}
