import { useId } from "react";
import { ClintonMark } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { composeCopy as copy } from "@/content/app/compose";
import { safeSendCopy } from "@/content/app/safe-send";
import { cn } from "@/lib/cn";
import { SafeSendToggle } from "./SafeSendToggle";

type Props = { busy: boolean; label: string; safeSend: boolean; onSafeSend: (on: boolean) => void };

/** The form's footer: Safe Send for this email (and what it means), the shortcut, and Check & send. */
export function ComposeFooter({ busy, label, safeSend, onSafeSend }: Props) {
  const helpId = useId();
  return (
    <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SafeSendToggle on={safeSend} onChange={onSafeSend} helpId={helpId} />
        <div className="flex items-center justify-end gap-3">
          <kbd className="hidden rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-muted sm:inline">
            {copy.shortcut}
          </kbd>
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-brand px-6 text-[15px] font-semibold whitespace-nowrap text-white shadow-cta transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none sm:w-auto"
          >
            <ClintonMark size={16} color={palette.white} />
            {label}
          </button>
        </div>
      </div>
      <p
        id={helpId}
        className={cn(
          "m-0 rounded-xl bg-brand-wash px-3.5 py-2.5 text-xs leading-relaxed text-brand-deep",
          !safeSend && "sr-only",
        )}
      >
        {safeSendCopy.toggleHelp} {safeSendCopy.perPersonNote}
      </p>
    </div>
  );
}
