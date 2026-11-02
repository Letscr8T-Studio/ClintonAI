import { Chip } from "@/components/ui/Chip";
import { GoogleMark } from "@/components/ui/GoogleMark";
import { Check, Close } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { gmailCopy as copy, type connectOutcomes } from "@/content/app/gmail";
import { cn } from "@/lib/cn";
import type { GmailAccount } from "@/types/accounts";
import { Disconnect, TestSend } from "./AccountActions";
import { ConnectButton } from "./ConnectButton";

type Outcome = (typeof connectOutcomes)[keyof typeof connectOutcomes];
type Props = { accounts: GmailAccount[]; outcome: Outcome | null };

const card = "rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8";
const connectedOn = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));

function Banner({ outcome }: { outcome: Outcome }) {
  const success = outcome.tone === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      className={cn(
        "cl-rise m-0 mb-6 rounded-2xl px-4 py-3 text-sm font-medium",
        success ? "bg-brand-tint text-brand-ink" : "bg-danger-bg text-danger-ink",
      )}
    >
      {outcome.text}
    </p>
  );
}

function Mark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface shadow-tile"
    >
      <GoogleMark size={24} />
    </span>
  );
}

function ConnectPanel() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Mark />
        <p className="m-0 font-mono text-[11px] tracking-wider text-muted uppercase">{copy.label}</p>
      </div>
      <h2 className="mt-5 mb-0 font-display text-[clamp(26px,3vw,34px)] leading-tight font-bold tracking-[-0.03em]">
        {copy.connectTitle}
      </h2>
      <p className="mt-2 mb-0 max-w-[520px] text-[15px] leading-relaxed text-muted">{copy.connectBody}</p>
      <ul className="m-0 mt-6 grid list-none gap-2 p-0 sm:grid-cols-3">
        {copy.permissions.map((p) => (
          <li
            key={p.text}
            className="flex items-center gap-2.5 rounded-xl bg-paper px-3 py-3 text-sm text-ink"
          >
            <span
              className={cn(
                "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                p.allowed ? "bg-brand" : "bg-line-strong text-muted",
              )}
            >
              {p.allowed ? <Check size={10} color={palette.white} /> : <Close size={10} />}
            </span>
            <span className={p.allowed ? undefined : "text-muted"}>{p.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">
        <ConnectButton label={copy.connectButton} />
      </div>
    </>
  );
}

function AccountPanel({ account }: { account: GmailAccount }) {
  const active = account.status === "active";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <Mark />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 className="m-0 min-w-0 font-display text-xl font-bold tracking-tight break-all sm:text-2xl">
              {account.email}
            </h2>
            <Chip tone={active ? "tint" : "amber"} size="sm" dot>
              {copy.status[account.status]}
            </Chip>
          </div>
          <p className="m-0 mt-1 text-sm text-muted">{copy.connectedOn(connectedOn(account.connectedAt))}</p>
        </div>
      </div>
      {active ? (
        <TestSend accountId={account.id} />
      ) : (
        <div className="rounded-2xl border border-amber-line bg-amber-bg p-5">
          <p className="m-0 mb-4 text-sm text-amber-ink">{copy.revokedBody}</p>
          <ConnectButton label={copy.reconnectButton} />
        </div>
      )}
      <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-start sm:justify-between">
        <p className="m-0 text-[13px] text-muted sm:order-last sm:pt-2.5">{copy.footerNote}</p>
        <Disconnect accountId={account.id} />
      </div>
    </div>
  );
}

/** Gmail on the home screen: connect it, or manage the connected account. */
export function GmailCard({ accounts, outcome }: Props) {
  return (
    <section aria-label={copy.label} className={cn(card, "cl-rise")} style={{ animationDelay: "120ms" }}>
      {outcome ? <Banner outcome={outcome} /> : null}
      {accounts.length === 0 ? (
        <ConnectPanel />
      ) : (
        accounts.map((account) => <AccountPanel key={account.id} account={account} />)
      )}
    </section>
  );
}
