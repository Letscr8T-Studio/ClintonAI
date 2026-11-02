import { safeSendCopy as copy } from "@/content/app/safe-send";
import { cn } from "@/lib/cn";

type Props = { on: boolean; onChange: (on: boolean) => void; helpId: string };

/** Safe Send for this email: off by default (trust rule 3). Its explanation is rendered by the parent. */
export function SafeSendToggle({ on, onChange, helpId }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-describedby={helpId}
      onClick={() => onChange(!on)}
      className="inline-flex cursor-pointer items-center gap-2.5 self-start rounded-full py-1 text-sm font-semibold whitespace-nowrap text-ink"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors motion-reduce:transition-none",
          on ? "bg-brand" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow-card transition-transform motion-reduce:transition-none",
            on && "translate-x-4",
          )}
        />
      </span>
      {copy.toggle}
    </button>
  );
}
