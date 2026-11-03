"use client";

import { useState } from "react";
import { rewriteCopy as copy } from "@/content/app/compose-options";
import type { RewriteMode } from "@/lib/validation/rewrite";

type State = {
  working: boolean;
  message: string | null;
  error: boolean;
  /** The user's own text before the rewrite, and what Clinton wrote: Undo works while unchanged. */
  before: string | null;
  after: string | null;
};

const idle: State = { working: false, message: null, error: false, before: null, after: null };

/**
 * Rewrite with Clinton: replaces the message with Clinton's version on request, and keeps the
 * user's own version for Undo until they edit the new text (trust rule 4: their choice, reversible).
 */
export function useRewrite(body: string, apply: (text: string) => void) {
  const [state, setState] = useState<State>(idle);

  const run = async (mode: RewriteMode) => {
    if (!body.trim()) return setState({ ...idle, message: copy.needText, error: true });
    setState({ ...idle, working: true, message: copy.working });
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, mode }),
      });
      const json = (await res.json()) as { ok: boolean; text?: string; error?: string };
      if (!json.ok || !json.text) throw new Error(json.error ?? copy.failed);
      apply(json.text);
      setState({ ...idle, message: copy.done(copy.modes[mode].label), before: body, after: json.text });
    } catch (e) {
      setState({ ...idle, message: e instanceof Error ? e.message : copy.failed, error: true });
    }
  };

  const undo = () => {
    if (state.before === null) return;
    apply(state.before);
    setState({ ...idle, message: copy.undone });
  };

  return {
    run,
    undo,
    working: state.working,
    message: state.message,
    error: state.error,
    canUndo: state.before !== null && state.after === body,
  };
}
