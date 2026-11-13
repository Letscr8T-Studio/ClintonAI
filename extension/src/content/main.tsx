import { ask } from "../messages";
import { watchComposeWindows } from "../gmail/watch";
import { ComposeBar } from "./ComposeBar";
import { mountNextToSend } from "./mount";

// Content script on mail.google.com. It looks only at compose windows (new emails, replies,
// forwards, pop-outs), never the inbox or opened emails, and adds Clinton AI's bar to each.

const loadAccount = () => ask({ type: "account" });
const open = (url: string) => window.open(url, "_blank", "noopener");

watchComposeWindows(document.body, (compose) =>
  mountNextToSend(compose, <ComposeBar compose={compose} loadAccount={loadAccount} open={open} />),
);
