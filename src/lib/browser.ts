// Browser-only helpers. Every call is wrapped so private mode, blocked storage
// or a bad referrer never breaks the page.

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the page still works, it just won't remember.
  }
}

/**
 * Where a visitor came from: a ?utm_source= or ?ref= tag, else the referring host, else "direct".
 * Share links should be tagged (tryclinton.com/?ref=linkedin) so the founders console can compare channels.
 */
export function attributionSource(search = window.location.search, referrer = document.referrer): string {
  try {
    const params = new URLSearchParams(search);
    const tag = params.get("utm_source") || params.get("ref");
    if (tag) return tag;
    if (referrer) return new URL(referrer).hostname;
  } catch {
    // Malformed referrer: fall through.
  }
  return "direct";
}
