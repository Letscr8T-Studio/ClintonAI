import { useEffect } from "react";
import { FindingItem } from "@/components/app/compose/FindingItem";
import { panelCopy } from "@/content/app/compose";
import { composeBarCopy as copy } from "@/content/extension";
import type { Finding } from "@/lib/check/types";

type CheckPanelProps = {
  id: string;
  findings: Finding[];
  notice: string | null;
  onFix: (finding: Finding) => void;
  onIgnore: (finding: Finding) => void;
  onClose: () => void;
};

/**
 * What Clinton caught in this email, above the compose bar: the same cards as Compose on the web
 * (Fix it or Show me, and Ignore). Advice only: Gmail's Send keeps working whatever is open here.
 */
export function CheckPanel({ id, findings, notice, onFix, onIgnore, onClose }: CheckPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <section
      id={id}
      aria-label={copy.panelLabel}
      className="absolute bottom-10 left-0 z-10 flex max-h-[420px] w-[340px] flex-col gap-3 overflow-auto rounded-2xl border border-line-strong bg-surface p-3 text-ink"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 font-display text-[15px] font-bold">{panelCopy.caught(findings.length)}</h2>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full px-2 py-1 text-xs text-muted hover:bg-paper"
        >
          {panelCopy.close}
        </button>
      </div>
      {notice ? (
        <p className="m-0 rounded-xl bg-amber-bg px-3 py-2 text-xs text-amber-ink">{notice}</p>
      ) : null}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {findings.map((finding, i) => (
          <FindingItem
            key={finding.id}
            finding={finding}
            index={i}
            onFix={() => onFix(finding)}
            onIgnore={() => onIgnore(finding)}
          />
        ))}
      </ul>
    </section>
  );
}
