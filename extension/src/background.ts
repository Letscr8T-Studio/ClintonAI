import { fetchAccount } from "./account";
import { runCheck } from "./check";
import { CLINTON_URL } from "./config";
import { isExtensionRequest, type ExtensionRequest } from "./messages";
import { queueEmail, takeBack } from "./send";

// Service worker: the only part of the extension that talks to tryclinton.com.

function handle(request: ExtensionRequest): Promise<unknown> {
  switch (request.type) {
    case "account":
      return fetchAccount(CLINTON_URL);
    case "check":
      return runCheck(CLINTON_URL, request.draft);
    case "queue":
      return queueEmail(CLINTON_URL, request.request);
    case "takeBack":
      return takeBack(CLINTON_URL, request.id);
  }
}

chrome.runtime.onMessage.addListener((message: unknown, sender, reply) => {
  // Only this extension's own pages and scripts; `externally_connectable` isn't declared anyway.
  if (sender.id !== chrome.runtime.id || !isExtensionRequest(message)) return false;
  handle(message).then(reply);
  return true; // the reply comes later
});
