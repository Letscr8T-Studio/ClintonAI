/**
 * Returns `value` only when it is a same-site path ("/dashboard?x=1"), else `fallback`.
 * Blocks open redirects such as "//evil.com", "/\evil.com" and "https://evil.com".
 */
export function safeNextPath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 200) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\\]/.test(value)) return fallback;
  return value;
}
