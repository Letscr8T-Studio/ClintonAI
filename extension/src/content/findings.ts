import type { Finding } from "@/lib/check/types";
import { composeEditor, NOT_WRITTEN } from "../gmail/compose";
import { replaceInInput, replaceRange, showRange } from "../gmail/edit";
import { findTextRange } from "../gmail/ranges";
import { gmail } from "../gmail/selectors";

/** Where each body finding's words are in this compose window, for the highlights. */
export function flaggedRanges(compose: Element, findings: Finding[]): Range[] {
  const editor = composeEditor(compose);
  if (!editor) return [];
  return findings.flatMap((f) =>
    f.field === "body" && f.excerpt ? (findTextRange(editor, f.excerpt, NOT_WRITTEN) ?? []) : [],
  );
}

/**
 * Fix it (with a suggestion) or Show me (without): only ever on the person's click. Body changes go
 * through Gmail's editor, so Gmail's own Undo takes them back. True when the text was changed.
 */
export function applyFinding(compose: Element, finding: Finding): boolean {
  const { field, excerpt, suggestion } = finding;
  if (field === "subject") {
    const input = compose.querySelector<HTMLInputElement>(gmail.subject);
    if (input && suggestion) return replaceInInput(input, excerpt, suggestion);
    input?.focus();
    return false;
  }
  if (field === "body") {
    const editor = composeEditor(compose);
    const range = editor && excerpt ? findTextRange(editor, excerpt, NOT_WRITTEN) : null;
    if (range && suggestion) return replaceRange(range, suggestion);
    if (range) showRange(range);
    else (editor as HTMLElement | null)?.focus();
    return false;
  }
  // Recipients: point at the window; the person decides who to change.
  compose.scrollIntoView({ block: "nearest" });
  return false;
}
