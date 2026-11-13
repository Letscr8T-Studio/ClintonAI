import { useCallback, useEffect, useState } from "react";
import type { PopupEmail } from "@/lib/validation/extension";
import type { OutboxAction, OutboxReply } from "../outbox";

export type PopupOutboxApi = {
  load: () => Promise<OutboxReply>;
  act: (action: OutboxAction) => Promise<boolean>;
};

type State = { status: "loading" | "ready" | "offline"; emails: PopupEmail[] };

/**
 * The popup's Outbox: loaded when it opens, ticking every second for the countdowns, and loaded
 * again after an action or when a waiting email's time comes (it has left, or is leaving).
 */
export function usePopupOutbox(api: PopupOutboxApi) {
  const [state, setState] = useState<State>({ status: "loading", emails: [] });
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(
    () =>
      api
        .load()
        .catch((): OutboxReply => ({ kind: "offline" }))
        .then((reply) =>
          setState(
            reply.kind === "ok"
              ? { status: "ready", emails: reply.emails }
              : { status: "offline", emails: [] },
          ),
        ),
    [api],
  );

  useEffect(() => {
    void reload();
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [reload]);

  // A waiting email whose time has come: fetch the list again a moment later.
  const due = state.emails.some((e) => e.kind === "waiting" && Date.parse(e.until) <= now);
  useEffect(() => {
    if (!due) return;
    const id = setTimeout(() => void reload(), 3000);
    return () => clearTimeout(id);
  }, [due, reload]);

  const act = useCallback(
    async (key: string, action: OutboxAction) => {
      setBusy(key);
      setFailed(false);
      const done = await api.act(action).catch(() => false);
      if (!done) setFailed(true);
      await reload();
      setBusy(null);
    },
    [api, reload],
  );

  return { ...state, now, busy, failed, act };
}
