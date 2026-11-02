// Keyboard shortcuts for the signed-in app: matching keys to commands, and filtering the menu.

/** Two-key shortcuts ("G" then "H") must be finished within this long. */
export const SEQUENCE_MS = 1200;

export type KeyedCommand = { id: string; label: string; keywords?: string; keys?: string[] };

/**
 * Matches the keys pressed so far (lower-case, oldest first) against the commands' shortcuts.
 * "match": one command's keys are complete; "pending": the keys start a longer shortcut.
 */
export function matchKeys<T extends KeyedCommand>(
  pressed: string[],
  list: T[],
): { kind: "match"; command: T } | { kind: "pending" } | { kind: "none" } {
  const keyed = list.filter((c) => c.keys?.length);
  const same = (c: T, n: number) => c.keys!.slice(0, n).every((k, i) => k.toLowerCase() === pressed[i]);
  const exact = keyed.find((c) => c.keys!.length === pressed.length && same(c, pressed.length));
  if (exact) return { kind: "match", command: exact };
  return keyed.some((c) => c.keys!.length > pressed.length && same(c, pressed.length))
    ? { kind: "pending" }
    : { kind: "none" };
}

/** True when a key press belongs to a field (typing), not to the app's shortcuts. */
export function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Commands whose label or keywords contain every word typed, in their original order. */
export function filterCommands<T extends KeyedCommand>(list: T[], query: string): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.filter((c) => {
    const haystack = `${c.label} ${c.keywords ?? ""}`.toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}
