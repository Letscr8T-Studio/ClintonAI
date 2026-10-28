import { cn } from "@/lib/cn";
import { formatChange } from "./format";

/** "↑ 25% vs yesterday" style change badge. */
export function Delta({ cur, prev, label }: { cur: number; prev: number; label: string }) {
  const change = formatChange(cur, prev);
  if (!change) return <span className="text-xs text-subtle">No change {label}</span>;
  return (
    <span className="flex flex-wrap items-center gap-1.5 text-xs text-subtle">
      <span
        className={cn(
          "inline-flex items-center rounded-full px-1.5 py-0.5 font-semibold",
          change.up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
        )}
      >
        <span aria-hidden="true">{change.up ? "↑" : "↓"}</span>
        <span className="sr-only">{change.up ? "Up" : "Down"}</span> {change.text}
      </span>
      {label}
    </span>
  );
}

export function Avatar({ email }: { email: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-sm font-bold text-brand-deep uppercase"
    >
      {email[0]}
    </span>
  );
}

export function SurveyChip({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        done ? "bg-emerald-50 text-emerald-700" : "bg-line text-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", done ? "bg-emerald-500" : "bg-subtle")}
      />
      {done ? "Surveyed" : "Pending"}
    </span>
  );
}

/** Horizontal bar; `value` is 0-100. */
export function ProgressBar({
  value,
  size = "md",
  fill = "bg-brand",
}: {
  value: number;
  size?: "sm" | "md";
  fill?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("rounded-full bg-brand-tint", size === "sm" ? "h-2" : "h-3")}>
      <div
        className={cn("h-full rounded-full", fill)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
