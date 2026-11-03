import { findDateMismatches } from "./dates";
import { findSensitiveData } from "./sensitive";
import type { DraftEmail, RuleHit } from "./types";

// Deterministic checks: instant, free and explainable. They run before (and without) the model.

export const MANY_RECIPIENTS = 10;

const ATTACHMENT = /\b(?:attached|attachments?|enclosed|see the attachment)\b/i;
const GREETING =
  /^\s*(?:hi|hello|hey|dear|good\s+(?:morning|afternoon|evening))[\s,]+([a-z][a-z'-]{1,30})\b/i;
const GENERIC_NAMES = new Set("team all everyone there folks guys sir madam friends both".split(" "));
const GENERIC_LOCALS = new Set(
  "info hello hi team contact support admin sales hr jobs office mail noreply no reply accounts billing careers help enquiries invest press".split(
    " ",
  ),
);
const PLACEHOLDER =
  /\{\{?\s*[\w .-]{1,30}\s*\}?\}|\[(?:first\s*name|name|company|date|recipient|your name|insert[^\]]{0,30})\]|<(?:name|company|first name)>|\bX{3,}\b|\bTODO\b|\bTBD\b/i;

function missingAttachment({ body, attachments }: DraftEmail): RuleHit | null {
  if (attachments.length > 0) return null;
  const m = body.match(ATTACHMENT);
  return m ? { type: "missing_attachment", field: "body", excerpt: m[0] } : null;
}

/** Name tokens in an address's local part: "dami.o@x.co" → ["dami"]. */
function localNames(address: string): string[] {
  const local = address.split("@")[0]?.toLowerCase() ?? "";
  return local.split(/[._+\-\d]+/).filter((t) => /^[a-z]{3,}$/.test(t) && !GENERIC_LOCALS.has(t));
}

const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** The recipient's first name, if their address makes it clear (one person, a name-like local part). */
function recipientName({ to, cc }: DraftEmail): string | null {
  if (to.length !== 1 || cc.length > 0) return null;
  const first = localNames(to[0]!)[0];
  return first ? capitalise(first) : null;
}

function greetingMismatch({ body, to, cc }: DraftEmail): RuleHit | null {
  if (to.length !== 1 || cc.length > 0) return null; // only clear-cut, one-person emails
  const firstLine = body.split("\n").find((line) => line.trim()) ?? "";
  const name = firstLine.match(GREETING)?.[1];
  // A real name is capitalised; "hi there" or "hey you" are not names.
  if (!name || !/^[A-Z]/.test(name) || GENERIC_NAMES.has(name.toLowerCase())) return null;

  const tokens = localNames(to[0]!);
  if (tokens.length === 0) return null;
  const lower = name.toLowerCase();
  const matches = tokens.some((t) => t.startsWith(lower) || lower.startsWith(t));
  return matches
    ? null
    : {
        type: "greeting_mismatch",
        field: "body",
        excerpt: name,
        params: { name, recipient: to[0]! },
        suggestion: capitalise(tokens[0]!),
      };
}

function manyRecipients({ to, cc, bcc = [] }: DraftEmail): RuleHit | null {
  const count = new Set([...to, ...cc, ...bcc].map((a) => a.toLowerCase())).size;
  return count > MANY_RECIPIENTS ? { type: "many_recipients", field: "to", params: { count } } : null;
}

function placeholder(draft: DraftEmail): RuleHit | null {
  const inSubject = draft.subject.match(PLACEHOLDER);
  const inBody = inSubject ? null : draft.body.match(PLACEHOLDER);
  const excerpt = (inSubject ?? inBody)?.[0];
  if (!excerpt) return null;
  // Only a name placeholder can be filled with certainty, from the recipient's address.
  const name = /name/i.test(excerpt) ? recipientName(draft) : null;
  return {
    type: "placeholder",
    field: inSubject ? "subject" : "body",
    excerpt,
    ...(name ? { suggestion: name } : {}),
  };
}

function emptySubject({ subject }: DraftEmail): RuleHit | null {
  return subject.trim() ? null : { type: "empty_subject", field: "subject" };
}

/** Every rule, in the order findings are shown. */
export function runRules(draft: DraftEmail, now = new Date()): RuleHit[] {
  return [
    missingAttachment(draft),
    greetingMismatch(draft),
    manyRecipients(draft),
    ...findDateMismatches(draft.body, now).slice(0, 2),
    ...findSensitiveData(draft.body),
    placeholder(draft),
    emptySubject(draft),
  ].filter((hit): hit is RuleHit => hit !== null);
}
