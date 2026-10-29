import type { RuleHit } from "./types";

// Things people regret sending in plain text: card numbers, passwords, bank account numbers.
// Only the kind of data is reported; the message never repeats the secret itself.

const PASSWORD = /\b(?:password|passcode|passwd|pin)\s*(?:is|:|=)\s*\S+/i;
const ACCOUNT = /\b(?:account|acct|a\/c)\s*(?:number|no\.?|num|#)?\s*(?:is|:)?\s*\d[\d\s-]{7,20}\d\b/i;
const DIGIT_RUNS = /\b\d(?:[ -]?\d){12,18}\b/g;

/** Luhn checksum: true for plausible card numbers. */
export function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function findSensitiveData(body: string): RuleHit[] {
  const hits: RuleHit[] = [];
  for (const m of body.matchAll(DIGIT_RUNS)) {
    const digits = m[0].replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && passesLuhn(digits)) {
      hits.push({ type: "sensitive_data", field: "body", excerpt: m[0], params: { kind: "card" } });
      break;
    }
  }
  const password = body.match(PASSWORD);
  if (password)
    hits.push({ type: "sensitive_data", field: "body", excerpt: password[0], params: { kind: "password" } });
  const account = body.match(ACCOUNT);
  if (account)
    hits.push({ type: "sensitive_data", field: "body", excerpt: account[0], params: { kind: "account" } });
  return hits;
}
