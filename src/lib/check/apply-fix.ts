import type { Finding } from "./types";

export type AppliedFix = {
  /** The field's new value. Unchanged when the finding is "Show me" only. */
  value: string;
  /** What to select afterwards: the new words, or the words Clinton pointed at. -1 = just focus. */
  start: number;
  length: number;
  changed: boolean;
};

/**
 * Applies a finding to its field's text. With a suggestion: replace the quoted words (or fill an
 * empty field). Without one, or if the words have since changed: point at them instead.
 */
export function applyFix(current: string, { excerpt, suggestion }: Finding): AppliedFix {
  const fill = !excerpt && Boolean(suggestion) && !current.trim();
  const at = fill ? 0 : excerpt ? current.indexOf(excerpt) : -1;
  const length = fill ? current.length : (excerpt?.length ?? 0);

  if (at >= 0 && suggestion) {
    return {
      value: current.slice(0, at) + suggestion + current.slice(at + length),
      start: at,
      length: suggestion.length,
      changed: true,
    };
  }
  return { value: current, start: at, length, changed: false };
}
