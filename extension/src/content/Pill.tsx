import { palette } from "@/config/brand";
import { composeBarCopy as copy } from "@/content/extension";
import { ClintonMark } from "@/components/ui/icons";
import type { AccountState } from "../account";
import { links } from "../config";
import type { CheckStatus } from "./useGmailCheck";

/** `label` is what's said; `short` what fits in Gmail's crowded toolbar, when they differ. */
export type PillStatus = {
  label: string;
  short?: string;
  tone: "on" | "off" | "warn";
  /** A page to open instead (sign in, connect Gmail). */
  action?: string;
};

export function pillStatus(account: AccountState | null, check: CheckStatus, found: number): PillStatus {
  if (!account) return { label: copy.loading, tone: "off" };
  if (account.kind === "signed-out") return { label: copy.signIn, tone: "off", action: links.login };
  if (account.kind === "offline") return { label: copy.offline, tone: "off" };
  if (account.me.gmail?.status !== "active")
    return { label: copy.connectGmail, tone: "off", action: links.home };
  if (found) return { label: copy.toCheck(found), tone: "warn" };
  if (check === "checking") return { label: copy.checkingLabel, short: copy.checking, tone: "on" };
  if (check === "done") return { label: copy.allGoodLabel, short: copy.allGood, tone: "on" };
  return { label: copy.ready, short: copy.name, tone: "on" };
}

const base =
  "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[13px] font-medium whitespace-nowrap";
const tones = {
  on: "border-line bg-surface text-ink",
  off: "border-line bg-surface text-ink",
  warn: "border-amber-line bg-amber-bg text-amber-ink",
};
const dots = { on: "bg-brand", off: "bg-subtle", warn: "bg-amber-dot" };

type PillProps = {
  status: PillStatus;
  onClick?: () => void;
  expanded?: boolean;
  controls?: string;
  title?: string;
};

/** The pill after Gmail's Send: a button when it leads somewhere, otherwise a live status. */
export function Pill({ status, onClick, expanded, controls, title }: PillProps) {
  const { label, short, tone } = status;
  const content = (
    <>
      <span aria-hidden="true" className="inline-flex size-5 items-center justify-center rounded-md bg-brand">
        <ClintonMark size={14} color={palette.white} />
      </span>
      <span aria-hidden={short ? true : undefined}>{short ?? label}</span>
      {short ? <span className="sr-only">{label}</span> : null}
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dots[tone]}`} />
    </>
  );
  const classes = `${base} ${tones[tone]}`;

  if (onClick)
    return (
      <button
        type="button"
        onClick={onClick}
        aria-expanded={expanded}
        aria-controls={controls}
        title={title}
        className={`${classes} cursor-pointer hover:brightness-95`}
      >
        {content}
      </button>
    );
  return (
    <span role="status" title={title} className={classes}>
      {content}
    </span>
  );
}
