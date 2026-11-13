/** "Preye Omusuku" → "PO"; "ada" → "A"; "ada.obi@x.com" → "AO". For avatars without a photo. */
export function initialsOf(name: string): string {
  const words = name
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.[0] ?? "?");
  return letters.toUpperCase();
}
