import { fetchAccount } from "./account";
import { CLINTON_URL } from "./config";
import { isExtensionRequest } from "./messages";

// Service worker: the only part of the extension that talks to tryclinton.com.

chrome.runtime.onMessage.addListener((message: unknown, sender, reply) => {
  // Only this extension's own pages and scripts; `externally_connectable` isn't declared anyway.
  if (sender.id !== chrome.runtime.id || !isExtensionRequest(message)) return false;
  fetchAccount(CLINTON_URL).then(reply);
  return true; // the reply comes later
});
