import { popupOutboxCopy as copy } from "@/content/extension";
import { links } from "../config";
import { OutboxRow } from "./OutboxRow";
import { usePopupOutbox, type PopupOutboxApi } from "./usePopupOutbox";

type Props = { api: PopupOutboxApi; open: (url: string) => void };

/** The popup's Outbox: what's waiting to leave and what can still be withdrawn, with their actions. */
export function PopupOutbox({ api, open }: Props) {
  const outbox = usePopupOutbox(api);

  return (
    <section aria-labelledby="outbox-title" className="flex flex-col gap-2">
      <h2 id="outbox-title" className="m-0 text-[13px] font-semibold tracking-wide text-muted uppercase">
        {copy.title}
      </h2>
      {outbox.status === "loading" ? (
        <p role="status" className="m-0 text-sm text-muted">
          {copy.loading}
        </p>
      ) : outbox.status === "offline" ? (
        <p className="m-0 text-sm text-muted">{copy.offline}</p>
      ) : outbox.emails.length === 0 ? (
        <p className="m-0 text-sm text-muted">{copy.empty}</p>
      ) : (
        <ul className="m-0 flex max-h-[300px] list-none flex-col gap-2 overflow-auto p-0">
          {outbox.emails.map((email) => (
            <OutboxRow
              key={email.id}
              email={email}
              now={outbox.now}
              busy={outbox.busy === email.id}
              onAct={(action) => void outbox.act(email.id, action)}
            />
          ))}
        </ul>
      )}
      {outbox.failed ? (
        <p role="alert" className="m-0 rounded-lg bg-danger-bg px-2.5 py-1.5 text-xs text-danger-ink">
          {copy.failed}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => open(links.outbox)}
        className="cursor-pointer self-start border-0 bg-transparent p-0 text-xs font-semibold text-brand hover:underline"
      >
        {copy.openOutbox}
      </button>
    </section>
  );
}
