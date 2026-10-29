import { findingLabels, panelCopy as copy } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { cn } from "@/lib/cn";

type Props = { finding: Finding; index: number; onFix: () => void; onIgnore: () => void };

const action =
  "inline-flex min-h-8 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors";

/** One thing Clinton caught, with Fix it (jump to the text) and Ignore. */
export function FindingItem({ finding, index, onFix, onIgnore }: Props) {
  const quote = finding.excerpt && finding.type !== "sensitive_data" ? finding.excerpt : null;
  return (
    <li
      className="cl-slide rounded-2xl border border-amber-line bg-white px-4 py-3.5"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-amber-bg px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-amber-ink uppercase">
          {findingLabels[finding.type]}
        </span>
        {finding.source === "model" ? (
          <span className="font-mono text-[10px] tracking-wider text-muted uppercase">AI</span>
        ) : null}
      </div>
      <p className="mt-2 mb-0 text-[14px] leading-snug text-ink">{finding.message}</p>
      <div className="mt-3 flex items-center gap-2">
        <p className="m-0 min-w-0 flex-1 truncate text-[12px] text-body">
          {quote ? <span className="rounded bg-highlight px-1 py-0.5">{quote}</span> : null}
        </p>
        <button type="button" onClick={onFix} className={cn(action, "bg-ink text-white hover:bg-brand-deep")}>
          {copy.fix}
        </button>
        <button
          type="button"
          onClick={onIgnore}
          className={cn(action, "border border-line-strong text-body hover:bg-paper")}
        >
          {copy.ignore}
        </button>
      </div>
    </li>
  );
}
