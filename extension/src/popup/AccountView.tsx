import { Button } from "@/components/ui/Button";
import { extensionPopupCopy as copy } from "@/content/extension";
import type { AccountState } from "../account";
import { links } from "../config";

type ViewProps = { state: AccountState; open: (url: string) => void; retry: () => void };

/** One of four states: signed out, offline, Gmail missing or revoked, or ready. */
export function AccountView({ state, open, retry }: ViewProps) {
  if (state.kind === "signed-out") return <Prompt {...copy.signedOut} onClick={() => open(links.login)} />;
  if (state.kind === "offline") return <Prompt {...copy.offline} onClick={retry} />;

  const { me } = state;
  if (!me.gmail) return <Prompt {...copy.noGmail} onClick={() => open(links.home)} />;
  if (me.gmail.status !== "active") return <Prompt {...copy.revoked} onClick={() => open(links.settings)} />;

  return (
    <section aria-label={copy.ready.signedInAs} className="flex flex-col gap-3">
      <div className="grid gap-2 rounded-xl border border-line bg-paper p-3 text-sm">
        <dl className="m-0 grid gap-2">
          <Row label={copy.ready.signedInAs} value={me.name ?? me.email ?? ""} />
          <Row label={copy.ready.sendsFrom} value={me.gmail.email} />
        </dl>
        <p className="m-0 text-xs text-muted">{copy.ready.delay(Math.round(me.defaultDelaySeconds / 60))}</p>
      </div>
      <Button size="sm" onClick={() => open(links.gmail)}>
        {copy.ready.openGmail}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => open(links.home)}>
        {copy.ready.openApp}
      </Button>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="m-0 truncate font-medium text-ink">{value}</dd>
    </div>
  );
}

function Prompt({
  title,
  body,
  button,
  onClick,
}: {
  title: string;
  body: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <section aria-labelledby="prompt-title" className="flex flex-col gap-3">
      <div>
        <h2 id="prompt-title" className="m-0 text-[15px] font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-1 mb-0 text-sm text-body">{body}</p>
      </div>
      <Button size="sm" onClick={onClick}>
        {button}
      </Button>
    </section>
  );
}
