import "server-only";
import { describeHit } from "@/content/app/compose";
import { toRuleFindings } from "@/lib/check/findings";
import { runRules } from "@/lib/check/rules";
import type { CheckResult, DraftEmail, Finding, ModelType, RuleType } from "@/lib/check/types";
import type { CheckModel } from "./model";
import { MAX_MODEL_FINDINGS, type ModelAnswer } from "./prompt";

/** The model gets this long; after that the rule findings are returned on their own. */
export const MODEL_TIMEOUT_MS = 6000;

/** Model finding types that say the same thing as a rule, when that rule has fired. */
const COVERED_BY_RULE: Partial<Record<ModelType, RuleType>> = { recipient: "greeting_mismatch" };

/**
 * True when a model excerpt points at essentially the same words as a rule excerpt: inside it,
 * or wrapping it with little more ("Hi Tunde" around "Tunde"). A long sentence that merely
 * contains a short flagged word ("attached") is a different finding and is kept.
 */
function sameWords(rule: string, model: string): boolean {
  const r = rule.toLowerCase();
  const m = model.toLowerCase();
  return r.includes(m) || (m.includes(r) && m.length - r.length <= 12);
}

const overlaps = (a: string, b: string) => a.includes(b) || b.includes(a);

/**
 * Keeps model findings that point at real text (or none), drops those that repeat a rule
 * finding, and caps the count. Excerpts the model invented never reach the user. A fix whose
 * words overlap a fix already shown is dropped too: applying one would break the other
 * ("Dear Kemi, i mizz you" next to "Kemi → Tunde" and "mizz → miss").
 */
export function modelFindings(answer: ModelAnswer, draft: DraftEmail, rules: Finding[]): Finding[] {
  const ruleExcerpts = rules.flatMap((f) => (f.excerpt ? [f.excerpt] : []));
  const ruleTypes = new Set(rules.map((f) => f.type));
  const fixes = rules.flatMap((f) => (f.excerpt && f.suggestion ? [f.excerpt] : []));
  return answer.findings
    .flatMap((f, i): Finding[] => {
      const excerpt = f.excerpt.trim();
      const inSubject = excerpt !== "" && draft.subject.includes(excerpt);
      if (excerpt && !inSubject && !draft.body.includes(excerpt)) return [];
      if (excerpt && ruleExcerpts.some((r) => sameWords(r, excerpt))) return [];
      const covering = COVERED_BY_RULE[f.type];
      if (covering && ruleTypes.has(covering)) return [];
      // A suggestion only makes sense as a swap for real, quoted words.
      const suggestion = f.suggestion.trim();
      // A passed time has no right answer Clinton can know: point at it, never rewrite it.
      const usable = f.type !== "timing" && excerpt !== "" && suggestion !== "" && suggestion !== excerpt;
      if (usable && fixes.some((x) => overlaps(x, excerpt))) return [];
      if (usable) fixes.push(excerpt);
      return [
        {
          id: `model-${i}-${f.type}`,
          source: "model",
          type: f.type,
          field: inSubject ? "subject" : "body",
          message: f.message,
          ...(excerpt ? { excerpt } : {}),
          ...(usable ? { suggestion } : {}),
        },
      ];
    })
    .slice(0, MAX_MODEL_FINDINGS);
}

/**
 * Attaches the model's subject line to the "no subject" finding, so Fix it can fill the empty field.
 * Only for a genuinely empty subject, and only a single plain line of sensible length.
 */
export function withSubjectSuggestion(findings: Finding[], draft: DraftEmail, subject: string): Finding[] {
  const line = subject.trim().replace(/^["'“”]+|["'“”]+$/g, "");
  if (draft.subject.trim() || !line || line.length > 120 || /[\r\n]/.test(line)) return findings;
  return findings.map((f) => (f.type === "empty_subject" ? { ...f, suggestion: line } : f));
}

export type CheckRun = CheckResult & { modelName: string | null; latencyMs: number };

export async function runCheck(
  draft: DraftEmail,
  model: CheckModel | null,
  now = new Date(),
  /** The writer's IANA time zone, so "10am today" can be judged against their clock. */
  timeZone?: string,
): Promise<CheckRun> {
  const started = Date.now();
  const rules = toRuleFindings(runRules(draft, now), describeHit);
  if (!model) return { findings: rules, modelUsed: false, modelName: null, latencyMs: Date.now() - started };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
  try {
    const answer = await model.check(draft, controller.signal, { now, timeZone });
    return {
      findings: [
        ...withSubjectSuggestion(rules, draft, answer.subject),
        ...modelFindings(answer, draft, rules),
      ],
      modelUsed: true,
      modelName: model.name,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    // Timeouts and provider errors never block a send: fall back to the rules.
    // Log the reason only; never the email.
    console.warn("AI check fell back to rules", error instanceof Error ? error.name : "unknown");
    return { findings: rules, modelUsed: false, modelName: model.name, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}
