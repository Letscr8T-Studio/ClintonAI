"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DRAFT_HANDOFF_KEY } from "@/components/app/compose/useSendEmail";
import { appRoutes } from "@/config/routes";
import { emailActionErrors, outboxCopy as copy } from "@/content/app/outbox";
import type { EmailDraft, OutboxEmail } from "@/types/emails";
import { HistoryList } from "./HistoryList";
import { WaitingCard, type OutboxAction } from "./WaitingCard";

type Props = { emails: OutboxEmail[]; justQueued: boolean };

const sectionTitle = "m-0 mb-3 font-mono text-xs tracking-wider text-muted uppercase";

/** The Outbox: waiting emails with live countdowns, then what was sent and what wasn't. */
export function OutboxView({ emails, justQueued }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const waiting = emails.filter((e) => e.status === "held" || e.status === "sending");
  const sent = emails.filter((e) => e.status === "sent");
  const notSent = emails.filter((e) => e.status === "failed" || e.status === "cancelled");

  // While anything is waiting, keep the page in step with the server (sent, retried, failed).
  useEffect(() => {
    if (waiting.length === 0) return;
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [waiting.length, router]);

  const act = async (email: OutboxEmail, action: OutboxAction) => {
    setBusyId(email.id);
    setError(null);
    try {
      const res = await fetch(`/api/emails/${email.id}/${action}`, { method: "POST" });
      const json = (await res.json()) as { ok: boolean; error?: string; draft?: EmailDraft };
      if (!json.ok) throw new Error(json.error ?? emailActionErrors.failed);
      if (action === "edit" && json.draft) {
        window.sessionStorage.setItem(DRAFT_HANDOFF_KEY, JSON.stringify(json.draft));
        return router.push(appRoutes.compose);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : emailActionErrors.failed);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 font-display text-[clamp(32px,4vw,44px)] font-bold tracking-[-0.04em]">
            {copy.title}
          </h1>
          <p className="mt-2 mb-0 max-w-[560px] text-muted">{copy.body}</p>
        </div>
        <Link
          href={appRoutes.compose}
          className="inline-flex min-h-11 items-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white no-underline shadow-cta hover:bg-brand-deep"
        >
          {copy.compose}
        </Link>
      </header>

      {justQueued && waiting.length > 0 ? (
        <p
          role="status"
          className="cl-rise m-0 rounded-2xl bg-brand-tint px-4 py-3 text-sm font-medium text-brand-deep"
        >
          {copy.queued}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="m-0 rounded-2xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-ink"
        >
          {error}
        </p>
      ) : null}

      <section aria-labelledby="waiting-h">
        <h2 id="waiting-h" className={sectionTitle}>
          {copy.waitingTitle}
        </h2>
        {waiting.length ? (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {waiting.map((email) => (
              <WaitingCard
                key={email.id}
                email={email}
                busy={busyId === email.id}
                onAction={(a) => act(email, a)}
              />
            ))}
          </ul>
        ) : (
          <p className="m-0 rounded-[24px] border border-dashed border-line-strong px-5 py-6 text-sm text-muted">
            {copy.waitingEmpty}
          </p>
        )}
      </section>

      <section aria-labelledby="sent-h">
        <h2 id="sent-h" className={sectionTitle}>
          {copy.sentTitle}
        </h2>
        <HistoryList emails={sent} empty={copy.sentEmpty} />
      </section>

      {notSent.length ? (
        <section aria-labelledby="not-sent-h">
          <h2 id="not-sent-h" className={sectionTitle}>
            {copy.notSentTitle}
          </h2>
          <HistoryList emails={notSent} empty="" />
        </section>
      ) : null}
    </div>
  );
}
