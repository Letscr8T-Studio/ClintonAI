import type { CheckRequest } from "@/lib/validation/compose";
import type { AccountState } from "../account";
import type { CheckReply } from "../check";
import { ask } from "../messages";
import type { QueueReply, QueueRequest } from "../send";

/** Everything the Gmail side asks of tryclinton.com, through the service worker. Tests pass fakes. */
export type ExtensionApi = {
  loadAccount: () => Promise<AccountState>;
  requestCheck: (draft: CheckRequest) => Promise<CheckReply>;
  queue: (request: QueueRequest) => Promise<QueueReply>;
  takeBack: (id: string) => Promise<boolean>;
};

export const serviceWorkerApi: ExtensionApi = {
  loadAccount: () => ask({ type: "account" }),
  requestCheck: (draft) => ask({ type: "check", draft }),
  queue: (request) => ask({ type: "queue", request }),
  takeBack: (id) => ask({ type: "takeBack", id }),
};
