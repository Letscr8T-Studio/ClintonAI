import { useCallback, useEffect, useMemo, useState } from "react";
import { describeHit, panelCopy } from "@/content/app/compose";
import { toRuleFindings } from "@/lib/check/findings";
import { runRules } from "@/lib/check/rules";
import type { Finding } from "@/lib/check/types";
import type { CheckRequest } from "@/lib/validation/compose";
import type { CheckReply } from "../check";
import type { GmailDraft } from "../gmail/compose";

export type CheckStatus = "idle" | "checking" | "done";

/** Nothing to check until there's someone to send to and something to say. */
export function toCheckRequest(draft: GmailDraft): CheckRequest | null {
  if (!draft.to.length || !draft.body.trim()) return null;
  return {
    to: draft.to,
    cc: draft.cc,
    bcc: draft.bcc,
    subject: draft.subject,
    body: draft.body,
    // Names unknown: enough that "see attached" isn't flagged when Gmail has a file attached.
    attachments: Array.from({ length: draft.gmailAttachments }, (_, i) => `gmail-attachment-${i + 1}`),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

type Result = { key: string; findings: Finding[]; notice: string | null };

/** The site's answer, or the in-browser rules when it can't give one. */
function settle(reply: CheckReply, request: CheckRequest): Omit<Result, "key"> {
  const rules = () => toRuleFindings(runRules(request), describeHit);
  if (reply.kind === "ok") return { findings: reply.findings, notice: null };
  if (reply.kind === "signed-out") return { findings: [], notice: null };
  if (reply.kind === "limited") return { findings: rules(), notice: reply.error };
  return { findings: rules(), notice: panelCopy.errorBody };
}

/** Fixed or ignored once, settled for this email, even when a later check finds it again. */
const findingKey = (f: Finding) => `${f.type}|${f.excerpt ?? f.message}`;

/** Still about this email: its words are still there (a finding moves on once they're changed). */
function stillThere(f: Finding, draft: GmailDraft): boolean {
  if (!f.excerpt) return true;
  if (f.field === "body") return draft.body.includes(f.excerpt);
  if (f.field === "subject") return draft.subject.includes(f.excerpt);
  return true;
}

/**
 * Checks the email as it's written: `delayMs` after the last change, never the same content
 * twice, and only when `enabled` (signed in). Advises only; it never touches Gmail's Send.
 */
export function useGmailCheck(
  draft: GmailDraft,
  enabled: boolean,
  requestCheck: (request: CheckRequest) => Promise<CheckReply>,
  delayMs = 1500,
) {
  const request = useMemo(() => toCheckRequest(draft), [draft]);
  // Everything but the time zone, so the key only changes when the email does.
  const key = request ? JSON.stringify({ ...request, timeZone: undefined }) : null;
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [ignored, setIgnored] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (!enabled || !key || result?.key === key) return;
    let live = true;
    const timer = setTimeout(async () => {
      const latest = {
        ...(JSON.parse(key) as CheckRequest),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      setPending(key);
      const reply = await requestCheck(latest).catch((): CheckReply => ({ kind: "failed" }));
      if (live) setResult({ key, ...settle(reply, latest) });
    }, delayMs);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [enabled, key, result?.key, requestCheck, delayMs]);

  /** Ignore, or a fix that was applied: either way the person has dealt with it. */
  const settleFinding = useCallback((f: Finding) => setIgnored((s) => new Set(s).add(findingKey(f))), []);

  const findings = useMemo(
    () =>
      enabled && request
        ? (result?.findings ?? []).filter((f) => !ignored.has(findingKey(f)) && stillThere(f, draft))
        : [],
    [enabled, request, result, ignored, draft],
  );
  const checking = enabled && key !== null && pending === key && result?.key !== key;
  const status: CheckStatus = checking ? "checking" : result && enabled && request ? "done" : "idle";

  return {
    status,
    findings,
    notice: enabled && request ? (result?.notice ?? null) : null,
    settle: settleFinding,
  };
}
