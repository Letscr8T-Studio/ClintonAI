import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipTone = "brand" | "tint" | "ink" | "neutral" | "amber" | "sand" | "glass" | "outline";

const tones: Record<ChipTone, { chip: string; dot: string }> = {
  brand: { chip: "bg-brand text-white", dot: "bg-white" },
  tint: { chip: "bg-brand-tint text-brand-ink", dot: "bg-brand" },
  ink: { chip: "bg-night text-white", dot: "bg-white" },
  neutral: { chip: "bg-line-soft text-body", dot: "bg-subtle" },
  amber: { chip: "bg-amber-bg text-amber-ink", dot: "bg-amber-dot" },
  sand: { chip: "bg-sand text-ink", dot: "bg-amber-dot" },
  glass: { chip: "bg-white/10 text-white", dot: "bg-white" },
  outline: { chip: "border border-line-strong text-muted", dot: "bg-subtle" },
};

const sizes = {
  xs: "px-2 py-0.5 text-[11px]",
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-1.5 text-[13px]",
};

type ChipProps = {
  children: ReactNode;
  tone?: ChipTone;
  size?: keyof typeof sizes;
  dot?: boolean;
  className?: string;
};

/** Small rounded label: statuses, tags and feature names. */
export function Chip({ children, tone = "tint", size = "sm", dot = false, className }: ChipProps) {
  const t = tones[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
        sizes[size],
        t.chip,
        className,
      )}
    >
      {dot ? <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", t.dot)} /> : null}
      {children}
    </span>
  );
}

/** The eyebrow label above a section heading. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Chip size="md" tone="tint" className={cn("self-center text-brand", className)}>
      {children}
    </Chip>
  );
}
