import { watchComposeWindows } from "../gmail/watch";
import { serviceWorkerApi as api } from "./api";
import { ComposeBar } from "./ComposeBar";
import { mountNextToSend, showSentNote } from "./mount";
import type { Sent } from "./useClintonSend";

// Content script on mail.google.com. It looks only at compose windows (new emails, replies,
// forwards, pop-outs), never the inbox or opened emails, and adds Clinton AI's bar to each.

const open = (url: string) => window.open(url, "_blank", "noopener");
const onSent = (sent: Sent) => showSentNote(sent, api.takeBack, open);

watchComposeWindows(document.body, (compose) =>
  mountNextToSend(compose, <ComposeBar compose={compose} api={api} open={open} onSent={onSent} />),
);
