import { useEffect, useState } from "react";
import type { AccountState } from "../account";

/**
 * The account, asked of the service worker when the window opens and again whenever the Gmail tab
 * comes back into view (the person may have signed in on tryclinton.com in another tab).
 */
export function useAccount(load: () => Promise<AccountState>): AccountState | null {
  const [account, setAccount] = useState<AccountState | null>(null);

  useEffect(() => {
    let live = true;
    const refresh = () =>
      load()
        .catch((): AccountState => ({ kind: "offline" }))
        .then((next) => live && setAccount(next));
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    void refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      live = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return account;
}
