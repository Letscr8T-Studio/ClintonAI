"use client";

import { useState, useSyncExternalStore } from "react";
import { waitlistCopy as copy } from "@/content/join";
import { attributionSource, readStorage, writeStorage } from "@/lib/browser";
import { normaliseEmail } from "@/lib/email";
import { openSurvey } from "@/lib/tally";
import type { ApiResult } from "@/lib/validation/waitlist";

export type WaitlistStatus = "idle" | "loading" | "joined" | "error";

async function postJson(url: string, body: unknown): Promise<ApiResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (res.ok && data.ok) return { ok: true };
  return { ok: false, error: data.error ?? copy.errors.generic };
}

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Email saved on this device by an earlier join (null on the server and for new visitors). */
function useSavedEmail(): string | null {
  return useSyncExternalStore(
    subscribeToStorage,
    () => readStorage(copy.storageKey) ?? readStorage(copy.legacyStorageKey),
    () => null,
  );
}

/** State and actions for the waitlist form: join, remember on this device, then the Tally survey. */
export function useWaitlist() {
  const savedEmail = useSavedEmail();
  const [email, setEmailValue] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [rawStatus, setStatus] = useState<WaitlistStatus>("idle");
  const [error, setError] = useState("");
  const [surveyDone, setSurveyDone] = useState(false);

  // Returning visitors who already joined on this device see the "on the list" state.
  const status: WaitlistStatus = savedEmail && rawStatus === "idle" ? "joined" : rawStatus;

  function setEmail(value: string) {
    setEmailValue(value);
    if (status === "error") setStatus("idle");
  }

  async function join() {
    const value = normaliseEmail(email);
    if (!value) {
      setStatus("error");
      setError(copy.errors.invalid);
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const result = await postJson("/api/waitlist", {
        email: value,
        company: honeypot,
        source: attributionSource(),
      });
      if (!result.ok) {
        setStatus("error");
        setError(result.error);
        return;
      }
      writeStorage(copy.storageKey, value);
      setStatus("joined");
    } catch {
      setStatus("error");
      setError(copy.errors.network);
    }
  }

  function startSurvey() {
    const value = (email || savedEmail || "").trim().toLowerCase();
    openSurvey(value, () => {
      setSurveyDone(true);
      postJson("/api/survey-complete", { email: value }).catch(() => {});
    });
  }

  return { email, setEmail, honeypot, setHoneypot, status, error, surveyDone, join, startSurvey };
}
