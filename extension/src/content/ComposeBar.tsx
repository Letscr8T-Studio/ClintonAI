import { useCallback, useEffect, useId, useState } from "react";
import { composeBarCopy as copy } from "@/content/extension";
import type { ExtensionApi } from "./api";
import { CheckPanel } from "./CheckPanel";
import { DevReadout } from "./DevReadout";
import { applyFinding, flaggedRanges } from "./findings";
import { setHighlights } from "./highlights";
import { Pill, pillStatus } from "./Pill";
import { SendSection } from "./SendSection";
import { useAccount } from "./useAccount";
import { useClintonSend, type Sent } from "./useClintonSend";
import { useDraft } from "./useDraft";
import { useGmailCheck } from "./useGmailCheck";

type ComposeBarProps = {
  compose: Element;
  api: ExtensionApi;
  open: (url: string) => void;
  /** After Send with Clinton AI (the compose window then closes). */
  onSent: (sent: Sent) => void;
};

/** Clinton AI in one Gmail compose window: the pill after Send, the panel, the highlights. */
export function ComposeBar({ compose, api, open, onSent }: ComposeBarProps) {
  const account = useAccount(api.loadAccount);
  const draft = useDraft(compose);
  const me = account?.kind === "ready" ? account.me : null;
  const check = useGmailCheck(draft, me !== null, api.requestCheck);
  const delay = me?.defaultDelaySeconds ?? 300;
  const sender = useClintonSend(compose, draft, check.history, delay, api.queue, onSent);
  const [panelOpen, setPanelOpen] = useState(false);
  const close = useCallback(() => setPanelOpen(false), []);
  const panelId = useId();

  // Highlights follow the words: recomputed whenever the email or the findings change.
  useEffect(() => setHighlights(compose, flaggedRanges(compose, check.findings)), [compose, check.findings]);
  useEffect(() => () => setHighlights(compose, []), [compose]);

  const status = pillStatus(account, check.status, check.findings.length);
  const usable = !status.action && me?.gmail?.status === "active";
  const showPanel = panelOpen && usable && me !== null;
  const onPill = status.action
    ? () => open(status.action!)
    : usable
      ? () => setPanelOpen(!panelOpen)
      : undefined;

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <Pill
        status={status}
        onClick={onPill}
        expanded={usable ? showPanel : undefined}
        controls={showPanel ? panelId : undefined}
        title={status.tone === "on" ? copy.readyHint : undefined}
      />
      {showPanel ? (
        <CheckPanel
          id={panelId}
          findings={check.findings}
          notice={check.notice}
          checked={check.status === "done"}
          onFix={(f) => {
            if (applyFinding(compose, f)) check.settle(f, true);
          }}
          onIgnore={check.settle}
          onClose={close}
        >
          <SendSection
            draft={draft}
            me={me}
            sending={sender.sending}
            error={sender.error}
            onSend={sender.send}
          />
        </CheckPanel>
      ) : null}
      {/* A build constant, so store builds drop the readout entirely. */}
      {__DEV__ ? <DevReadout compose={compose} draft={draft} /> : null}
    </div>
  );
}
