"use client";

import { useActionState, useState } from "react";
import { disconnectAction, sendTestEmailAction } from "@/app/(app)/dashboard/actions";
import { gmailCopy as copy } from "@/content/app/gmail";
import { cn } from "@/lib/cn";
import type { AccountActionState } from "@/types/accounts";

const ghost =
  "inline-flex min-h-10 cursor-pointer items-center rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60";

function Result({ state }: { state: AccountActionState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn("m-0 mt-3 text-sm font-medium", state.ok ? "text-brand-deep" : "text-danger")}
    >
      {state.message}
    </p>
  );
}

/** "Send test email" panel for a connected account. */
export function TestSend({ accountId }: { accountId: string }) {
  const [state, action, pending] = useActionState(sendTestEmailAction, {});
  return (
    <form action={action} className="rounded-2xl bg-brand-wash p-5">
      <input type="hidden" name="accountId" value={accountId} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="m-0 text-[15px] font-semibold text-ink">{copy.testTitle}</h3>
          <p className="m-0 mt-1 max-w-[420px] text-sm text-muted">{copy.testBody}</p>
        </div>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={cn(ghost, "shrink-0 justify-center bg-ink text-white hover:bg-brand-deep")}
        >
          {pending ? copy.testing : copy.testButton}
        </button>
      </div>
      <Result state={state} />
    </form>
  );
}

/** Two-step disconnect: ask, then confirm. */
export function Disconnect({ accountId }: { accountId: string }) {
  const [state, action, pending] = useActionState(disconnectAction, {});
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAsking(true)}
          className={cn(ghost, "-ml-4 text-muted hover:text-danger")}
        >
          {copy.disconnect}
        </button>
        <Result state={state} />
      </div>
    );
  }
  return (
    <form action={action} className="rounded-2xl border border-danger/25 bg-danger-bg/60 p-4">
      <input type="hidden" name="accountId" value={accountId} />
      <p className="m-0 text-sm font-medium text-danger-ink">{copy.disconnectConfirm}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={cn(ghost, "bg-danger text-white hover:bg-danger-ink")}
        >
          {pending ? copy.disconnecting : copy.disconnectYes}
        </button>
        <button type="button" onClick={() => setAsking(false)} className={cn(ghost, "bg-white text-ink")}>
          {copy.disconnectNo}
        </button>
      </div>
      <Result state={state} />
    </form>
  );
}
