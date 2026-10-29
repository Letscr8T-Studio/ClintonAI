import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

const R = 88;
const FULL = 2 * Math.PI * R;

export type RingTone = "dark" | "light" | "brand";

/** Track, fill, caption and value colours for navy, paper and brand-blue panels. */
const tones: Record<RingTone, { track: string; fill: string; caption: string; value: string }> = {
  dark: {
    track: "stroke-white/10",
    fill: "stroke-brand-light",
    caption: "text-navy-text",
    value: "text-white",
  },
  light: { track: "stroke-brand-tint", fill: "stroke-brand", caption: "text-muted", value: "text-ink" },
  brand: { track: "stroke-white/15", fill: "stroke-white", caption: "text-on-brand", value: "text-white" },
};

type Props = {
  /** 0-1 share of the ring that is filled. */
  value: number;
  /** Shown in the middle (a countdown, "1 of 3"…). */
  children: ReactNode;
  caption?: string;
  tone?: RingTone;
  /** Size of the middle value; defaults to a large timer. */
  valueClassName?: string;
  /** Width of the ring. cn() does not merge conflicting classes, so size is its own prop. */
  sizeClassName?: string;
  /** e.g. "hidden md:block" to drop the caption on small rings. */
  captionClassName?: string;
  className?: string;
};

/** Decorative progress circle with a value inside (Smart Delay, setup progress). */
export function ProgressRing({
  value,
  children,
  caption,
  tone = "dark",
  valueClassName,
  sizeClassName = "w-full max-w-[260px]",
  captionClassName,
  className,
}: Props) {
  const offset = FULL * (1 - Math.min(Math.max(value, 0), 1));
  const t = tones[tone];
  return (
    <div aria-hidden="true" className={cn("relative aspect-square", sizeClassName, className)}>
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <circle cx="100" cy="100" r={R} fill="none" strokeWidth="10" className={t.track} />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={FULL}
          strokeDashoffset={offset}
          className={cn("cl-ring", t.fill)}
          style={{ "--ring-full": FULL } as CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        {caption ? (
          <span className={cn("font-mono text-[11px] tracking-wider uppercase", t.caption, captionClassName)}>
            {caption}
          </span>
        ) : null}
        <span
          className={cn(
            "font-mono leading-none font-medium tracking-[-0.04em]",
            valueClassName ?? "text-[clamp(36px,5vw,52px)]",
            t.value,
          )}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
