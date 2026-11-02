import type { CSSProperties, Ref } from "react";
import { Close } from "@/components/ui/icons";
import { findingLabels, panelCopy as copy } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { cn } from "@/lib/cn";
import { Change } from "./FindingItem";

type Props = {
  ref: Ref<HTMLDivElement>;
  finding: Finding;
  style: CSSProperties;
  onFix: () => void;
  onIgnore: () => void;
  onClose: () => void;
  /** Focus left the popover for this element. */
  onBlur: (to: EventTarget | null) => void;
};

const action =
  "inline-flex min-h-9 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors";

/** Clinton's note on one highlighted word, under the word itself: Fix it (when there's a fix) or Ignore. */
export function FlagPopover({ ref, finding, style, onFix, onIgnore, onClose, onBlur }: Props) {
  const label = findingLabels[finding.type];
  return (
    <div
      ref={ref}
      role="group"
      aria-label={copy.inlineLabel(label)}
      style={style}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onBlur={(e) => onBlur(e.relatedTarget)}
      className="cl-pop absolute z-20 w-[min(340px,calc(100%-2rem))] rounded-2xl border border-line bg-surface p-3.5 shadow-pop"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-amber-bg px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-amber-ink uppercase">
          {label}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="ml-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink"
        >
          <Close size={16} />
        </button>
      </div>
      <p className="mt-1.5 mb-0 text-[14px] leading-snug text-ink">{finding.message}</p>
      {finding.suggestion ? <Change from={finding.excerpt} to={finding.suggestion} /> : null}
      <div className="mt-3 flex gap-2">
        {finding.suggestion ? (
          <button
            type="button"
            onClick={onFix}
            className={cn(action, "bg-brand text-white hover:bg-brand-deep")}
          >
            {copy.fix}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onIgnore}
          className={cn(action, "border border-line-strong text-body hover:bg-paper")}
        >
          {copy.ignore}
        </button>
      </div>
    </div>
  );
}
