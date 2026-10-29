import { ClintonMark } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { composeCopy as copy } from "@/content/app/compose";

/** The form's footer: what happens on send, the shortcut, and Check & send. */
export function ComposeFooter({ busy, label }: { busy: boolean; label: string }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <p className="m-0 text-xs text-muted">
        {copy.footer}{" "}
        <kbd className="ml-1 hidden rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          {copy.shortcut}
        </kbd>
      </p>
      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-brand px-6 text-[15px] font-semibold text-white shadow-cta transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
      >
        <ClintonMark size={14} color={palette.white} />
        {label}
      </button>
    </div>
  );
}
