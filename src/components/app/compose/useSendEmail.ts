"use client";

import { useState } from "react";
import { emailActionErrors } from "@/content/app/outbox";
import type { EmailDraft } from "@/types/emails";

/** Hands a draft from the Outbox ("Edit") to Compose, once, within this browser tab. */
export const DRAFT_HANDOFF_KEY = "clinton-compose-draft";

type SendOptions = {
  delaySeconds: number;
  findingsCount: number;
  findingsAccepted: number;
  safeSend: boolean;
  checkIds: string[];
};

/** The email just sent, for the Undo bar. `immediate`: Smart Delay was off, so it has already left. */
export type SentEmail = { id: string; sendAt: string; immediate: boolean; safeSend: boolean };

type Json = { ok: boolean; error?: string; id?: string; sendAt?: string; draft?: EmailDraft };

async function post(url: string, body?: object): Promise<Json> {
  const res = await fetch(url, {
    method: "POST",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const json = (await res.json()) as Json;
  if (!json.ok) throw new Error(json.error ?? emailActionErrors.failed);
  return json;
}

/**
 * Puts the email in the Outbox and keeps the user in Compose, with the Undo bar. Undo takes the
 * email back out while it still waits (the Outbox's Edit), returning its draft.
 */
export function useSendEmail() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<SentEmail | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);

  const send = async (draft: EmailDraft, options: SendOptions): Promise<boolean> => {
    setSending(true);
    setError(null);
    try {
      const json = await post("/api/emails", { ...draft, ...options });
      setSent({
        id: json.id!,
        sendAt: json.sendAt!,
        immediate: options.delaySeconds === 0,
        safeSend: options.safeSend,
      });
      setUndoError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : emailActionErrors.failed);
      return false;
    } finally {
      setSending(false);
    }
  };

  const undo = async (): Promise<(EmailDraft & { safeSend: boolean }) | null> => {
    if (!sent) return null;
    setUndoing(true);
    setUndoError(null);
    try {
      const { draft } = await post(`/api/emails/${sent.id}/edit`);
      setSent(null);
      return draft ? { ...draft, safeSend: sent.safeSend } : null;
    } catch (e) {
      setUndoError(e instanceof Error ? e.message : emailActionErrors.failed);
      return null;
    } finally {
      setUndoing(false);
    }
  };

  const dismiss = () => setSent(null);

  return { send, sending, error, sent, undo, undoing, undoError, dismiss };
}
