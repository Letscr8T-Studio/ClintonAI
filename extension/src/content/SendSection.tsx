import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { scheduleCopy, trackCopy } from "@/content/app/compose-options";
import { safeSendCopy } from "@/content/app/safe-send";
import { extensionSendCopy as copy } from "@/content/extension-send";
import { formatWhen, scheduleOptions } from "@/lib/schedule";
import type { Me } from "@/lib/validation/extension";
import type { GmailDraft } from "../gmail/compose";
import { gmailTabAccount, isReplyOrForward } from "../gmail/sending";
import type { SendChoices } from "./useClintonSend";

type SendSectionProps = {
  draft: GmailDraft;
  me: Me;
  sending: boolean;
  error: string | null;
  onSend: (choices: SendChoices) => void;
};

/** Why Clinton AI can't send this one (Gmail's Send still can), or null. */
export function blockedReason(draft: GmailDraft, me: Me, doc: Document): string | null {
  if (isReplyOrForward(draft)) return copy.blocked.reply;
  if (draft.gmailAttachments > 0) return copy.blocked.attachments;
  const tab = gmailTabAccount(doc);
  const connected = me.gmail?.email.toLowerCase();
  if (tab && connected && tab !== connected) return copy.blocked.otherAccount(tab, connected);
  return null;
}

const note = "m-0 rounded-xl px-3 py-2 text-xs leading-relaxed";

/** The options and the button, the same choices as Compose on the web. Opt-in per email (rule 3). */
export function SendSection({ draft, me, sending, error, onSend }: SendSectionProps) {
  const [options] = useState(() => scheduleOptions(new Date()));
  const [when, setWhen] = useState("delay");
  const [safeSend, setSafeSend] = useState(false);
  const [trackOpens, setTrackOpens] = useState(false);
  const whenId = useId();
  const blocked = blockedReason(draft, me, document);

  if (blocked) return <p className={`${note} bg-paper text-body`}>{blocked}</p>;

  const sendAt = options.find((o) => o.id === when)?.at ?? null;
  const lossy = draft.rich.formatting || draft.rich.images;

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-xs text-muted">{copy.from(me.gmail?.email ?? "")}</p>
      <label htmlFor={whenId} className="flex items-center justify-between gap-3 text-[13px] text-ink">
        {copy.when}
        <select
          id={whenId}
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="min-w-0 rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-[13px] text-ink"
        >
          <option value="delay">{copy.smartDelay(Math.round(me.defaultDelaySeconds / 60))}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {`${scheduleCopy[o.id]} (${formatWhen(o.at)})`}
            </option>
          ))}
        </select>
      </label>
      <Switch on={safeSend} onChange={setSafeSend} label={safeSendCopy.toggle} />
      <Switch
        on={trackOpens && !safeSend}
        onChange={setTrackOpens}
        label={trackCopy.toggle}
        disabled={safeSend}
      />
      {safeSend ? <p className="m-0 text-xs text-muted">{trackCopy.safeSendNote}</p> : null}
      {lossy ? <p className={`${note} bg-amber-bg text-amber-ink`}>{copy.plainText}</p> : null}
      {error ? (
        <p role="alert" className={`${note} bg-danger-bg text-danger-ink`}>
          {error}
        </p>
      ) : null}
      <Button
        size="sm"
        disabled={sending}
        onClick={() => onSend({ sendAt, safeSend, trackOpens: trackOpens && !safeSend })}
      >
        {sending ? copy.sending : copy.button}
      </Button>
      <p className="m-0 text-center text-xs text-muted">{copy.gmailStillWorks}</p>
    </div>
  );
}
