import type { AccountStatus } from "./database";

/** A connected Gmail account as the UI sees it. Never includes token data. */
export type GmailAccount = {
  id: string;
  email: string;
  status: AccountStatus;
  connectedAt: string;
};

/** Why "Connect Gmail" did not finish; shown on the home screen as `?gmail=<outcome>`. */
export type ConnectOutcome = "connected" | "cancelled" | "missing_scope" | "failed";

export type AccountActionState = { ok?: boolean; message?: string };
