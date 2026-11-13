import type { CheckRequest } from "@/lib/validation/compose";
import type { AccountState } from "./account";
import type { CheckReply } from "./check";

// Messages to the background service worker, which makes every call to tryclinton.com. Pages and
// content scripts ask; they never call the site themselves.

export type ExtensionRequest = { type: "account" } | { type: "check"; draft: CheckRequest };

type Replies = { account: AccountState; check: CheckReply };

export function isExtensionRequest(value: unknown): value is ExtensionRequest {
  if (typeof value !== "object" || value === null) return false;
  const { type, draft } = value as { type?: unknown; draft?: unknown };
  return type === "account" || (type === "check" && typeof draft === "object" && draft !== null);
}

/** Sends a request to the service worker and waits for its reply. */
export function ask<R extends ExtensionRequest>(request: R): Promise<Replies[R["type"]]> {
  return chrome.runtime.sendMessage(request);
}
