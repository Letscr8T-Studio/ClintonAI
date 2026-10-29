"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { appRoutes } from "@/config/routes";
import { emailActionErrors } from "@/content/app/outbox";
import type { EmailDraft } from "@/types/emails";

/** Hands a draft from the Outbox ("Edit") to Compose, once, within this browser tab. */
export const DRAFT_HANDOFF_KEY = "clinton-compose-draft";

type SendOptions = {
  delaySeconds: number;
  findingsCount: number;
  findingsAccepted: number;
  safeSend: boolean;
};

/** Puts the email in the Outbox, then goes there to watch the countdown. */
export function useSendEmail() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (draft: EmailDraft, options: SendOptions) => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, ...options }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? emailActionErrors.failed);
      router.push(`${appRoutes.outbox}?queued=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : emailActionErrors.failed);
      setSending(false);
    }
  };

  return { send, sending, error };
}
