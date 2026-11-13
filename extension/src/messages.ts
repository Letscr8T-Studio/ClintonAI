import type { CheckRequest } from "@/lib/validation/compose";
import type { AccountState } from "./account";
import type { CheckReply } from "./check";
import type { OutboxAction, OutboxReply } from "./outbox";
import type { QueueReply, QueueRequest } from "./send";

// Messages to the background service worker, which makes every call to tryclinton.com. Pages and
// content scripts ask; they never call the site themselves.

export type ExtensionRequest =
  | { type: "account" }
  | { type: "check"; draft: CheckRequest }
  | { type: "queue"; request: QueueRequest }
  | { type: "takeBack"; id: string }
  | { type: "outbox" }
  | { type: "outboxAction"; action: OutboxAction };

type Replies = {
  account: AccountState;
  check: CheckReply;
  queue: QueueReply;
  takeBack: boolean;
  outbox: OutboxReply;
  outboxAction: boolean;
};

export function isExtensionRequest(value: unknown): value is ExtensionRequest {
  if (typeof value !== "object" || value === null) return false;
  const { type, draft, request, id, action } = value as Record<string, unknown>;
  const object = (v: unknown) => typeof v === "object" && v !== null;
  if (type === "account" || type === "outbox") return true;
  if (type === "outboxAction") return object(action);
  if (type === "check") return object(draft);
  if (type === "queue") return object(request);
  return type === "takeBack" && typeof id === "string";
}

/** Sends a request to the service worker and waits for its reply. */
export function ask<R extends ExtensionRequest>(request: R): Promise<Replies[R["type"]]> {
  return chrome.runtime.sendMessage(request);
}
