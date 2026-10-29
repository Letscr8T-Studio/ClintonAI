import Link from "next/link";
import { Chip, type ChipTone } from "@/components/ui/Chip";
import { Check } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { homeCopy as copy } from "@/content/app/home";
import { cn } from "@/lib/cn";

type Status = keyof typeof copy.stepStatus;

const chipTone: Record<Status, ChipTone> = { done: "tint", next: "brand", soon: "neutral" };

/** Where each step stands. Only Gmail can be done today; the rest arrive in later milestones. */
export function stepStatuses(gmailConnected: boolean): Status[] {
  return gmailConnected ? ["done", "next", "soon"] : ["next", "soon", "soon"];
}

/** The three-step "Getting started" checklist. */
export function SetupSteps({ gmailConnected }: { gmailConnected: boolean }) {
  const statuses = stepStatuses(gmailConnected);
  const done = statuses.filter((s) => s === "done").length;
  const total = statuses.length;
  return (
    <section
      aria-labelledby="steps-h"
      className="cl-rise rounded-[28px] border border-line bg-white p-6 shadow-card sm:p-7"
      style={{ animationDelay: "200ms" }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="steps-h" className="m-0 font-display text-xl font-bold tracking-tight">
          {copy.stepsTitle}
        </h2>
        <p className="m-0 font-mono text-xs text-muted">
          <span aria-hidden="true">{copy.progress(done, total)}</span>
          <span className="sr-only">{copy.progressLabel(done, total)}</span>
        </p>
      </div>
      <div aria-hidden="true" className="mt-3 flex gap-1.5">
        {statuses.map((status, i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", status === "done" ? "bg-brand" : "bg-line-strong")}
          />
        ))}
      </div>
      <ol className="m-0 mt-5 flex list-none flex-col p-0">
        {copy.steps.map((step, i) => {
          const status = statuses[i]!;
          return (
            <li
              key={step.id}
              className="flex gap-4 border-t border-line py-4 first:border-t-0 first:pt-0 last:pb-0"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium",
                  status === "done" && "bg-brand",
                  status === "next" && "border-2 border-brand text-brand",
                  status === "soon" && "bg-line-soft text-muted",
                )}
              >
                {status === "done" ? <Check size={13} color={palette.white} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3
                    className={cn(
                      "m-0 text-[15px] font-semibold",
                      status === "soon" ? "text-muted" : "text-ink",
                    )}
                  >
                    {status === "next" && step.href ? (
                      <Link
                        href={step.href}
                        className="text-ink underline decoration-brand-mist decoration-2 underline-offset-4 hover:text-brand"
                      >
                        {step.title}
                      </Link>
                    ) : (
                      step.title
                    )}
                  </h3>
                  <Chip tone={chipTone[status]} size="xs">
                    {copy.stepStatus[status]}
                  </Chip>
                </div>
                <p className="m-0 mt-1 text-sm text-muted">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="m-0 mt-5 rounded-xl bg-paper px-4 py-3 text-[13px] text-muted">{copy.soonNote}</p>
    </section>
  );
}
