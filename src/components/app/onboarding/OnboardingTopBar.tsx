import { Logo } from "@/components/ui/Logo";
import { onboardingCopy as copy } from "@/content/app/onboarding";
import { cn } from "@/lib/cn";

type Props = { labels: string[]; index: number; onSkip?: () => void };

const fill = (done: boolean) =>
  cn(
    "block h-full origin-left rounded-full bg-brand transition-transform duration-500 motion-reduce:transition-none",
    done ? "scale-x-100" : "scale-x-0",
  );

/** Logo, progress (labelled segments on wide screens, a slim bar on phones) and "Skip the tour". */
export function OnboardingTopBar({ labels, index, onSkip }: Props) {
  return (
    <header className="relative flex items-center justify-between gap-6 py-5">
      <Logo />
      <div className="hidden flex-1 justify-center md:flex">
        <ol aria-label={copy.progressLabel} className="m-0 flex list-none gap-2 p-0">
          {labels.map((label, i) => (
            <li
              key={label}
              aria-current={i === index ? "step" : undefined}
              className="flex w-30 flex-col gap-2"
            >
              <span className="h-1 overflow-hidden rounded-full bg-line-strong">
                <span className={fill(i <= index)} />
              </span>
              <span
                className={cn(
                  "font-mono text-[11px] tracking-wider uppercase",
                  i === index ? "text-ink" : "text-muted",
                )}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <p className="sr-only" aria-live="polite">
        {copy.progress(index + 1, labels.length)}
      </p>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex gap-1 md:hidden">
        {labels.map((label, i) => (
          <span key={label} className="h-1 flex-1 overflow-hidden rounded-full bg-line-strong">
            <span className={fill(i <= index)} />
          </span>
        ))}
      </div>
      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="cursor-pointer rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-muted hover:bg-white hover:text-ink"
        >
          {copy.skip}
        </button>
      ) : null}
    </header>
  );
}
