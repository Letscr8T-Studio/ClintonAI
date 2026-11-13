import type { AccountState } from "./account";

// Messages to the background service worker, which makes every call to tryclinton.com. Pages and
// content scripts ask; they never call the site themselves.

export type ExtensionRequest = { type: "account" };

type Replies = { account: AccountState };

export function isExtensionRequest(value: unknown): value is ExtensionRequest {
  return typeof value === "object" && value !== null && (value as { type?: unknown }).type === "account";
}

/** Sends a request to the service worker and waits for its reply. */
export function ask<R extends ExtensionRequest>(request: R): Promise<Replies[R["type"]]> {
  return chrome.runtime.sendMessage(request);
}
