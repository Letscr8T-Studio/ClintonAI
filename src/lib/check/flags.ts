import type { Finding } from "./types";

/** Where a finding's words sit in the text right now. */
export type Flag = { finding: Finding; start: number; end: number };

/** A run of text, flagged or not, for drawing the highlights in order. */
export type Segment = { text: string; flag?: Flag };

/**
 * The open findings that point at words still in `text`, in reading order. Worked out from the
 * live text on every edit, so a flag moves with its words and disappears once they are changed.
 * Where two flags overlap, the earlier one wins (one highlight per word).
 */
export function flagRanges(text: string, findings: Finding[]): Flag[] {
  const flags = findings.flatMap((finding): Flag[] => {
    const at = finding.excerpt ? text.indexOf(finding.excerpt) : -1;
    return at < 0 ? [] : [{ finding, start: at, end: at + finding.excerpt!.length }];
  });
  flags.sort((a, b) => a.start - b.start);
  return flags.filter((f, i) => flags.slice(0, i).every((g) => g.end <= f.start || g.start >= f.end));
}

/** Splits the text into plain and flagged runs that join back to exactly `text`. */
export function segments(text: string, flags: Flag[]): Segment[] {
  const out: Segment[] = [];
  let at = 0;
  for (const flag of flags) {
    if (flag.start > at) out.push({ text: text.slice(at, flag.start) });
    out.push({ text: text.slice(flag.start, flag.end), flag });
    at = flag.end;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** The flag the caret is in (or touching), if any. */
export function flagAt(flags: Flag[], caret: number): Flag | undefined {
  return flags.find((f) => caret >= f.start && caret <= f.end);
}
