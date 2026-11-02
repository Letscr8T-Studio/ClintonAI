"use client";

import { useNow } from "@/components/app/outbox/useNow";
import { Chip, type ChipTone } from "@/components/ui/Chip";
import { LocalTime } from "@/components/ui/LocalTime";
import { appRoutes } from "@/config/routes";
import { recentCopy as copy } from "@/content/app/dashboard";
import { emailState, type EmailState } from "@/lib/email-state";
import { formatTimeLeft } from "@/lib/time";
import type { OutboxEmail } from "@/types/emails";
import { Panel } from "./Panel";

const tone: Record<EmailState["kind"], ChipTone> = {
  waiting: "brand",
  sending: "brand",
  sent: "tint",
  withdrawable: "tint",
  withdrawn: "neutral",
  expired: "tint",
  cancelled: "neutral",
  failed: "amber",
};

/** How long it can still be taken back; null once that is no longer possible. */
function windowText(state: EmailState, now: number): string | null {
  if (state.kind === "waiting" || state.kind === "withdrawable") {
    const left = formatTimeLeft(new Date(state.until).getTime() - now);
    return copy.window[state.kind](left);
  }
  return state.kind === "expired" ? copy.window.expired : null;
}

/** The latest emails as a table: status, and how long each can still be taken back (live). */
export function RecentEmails({ emails }: { emails: OutboxEmail[] }) {
  const now = useNow();
  return (
    <Panel id="recent-h" title={copy.title} link={{ href: appRoutes.outbox, label: copy.link }} delay={160}>
      {emails.length === 0 ? (
        <p className="m-0 px-5 pt-3 pb-6 text-sm text-muted sm:px-6">{copy.empty}</p>
      ) : (
        <table className="mt-3 w-full border-collapse text-left text-sm">
          <caption className="sr-only">{copy.caption}</caption>
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-line font-mono text-[11px] tracking-wider text-muted uppercase">
              <th scope="col" className="py-2 pr-3 pl-6 font-medium">
                {copy.columns.email}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {copy.columns.status}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {copy.columns.unsend}
              </th>
              <th scope="col" className="py-2 pr-6 pl-3 text-right font-medium">
                {copy.columns.when}
              </th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => {
              const state = now === null ? null : emailState(email, now);
              const open = state?.kind === "waiting" || state?.kind === "withdrawable";
              const chip = state ? (
                <Chip size="xs" tone={tone[state.kind]}>
                  {copy.status[state.kind]}
                </Chip>
              ) : null;
              const takeBack = state && now !== null ? windowText(state, now) : null;
              return (
                <tr key={email.id} className="border-t border-line first:border-t-0 md:first:border-t">
                  <td className="w-full max-w-0 py-3.5 pr-3 pl-5 align-top sm:pl-6">
                    <p className="m-0 flex items-center gap-2">
                      <span className="truncate font-semibold text-ink">
                        {email.subject || copy.noSubject}
                      </span>
                      {email.safeSend ? (
                        <Chip size="xs" tone="outline" className="shrink-0">
                          {copy.safeSend}
                        </Chip>
                      ) : null}
                    </p>
                    <p className="m-0 mt-0.5 truncate text-[13px] text-muted">
                      {copy.to(email.to.join(", "))}
                    </p>
                    <p className="m-0 mt-2 flex flex-wrap items-center gap-2 text-[12.5px] md:hidden">
                      {chip}
                      <span className={open ? "font-semibold text-brand-deep" : "text-muted"}>
                        {takeBack}
                      </span>
                    </p>
                  </td>
                  <td className="hidden px-3 py-3.5 align-top whitespace-nowrap md:table-cell">{chip}</td>
                  <td
                    className={`hidden px-3 py-3.5 align-top whitespace-nowrap tabular-nums md:table-cell ${open ? "font-semibold text-brand-deep" : "text-muted"}`}
                  >
                    {takeBack ??
                      (state ? (
                        <>
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">{copy.window.none}</span>
                        </>
                      ) : null)}
                  </td>
                  <td className="py-3.5 pr-5 pl-3 text-right align-top whitespace-nowrap text-muted sm:pr-6">
                    <LocalTime iso={email.sentAt ?? email.createdAt} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Panel>
  );
}
