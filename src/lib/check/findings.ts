import type { Finding, RuleHit } from "./types";

/**
 * Rule hits → findings. The wording is passed in (it lives in src/content), so this stays pure
 * and runs on the server and, as a fallback when the check can't be reached, in the browser.
 */
export function toRuleFindings(hits: RuleHit[], describe: (hit: RuleHit) => string): Finding[] {
  return hits.map((hit, i) => ({
    id: `rule-${i}-${hit.type}`,
    source: "rules",
    type: hit.type,
    field: hit.field,
    message: describe(hit),
    ...(hit.excerpt ? { excerpt: hit.excerpt } : {}),
    ...(hit.excerpt && hit.suggestion ? { suggestion: hit.suggestion } : {}),
  }));
}
