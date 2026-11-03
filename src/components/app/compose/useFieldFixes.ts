"use client";

import { useRef, type Dispatch, type SetStateAction } from "react";
import { applyFix } from "@/lib/check/apply-fix";
import type { Finding } from "@/lib/check/types";
import type { DraftFields } from "./ComposeFields";

type Options = {
  values: DraftFields;
  setValues: Dispatch<SetStateAction<DraftFields>>;
  /** The finding is dealt with (fixed or looked at). */
  resolve: (id: string) => void;
  /** Clinton's own fix was applied (counted for the dashboard). */
  onFixed: () => void;
};

/**
 * Fix it and Show me: applies Clinton's suggestion to its field and selects the new words, or
 * jumps to the words it pointed at. Also owns the field refs it needs.
 */
export function useFieldFixes({ values, setValues, resolve, onFixed }: Options) {
  const toRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const fix = (finding: Finding) => {
    resolve(finding.id);
    const el = { to: toRef, subject: subjectRef, body: bodyRef }[finding.field].current;
    const result = applyFix(values[finding.field], finding);
    const select = () => {
      el?.focus();
      if (result.start >= 0) el?.setSelectionRange(result.start, result.start + result.length);
    };
    if (!result.changed) return select();
    // Applying Clinton's own fix is not a user edit, so the check result stays current.
    setValues((v) => ({ ...v, [finding.field]: result.value }));
    onFixed();
    requestAnimationFrame(select);
  };

  return { fix, toRef, subjectRef, bodyRef };
}
