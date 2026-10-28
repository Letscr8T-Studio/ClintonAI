import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Pill } from "./Chip";

const widths = { narrow: "max-w-[820px]", medium: "max-w-[960px]", wide: "max-w-[1200px]" };
const spacing = {
  default: "py-[clamp(48px,8vw,96px)]",
  tight: "py-[clamp(32px,6vw,72px)]",
  none: "",
};

type SectionProps = {
  /** Anchor target for in-page links (see content/navigation.ts). */
  id?: string;
  /** Id of the heading that names this section, for screen readers. */
  labelledBy?: string;
  label?: string;
  width?: keyof typeof widths;
  space?: keyof typeof spacing;
  className?: string;
  children: ReactNode;
};

/** Page-width landmark wrapper used by every marketing section. */
export function Section({
  id,
  labelledBy,
  label,
  width = "wide",
  space = "default",
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cn("mx-auto px-5", widths[width], spacing[space], className)}
    >
      {children}
    </section>
  );
}

type HeadingProps = { id: string; pill: string; title: string; accent?: string; description?: string };

/** Centered eyebrow + h2 + intro used at the top of most sections. */
export function SectionHeading({ id, pill, title, accent, description }: HeadingProps) {
  return (
    <div className="anim-reveal mb-[clamp(28px,5vw,52px)] flex flex-col items-center gap-3.5 text-center">
      <Pill>{pill}</Pill>
      <h2
        id={id}
        className="m-0 font-display text-[clamp(34px,4.6vw,56px)] leading-[1.05] font-bold tracking-[-0.04em]"
      >
        {title}
        {accent ? <span className="text-brand"> {accent}</span> : null}
      </h2>
      {description ? (
        <p className="m-0 max-w-[520px] text-[17px] leading-[1.6] text-muted">{description}</p>
      ) : null}
    </div>
  );
}
