import { findingLabels, panelCopy as copy } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { cn } from "@/lib/cn";

type Props = { finding: Finding; index: number; onFix: () => void; onIgnore: () => void };

const action =
  "inline-flex min-h-8 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors";

/** Before → after for a suggested fix. Nothing changes until the user taps Fix it. */
function Change({ from, to }: { from: string; to: string }) {
  return (
    <p className="mt-3 mb-0 rounded-xl bg-paper px-3 py-2.5 text-[13px] leading-relaxed">
      <span className="sr-only">{copy.replace} </span>
      <del className="text-muted decoration-danger/50">{from}</del>
      <span aria-hidden="true" className="mx-1.5 text-muted">
        →
      </span>
      <span className="sr-only"> {copy.with} </span>
      <ins className="rounded bg-brand-tint px-1 py-0.5 text-brand-deep no-underline">{to}</ins>
    </p>
  );
}

/**
 * One thing Clinton caught. With a suggestion: a before/after and Fix it (applies it). Without:
 * Show me (jumps to the words). Either way, Ignore. The user always decides (trust rule 4).
 */
export function FindingItem({ finding, index, onFix, onIgnore }: Props) {
  const quote = finding.excerpt && finding.type !== "sensitive_data" ? finding.excerpt : null;
  const fixable = Boolean(finding.excerpt && finding.suggestion);
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
      {fixable ? <Change from={finding.excerpt!} to={finding.suggestion!} /> : null}
      <div className="mt-3 flex items-center gap-2">
        <p className="m-0 min-w-0 flex-1 truncate text-[12px] text-body">
          {quote && !fixable ? <span className="rounded bg-highlight px-1 py-0.5">{quote}</span> : null}
        </p>
        <button type="button" onClick={onFix} className={cn(action, "bg-ink text-white hover:bg-brand-deep")}>
          {fixable ? copy.fix : copy.show}
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
