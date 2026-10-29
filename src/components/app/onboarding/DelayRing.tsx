import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

const R = 88;
const FULL = 2 * Math.PI * R;

type Props = {
  /** 0-1 share of the ring that is filled. */
  value: number;
  /** Shown in the middle (e.g. a countdown). */
  children: ReactNode;
  caption?: string;
  /** "dark" for navy panels, "light" for paper ones. */
  tone?: "dark" | "light";
  className?: string;
};

/** The Smart Delay ring: a decorative progress circle with a timer inside. */
export function DelayRing({ value, children, caption, tone = "dark", className }: Props) {
  const offset = FULL * (1 - Math.min(Math.max(value, 0), 1));
  const dark = tone === "dark";
  return (
    <div aria-hidden="true" className={cn("relative aspect-square w-full max-w-[260px]", className)}>
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          strokeWidth="10"
          className={dark ? "stroke-white/10" : "stroke-brand-tint"}
        />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={FULL}
          strokeDashoffset={offset}
          className={cn("cl-ring", dark ? "stroke-brand-light" : "stroke-brand")}
          style={{ "--ring-full": FULL } as CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        {caption ? (
          <span
            className={cn(
              "font-mono text-[11px] tracking-wider uppercase",
              dark ? "text-navy-text" : "text-muted",
            )}
          >
            {caption}
          </span>
        ) : null}
        <span
          className={cn(
            "font-mono text-[clamp(36px,5vw,52px)] leading-none font-medium tracking-[-0.04em]",
            dark ? "text-white" : "text-ink",
          )}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
