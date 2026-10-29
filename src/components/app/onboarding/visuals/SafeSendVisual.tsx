import { Chip } from "@/components/ui/Chip";
import { ClintonMark } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { safeSendSample as s } from "@/content/app/tour-visuals";

const at = (ms: number) => ({ animationDelay: `${ms}ms` });

/** The sender's 24-hour window with per-recipient withdraw, over what the recipient then sees. */
export function SafeSendVisual() {
  return (
    <div className="relative w-full max-w-[440px] pt-2 pb-16">
      <article
        className="cl-rise rounded-[22px] bg-cream p-5 text-ink shadow-deck"
        style={{ rotate: "-1.5deg" }}
      >
        <div className="flex items-center justify-between">
          <Chip tone="tint" size="sm" dot>
            {s.senderLabel}
          </Chip>
          <span className="font-mono text-[13px] text-brand">{s.remaining}</span>
        </div>
        <p className="mt-3 mb-3 font-display text-lg font-bold tracking-tight">{s.subject}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-brand-tint">
          <div
            className="cl-bar h-full rounded-full bg-brand"
            style={{ width: `${s.progress * 100}%`, ...at(300) }}
          />
        </div>
        <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
          {s.recipients.map((r) => (
            <li
              key={r.email}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-[13px]"
            >
              <span className="truncate font-medium">{r.email}</span>
              {r.action ? (
                <span className="flex items-center gap-2">
                  <span className="text-muted">{r.status}</span>
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                    {r.action}
                  </span>
                </span>
              ) : (
                <Chip tone="brand" size="xs">
                  {r.status}
                </Chip>
              )}
            </li>
          ))}
        </ul>
      </article>

      <article
        className="cl-pop absolute right-[-3%] bottom-0 flex w-[min(86%,320px)] items-center gap-3 rounded-[18px] bg-white p-4 shadow-deck"
        style={{ ...at(900), rotate: "2.5deg" }}
      >
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand">
          <ClintonMark size={22} color={palette.white} />
        </span>
        <div className="min-w-0">
          <p className="m-0 font-mono text-[10px] tracking-wider text-muted uppercase">{s.recipientLabel}</p>
          <p className="m-0 mt-0.5 text-sm font-semibold text-ink">{s.withdrawnTitle}</p>
          <p className="m-0 text-xs text-muted">{s.withdrawnBy}</p>
        </div>
      </article>
    </div>
  );
}
