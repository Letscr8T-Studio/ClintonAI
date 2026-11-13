import { meSchema, type Me } from "@/lib/validation/extension";

/** What the extension knows about the person: from GET /api/me with the tryclinton.com session. */
export type AccountState = { kind: "signed-out" } | { kind: "offline" } | { kind: "ready"; me: Me };

/**
 * Asks the site who is signed in. The browser attaches the tryclinton.com session cookie because
 * the extension has host permission for the site; no token is ever stored in the extension.
 */
export async function fetchAccount(base: string, fetchImpl: typeof fetch = fetch): Promise<AccountState> {
  let res: Response;
  try {
    res = await fetchImpl(`${base}/api/me`, { credentials: "include", cache: "no-store" });
  } catch {
    return { kind: "offline" };
  }
  if (res.status === 401) return { kind: "signed-out" };
  if (!res.ok) return { kind: "offline" };
  const parsed = meSchema.safeParse(await res.json().catch(() => null));
  return parsed.success ? { kind: "ready", me: parsed.data } : { kind: "offline" };
}
