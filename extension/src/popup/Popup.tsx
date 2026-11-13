import { useCallback, useEffect, useState } from "react";
import { site } from "@/config/site";
import { palette } from "@/config/brand";
import { extensionPopupCopy as copy } from "@/content/extension";
import { ClintonMark } from "@/components/ui/icons";
import type { AccountState } from "../account";
import { AccountView } from "./AccountView";
import { PopupOutbox } from "./PopupOutbox";
import type { PopupOutboxApi } from "./usePopupOutbox";

type PopupProps = {
  /** Asks the service worker who is signed in. */
  load: () => Promise<AccountState>;
  /** Opens a page in a new tab (and closes the popup). */
  open: (url: string) => void;
  outbox: PopupOutboxApi;
};

/** The window under the toolbar icon: account status, the Outbox, and the way into Gmail or the web app. */
export function Popup({ load, open, outbox }: PopupProps) {
  const [state, setState] = useState<AccountState | null>(null);

  const refresh = useCallback(() => {
    setState(null);
    load()
      .catch((): AccountState => ({ kind: "offline" }))
      .then(setState);
  }, [load]);

  useEffect(() => {
    let live = true;
    load()
      .catch((): AccountState => ({ kind: "offline" }))
      .then((next) => live && setState(next));
    return () => {
      live = false;
    };
  }, [load]);

  return (
    <main className="flex flex-col gap-4 p-4">
      <header className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-flex size-7 items-center justify-center rounded-lg bg-brand"
        >
          <ClintonMark size={19} color={palette.white} />
        </span>
        <h1 className="m-0 font-display text-lg leading-none font-extrabold tracking-[-0.04em] text-ink">
          {site.name}
        </h1>
      </header>
      {state ? (
        <AccountView state={state} open={open} retry={refresh} />
      ) : (
        <p role="status" className="m-0 text-sm text-muted">
          {copy.loading}
        </p>
      )}
      {state?.kind === "ready" && state.me.gmail?.status === "active" ? (
        <PopupOutbox api={outbox} open={open} />
      ) : null}
      <p className="m-0 border-t border-line pt-3 text-xs text-muted">{copy.privacy}</p>
    </main>
  );
}
