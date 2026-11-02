"use client";

import { useCallback, useRef, useState } from "react";
import { describeHit, panelCopy } from "@/content/app/compose";
import { toRuleFindings } from "@/lib/check/findings";
import { runRules } from "@/lib/check/rules";
import type { DraftEmail, Finding } from "@/lib/check/types";

export type CheckStatus = "idle" | "checking" | "review" | "ready";

export type CheckState = {
  status: CheckStatus;
  findings: Finding[];
  /** Ids of findings the user hasn't fixed or ignored yet. */
  open: string[];
  modelUsed: boolean;
  /** The email changed after the check; the result no longer describes it. */
  stale: boolean;
  /** Shown when the server check failed and only the in-browser rules ran. */
  notice: string | null;
};

const initial: CheckState = {
  status: "idle",
  findings: [],
  open: [],
  modelUsed: false,
  stale: false,
  notice: null,
};

type CheckResponse =
  | { ok: true; findings: Finding[]; modelUsed: boolean; checkId: string | null }
  | { ok: false; error: string };

/** What every check while writing this email found, for the dashboard (counts and ids only). */
export type CheckHistory = { checkIds: string[]; caught: number };

/** The same mistake found again on a re-check is not a new catch. */
const findingKey = (f: Finding) => `${f.type}|${f.excerpt ?? f.message}`;

function settle(findings: Finding[], modelUsed: boolean, notice: string | null): CheckState {
  return {
    status: findings.length ? "review" : "ready",
    findings,
    open: findings.map((f) => f.id),
    modelUsed,
    stale: false,
    notice,
  };
}

/** Runs the pre-send check and tracks what the user has fixed or ignored. Never blocks sending. */
export function useComposeCheck() {
  const [state, setState] = useState<CheckState>(initial);
  const history = useRef({ checkIds: [] as string[], seen: new Set<string>() });

  /** Runs the check and returns the settled result, so a clean email can go straight out. */
  const check = useCallback(async (draft: DraftEmail): Promise<CheckState> => {
    setState((s) => ({ ...s, status: "checking", stale: false }));
    let next: CheckState;
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await res.json()) as CheckResponse;
      if (json.ok) {
        next = settle(json.findings, json.modelUsed, null);
        if (json.checkId) history.current.checkIds.push(json.checkId);
      } else if (res.status === 429)
        next = settle(toRuleFindings(runRules(draft), describeHit), false, json.error);
      else throw new Error(json.error);
    } catch {
      // Offline or server trouble: the rules still run here, and the user can always send.
      next = settle(toRuleFindings(runRules(draft), describeHit), false, panelCopy.errorBody);
    }
    for (const f of next.findings) history.current.seen.add(findingKey(f));
    setState(next);
    return next;
  }, []);

  const resolve = useCallback((id: string) => {
    setState((s) => {
      const open = s.open.filter((x) => x !== id);
      return { ...s, open, status: open.length ? s.status : "ready" };
    });
  }, []);

  const sendAnyway = useCallback(() => setState((s) => ({ ...s, open: [], status: "ready" })), []);

  const markEdited = useCallback(() => {
    setState((s) => (s.status === "review" || s.status === "ready" ? { ...s, stale: true } : s));
  }, []);

  /** Read when sending: every check run for this email and how many distinct mistakes they caught. */
  const checkHistory = useCallback(
    (): CheckHistory => ({
      checkIds: history.current.checkIds.slice(-20),
      caught: history.current.seen.size,
    }),
    [],
  );

  return { state, check, resolve, sendAnyway, markEdited, checkHistory };
}
