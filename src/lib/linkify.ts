// Web addresses in plain text, as pieces to render: "See the plan (https://x.com/p)." becomes
// text, link, text. Only http(s) addresses; everything else stays text (and React escapes it).

export type TextPiece = { text: string; href?: string };

const URL_RE = /https?:\/\/[^\s<>"']+/g;
/** Punctuation that ends a sentence rather than the address. */
const TRAILING = /[.,;:!?'"]+$/;

/** Drops trailing punctuation, and a closing bracket the address didn't open. */
function trim(url: string): string {
  let out = url.replace(TRAILING, "");
  while (out.endsWith(")") && (out.match(/\(/g)?.length ?? 0) < (out.match(/\)/g)?.length ?? 0)) {
    out = out.slice(0, -1).replace(TRAILING, "");
  }
  return out;
}

export function linkify(text: string): TextPiece[] {
  const pieces: TextPiece[] = [];
  let at = 0;
  for (const match of text.matchAll(URL_RE)) {
    const url = trim(match[0]);
    const start = match.index;
    if (start > at) pieces.push({ text: text.slice(at, start) });
    pieces.push({ text: url, href: url });
    at = start + url.length;
  }
  if (at < text.length) pieces.push({ text: text.slice(at) });
  return pieces;
}
