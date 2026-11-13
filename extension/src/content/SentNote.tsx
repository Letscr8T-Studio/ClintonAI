import { useState } from "react";
import { Close } from "@/components/ui/icons";
import { extensionSendCopy } from "@/content/extension-send";
import { formatWhen } from "@/lib/schedule";
import { links } from "../config";
import { accountIndex, composeUrl, MAX_COMPOSE_URL } from "../gmail/sending";
import type { Sent } from "./useClintonSend";

const copy = extensionSendCopy.sent;

type SentNoteProps = {
  sent: Sent;
  takeBack: (id: string) => Promise<boolean>;
  open: (url: string) => void;
  onDismiss: () => void;
};

function message(sent: Sent): string {
  const when = formatWhen(new Date(sent.sendAt));
  const main = sent.immediate ? copy.now : sent.scheduled ? copy.scheduled(when) : copy.held(when);
  return sent.safeSend ? `${main} ${copy.safeSend}` : main;
}

const action = "cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-semibold";

/**
 * The note at the bottom of Gmail after Send with Clinton AI. Undo takes the email back out of the
 * Outbox and reopens it, filled in, in a new Gmail window (the original compose window is gone).
 */
export function SentNote({ sent, takeBack, open, onDismiss }: SentNoteProps) {
  const [state, setState] = useState<"idle" | "undoing" | string>("idle");

  const undo = async () => {
    // Opened now, while the click still counts, or the browser blocks it as a pop-up.
    const win = window.open("about:blank", "_blank", "popup,width=760,height=680");
    setState("undoing");
    if (!(await takeBack(sent.id))) {
      win?.close();
      return setState(copy.tooLate);
    }
    const account = accountIndex(location.pathname);
    let url = composeUrl(sent.reopen, account);
    let done: string = copy.undone;
    if (url.length > MAX_COMPOSE_URL) {
      url = composeUrl(sent.reopen, account, false);
      await navigator.clipboard.writeText(sent.reopen.body).catch(() => undefined);
      done = copy.undoneCopied;
    }
    if (win) win.location.href = url;
    else open(url);
    setState(done);
  };

  const settled = state !== "idle" && state !== "undoing";
  return (
    <div
      role="status"
      className="flex max-w-[460px] items-center gap-3 rounded-2xl bg-night px-4 py-3 text-[13px] text-white"
    >
      <p className="m-0 flex-1 leading-snug">
        {settled ? state : state === "undoing" ? copy.undoing : message(sent)}
        {!sent.discarded && !settled ? ` ${copy.draftKept}` : null}
      </p>
      {!sent.immediate && state === "idle" ? (
        <button type="button" onClick={undo} className={`${action} bg-white text-night`}>
          {copy.undo}
        </button>
      ) : null}
      <button type="button" onClick={() => open(links.outbox)} className={`${action} text-white underline`}>
        {copy.outbox}
      </button>
      <button type="button" onClick={onDismiss} aria-label={copy.dismiss} className={`${action} text-white`}>
        <Close size={16} />
      </button>
    </div>
  );
}
