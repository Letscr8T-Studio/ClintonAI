"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DRAFT_HANDOFF_KEY } from "@/components/app/compose/useSendEmail";
import { appRoutes } from "@/config/routes";
import { emailActionErrors } from "@/content/app/outbox";
import type { EmailDraft, OutboxEmail } from "@/types/emails";
import type { OutboxAction } from "./WaitingCard";

type Json = { ok: boolean; error?: string; draft?: EmailDraft };

/**
 * Outbox actions (send now, edit, cancel, withdraw) and keeping the page in step with the server:
 * every 5 s while something is waiting, every 30 s while a Safe Send email can still be opened.
 */
export function useOutboxActions(emails: OutboxEmail[]) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const waiting = emails.some((e) => e.status === "held" || e.status === "sending");
  const watching = emails.some(
    (e) => e.safeSendInfo && !e.safeSendInfo.withdrawnAt && !e.safeSendInfo.contentDeletedAt,
  );
  useEffect(() => {
    if (!waiting && !watching) return;
    const id = setInterval(() => router.refresh(), waiting ? 5000 : 30_000);
    return () => clearInterval(id);
  }, [waiting, watching, router]);

  const run = async (emailId: string, url: string, body?: object): Promise<Json | null> => {
    setBusyId(emailId);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
      });
      const json = (await res.json()) as Json;
      if (!json.ok) throw new Error(json.error ?? emailActionErrors.failed);
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : emailActionErrors.failed);
      return null;
    } finally {
      setBusyId(null);
      router.refresh();
    }
  };

  const act = async (email: OutboxEmail, action: OutboxAction) => {
    const json = await run(email.id, `/api/emails/${email.id}/${action}`);
    if (action === "edit" && json?.draft) {
      window.sessionStorage.setItem(DRAFT_HANDOFF_KEY, JSON.stringify(json.draft));
      router.push(appRoutes.compose);
    }
  };

  const withdraw = (email: OutboxEmail, recipientId?: string) => {
    if (!email.safeSendInfo) return;
    void run(
      email.id,
      `/api/safe-send/${email.safeSendInfo.messageId}/withdraw`,
      recipientId ? { recipientId } : {},
    );
  };

  return { busyId, error, act, withdraw };
}
