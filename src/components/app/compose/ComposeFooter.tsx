import { useId } from "react";
import { ClintonMark } from "@/components/ui/icons";
import { Switch } from "@/components/ui/Switch";
import { palette } from "@/config/brand";
import { composeCopy as copy } from "@/content/app/compose";
import { scheduleCopy, trackCopy } from "@/content/app/compose-options";
import { safeSendCopy } from "@/content/app/safe-send";
import { cn } from "@/lib/cn";
import { SchedulePicker } from "./SchedulePicker";
import type { SendOptions } from "./useSendOptions";

type Props = {
  busy: boolean;
  checking: boolean;
  options: SendOptions;
  /** Phones: pin Check & send to the bottom of the screen, where thumbs are (not once it's ready). */
  docked: boolean;
};

const dock =
  "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-30 max-sm:border-t max-sm:border-line max-sm:bg-surface/95 max-sm:px-4 max-sm:pt-3 max-sm:pb-[max(env(safe-area-inset-bottom),12px)] max-sm:backdrop-blur-xl";

/**
 * The form's footer: Safe Send and "Likely opened" for this email (each with what it means),
 * Send later, the shortcut, and Check & send. On phones the buttons dock to the bottom of the screen.
 */
export function ComposeFooter({ busy, checking, options, docked }: Props) {
  const safeHelp = useId();
  const trackHelp = useId();
  const label = checking ? copy.checking : options.sendAt ? scheduleCopy.submit : copy.submit;
  return (
    <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:px-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Switch
            on={options.safeSend}
            onChange={options.setSafeSend}
            label={safeSendCopy.toggle}
            describedBy={safeHelp}
          />
          <Switch
            on={options.trackOpens}
            onChange={options.setTrackOpens}
            label={trackCopy.toggle}
            describedBy={trackHelp}
            disabled={options.safeSend}
          />
        </div>
        <div className={cn("flex items-center justify-end gap-2", docked && dock)}>
          <kbd
            className={cn(
              "mr-1 hidden rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-muted",
              !options.sendAt && "xl:inline",
            )}
          >
            {copy.shortcut}
          </kbd>
          <SchedulePicker value={options.sendAt} onChange={options.setSendAt} />
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-brand px-6 text-[15px] font-semibold whitespace-nowrap text-white shadow-cta transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none sm:flex-none"
          >
            <ClintonMark size={16} color={palette.white} />
            {label}
          </button>
        </div>
      </div>
      <p
        id={safeHelp}
        className={cn(
          "m-0 rounded-xl bg-brand-wash px-3.5 py-2.5 text-xs leading-relaxed text-brand-ink",
          !options.safeSend && "sr-only",
        )}
      >
        {safeSendCopy.toggleHelp} {safeSendCopy.perPersonNote}
      </p>
      <p
        id={trackHelp}
        className={cn("m-0 text-xs leading-relaxed text-muted", !options.trackOpens && "sr-only")}
      >
        {options.safeSend ? trackCopy.safeSendNote : trackCopy.help}
      </p>
    </div>
  );
}
