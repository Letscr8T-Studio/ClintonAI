import { cn } from "@/lib/cn";

type Props = {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
  /** Id of the text that explains it, read after the label. */
  describedBy?: string;
  disabled?: boolean;
};

/** An on/off switch with its label beside it (role="switch", so it's announced as on or off). */
export function Switch({ on, onChange, label, describedBy, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="inline-flex cursor-pointer items-center gap-2.5 self-start rounded-full py-1 text-sm font-semibold whitespace-nowrap text-ink disabled:cursor-not-allowed disabled:opacity-50"
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
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-card transition-transform motion-reduce:transition-none",
            on && "translate-x-4",
          )}
        />
      </span>
      {label}
    </button>
  );
}
