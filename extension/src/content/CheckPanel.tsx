import { useEffect, type ReactNode } from "react";
import { FindingItem } from "@/components/app/compose/FindingItem";
import { panelCopy } from "@/content/app/compose";
import { composeBarCopy as copy } from "@/content/extension";
import { extensionSendCopy } from "@/content/extension-send";
import type { Finding } from "@/lib/check/types";

type CheckPanelProps = {
  id: string;
  findings: Finding[];
  notice: string | null;
  /** The check has run on this version of the email. */
  checked: boolean;
  onFix: (finding: Finding) => void;
  onIgnore: (finding: Finding) => void;
  onClose: () => void;
  /** The send section, under the findings. */
  children: ReactNode;
};

/**
 * Clinton AI's panel above the compose bar: what it caught (the same cards as Compose on the web:
 * Fix it or Show me, and Ignore), then how to send. Advice only: Gmail's Send keeps working.
 */
export function CheckPanel({
  id,
  findings,
  notice,
  checked,
  onFix,
  onIgnore,
  onClose,
  children,
}: CheckPanelProps) {
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
      className="absolute bottom-10 left-0 z-10 flex max-h-[520px] w-[340px] flex-col gap-3 overflow-auto rounded-2xl border border-line-strong bg-surface p-3 text-ink"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 font-display text-[15px] font-bold">
          {findings.length ? panelCopy.caught(findings.length) : extensionSendCopy.heading}
        </h2>
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
      {findings.length ? (
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
      ) : checked ? (
        <p className="m-0 text-[13px] text-body">{extensionSendCopy.allGood}</p>
      ) : null}
      <div className="border-t border-line pt-3">{children}</div>
    </section>
  );
}
