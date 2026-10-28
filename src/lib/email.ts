// Email validation shared by the browser form and the API routes.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_EMAIL_LENGTH = 254;

/** Trimmed, lower-cased email, or null when the value isn't a plausible address. */
export function normaliseEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return null;
  return email;
}

export function isValidEmail(value: string): boolean {
  return normaliseEmail(value) !== null;
}
