import { useEffect, useId, useState } from "react";
import { composeBarCopy as copy } from "@/content/extension";
import type { CheckRequest } from "@/lib/validation/compose";
import type { AccountState } from "../account";
import type { CheckReply } from "../check";
import { CheckPanel } from "./CheckPanel";
import { DevReadout } from "./DevReadout";
import { applyFinding, flaggedRanges } from "./findings";
import { setHighlights } from "./highlights";
import { Pill, pillStatus } from "./Pill";
import { useAccount } from "./useAccount";
import { useDraft } from "./useDraft";
import { useGmailCheck } from "./useGmailCheck";

type ComposeBarProps = {
  compose: Element;
  loadAccount: () => Promise<AccountState>;
  requestCheck: (request: CheckRequest) => Promise<CheckReply>;
  open: (url: string) => void;
};

/** Clinton AI in one Gmail compose window: the pill after Send, the findings, the highlights. */
export function ComposeBar({ compose, loadAccount, requestCheck, open }: ComposeBarProps) {
  const account = useAccount(loadAccount);
  const draft = useDraft(compose);
  const signedIn = account?.kind === "ready";
  const check = useGmailCheck(draft, signedIn, requestCheck);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelId = useId();
  const showPanel = panelOpen && check.findings.length > 0;

  // Highlights follow the words: recomputed whenever the email or the findings change.
  useEffect(() => setHighlights(compose, flaggedRanges(compose, check.findings)), [compose, check.findings]);
  useEffect(() => () => setHighlights(compose, []), [compose]);

  const status = pillStatus(account, check.status, check.findings.length);
  const onClick = status.action
    ? () => open(status.action!)
    : check.findings.length
      ? () => setPanelOpen(!panelOpen)
      : undefined;

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <Pill
        status={status}
        onClick={onClick}
        expanded={check.findings.length ? showPanel : undefined}
        controls={showPanel ? panelId : undefined}
        title={status.tone === "on" ? copy.readyHint : undefined}
      />
      {showPanel ? (
        <CheckPanel
          id={panelId}
          findings={check.findings}
          notice={check.notice}
          onFix={(f) => {
            if (applyFinding(compose, f)) check.settle(f);
          }}
          onIgnore={check.settle}
          onClose={() => setPanelOpen(false)}
        />
      ) : null}
      {/* A build constant, so store builds drop the readout entirely. */}
      {__DEV__ ? <DevReadout compose={compose} draft={draft} /> : null}
    </div>
  );
}
