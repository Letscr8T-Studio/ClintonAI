import { Check, Sparkle, Warning } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { panelCopy as copy } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { cn } from "@/lib/cn";
import { FindingItem } from "./FindingItem";
import type { CheckState } from "./useComposeCheck";

type Props = {
  state: CheckState;
  onFix: (finding: Finding) => void;
  onIgnore: (id: string) => void;
  onSendAnyway: () => void;
};

const shell = "relative overflow-hidden rounded-[28px] p-6 sm:p-7";

function Stale() {
  return <p className="m-0 mb-4 rounded-xl bg-white/90 px-3.5 py-2.5 text-[13px] text-body">{copy.stale}</p>;
}

function Idle({ checking }: { checking: boolean }) {
  return (
    <div className={cn(shell, "bg-ink text-white")}>
      <div aria-hidden="true" className="stage-grid absolute inset-0" />
      {checking ? <div aria-hidden="true" className="cl-scan absolute inset-x-0 top-0 h-24" /> : null}
      <div className="relative">
        <span
          aria-hidden="true"
          className="inline-flex size-10 items-center justify-center rounded-xl bg-brand"
        >
          <Sparkle size={18} color={palette.white} />
        </span>
        <h2 className="mt-4 mb-0 font-display text-xl font-bold tracking-tight">
          {checking ? copy.checkingTitle : copy.idleTitle}
        </h2>
        <p className="mt-1.5 mb-0 text-sm leading-relaxed text-navy-text">
          {checking ? copy.checkingBody : copy.idleBody}
        </p>
        {checking ? (
          <div aria-hidden="true" className="mt-5 flex flex-col gap-2.5">
            {[92, 70, 84].map((w) => (
              <span
                key={w}
                className="h-2.5 animate-pulse rounded-full bg-white/10"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : (
          <ul className="m-0 mt-5 flex list-none flex-wrap gap-1.5 p-0">
            {copy.watches.map((w) => (
              <li key={w} className="rounded-full border border-navy-line px-3 py-1 text-xs text-navy-text">
                {w}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Review({ state, onFix, onIgnore, onSendAnyway }: Props) {
  const open = state.findings.filter((f) => state.open.includes(f.id));
  return (
    <div className={cn(shell, "border border-amber-line bg-amber-bg", state.stale && "opacity-80")}>
      {state.stale ? <Stale /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Warning size={20} />
          <h2 className="m-0 font-display text-lg font-bold tracking-tight text-amber-ink">
            {copy.caught(open.length)}
          </h2>
        </div>
        {/* Always in view: the user can send whatever Clinton says (trust rule 4). */}
        <button
          type="button"
          onClick={onSendAnyway}
          className="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-amber-line bg-white px-4 text-sm font-semibold text-ink hover:bg-paper"
        >
          {copy.sendAnyway}
        </button>
      </div>
      {state.notice ? <p className="mt-2 mb-0 text-[13px] text-amber-ink">{state.notice}</p> : null}
      <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0 lg:max-h-[calc(100dvh-14rem)] lg:overflow-y-auto">
        {open.map((finding, i) => (
          <FindingItem
            key={finding.id}
            finding={finding}
            index={i}
            onFix={() => onFix(finding)}
            onIgnore={() => onIgnore(finding.id)}
          />
        ))}
      </ul>
      {!state.modelUsed && !state.notice ? (
        <p className="mt-4 mb-0 text-xs text-amber-ink">{copy.modelSkipped}</p>
      ) : null}
    </div>
  );
}

function Ready({ state }: { state: CheckState }) {
  const reviewed = state.findings.length > 0;
  return (
    <div className={cn(shell, "stage-brand text-white")}>
      <div aria-hidden="true" className="stage-grid absolute inset-0" />
      <div className="relative">
        {state.stale ? <Stale /> : null}
        <span
          aria-hidden="true"
          className="cl-pop inline-flex size-12 items-center justify-center rounded-full bg-white"
        >
          <Check size={20} color={palette.brand} />
        </span>
        <h2 className="mt-4 mb-0 font-display text-2xl font-bold tracking-tight">{copy.readyTitle}</h2>
        <p className="mt-1.5 mb-0 text-sm text-on-brand">
          {reviewed ? copy.readyAfterReview : copy.readyBody}
        </p>
        <p className="mt-4 mb-0 rounded-xl bg-white/10 px-3.5 py-3 text-[13px] text-on-brand">
          {copy.readyNext}
        </p>
      </div>
    </div>
  );
}

/** Clinton's side of Compose: ready, checking, findings to review, or all clear. */
export function ClintonPanel(props: Props) {
  const { status } = props.state;
  return (
    <section aria-label="Clinton" aria-live="polite" aria-busy={status === "checking"}>
      {status === "review" ? <Review {...props} /> : null}
      {status === "ready" ? <Ready state={props.state} /> : null}
      {status === "idle" || status === "checking" ? <Idle checking={status === "checking"} /> : null}
    </section>
  );
}
