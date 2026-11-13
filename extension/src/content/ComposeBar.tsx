import { palette } from "@/config/brand";
import { composeBarCopy as copy } from "@/content/extension";
import { ClintonMark } from "@/components/ui/icons";
import type { AccountState } from "../account";
import { links } from "../config";
import { DevReadout } from "./DevReadout";
import { useAccount } from "./useAccount";
import { useDraft } from "./useDraft";

type ComposeBarProps = {
  compose: Element;
  loadAccount: () => Promise<AccountState>;
  open: (url: string) => void;
};

/** `label` is what's said; `short` what fits in Gmail's crowded toolbar, when they differ. */
type Status = { label: string; short?: string; tone: "on" | "off"; action?: string };

function status(account: AccountState | null): Status {
  if (!account) return { label: copy.loading, tone: "off" };
  if (account.kind === "signed-out") return { label: copy.signIn, tone: "off", action: links.login };
  if (account.kind === "offline") return { label: copy.offline, tone: "off" };
  if (account.me.gmail?.status !== "active")
    return { label: copy.connectGmail, tone: "off", action: links.home };
  return { label: copy.ready, short: copy.name, tone: "on" };
}

const pill =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-[13px] font-medium whitespace-nowrap text-ink";

/** The pill next to Gmail's Send. Milestone 3: who you are and that Clinton AI sees this email. */
export function ComposeBar({ compose, loadAccount, open }: ComposeBarProps) {
  const account = useAccount(loadAccount);
  const draft = useDraft(compose);
  const { label, short, tone, action } = status(account);

  const content = (
    <>
      <span aria-hidden="true" className="inline-flex size-5 items-center justify-center rounded-md bg-brand">
        <ClintonMark size={14} color={palette.white} />
      </span>
      <span aria-hidden={short ? true : undefined}>{short ?? label}</span>
      {short ? <span className="sr-only">{label}</span> : null}
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${tone === "on" ? "bg-brand" : "bg-subtle"}`}
      />
    </>
  );

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {action ? (
        <button
          type="button"
          className={`${pill} cursor-pointer hover:bg-brand-wash`}
          onClick={() => open(action)}
        >
          {content}
        </button>
      ) : (
        <span role="status" title={tone === "on" ? copy.readyHint : undefined} className={pill}>
          {content}
        </span>
      )}
      {/* A build constant, so store builds drop the readout entirely. */}
      {__DEV__ ? <DevReadout compose={compose} draft={draft} /> : null}
    </div>
  );
}
