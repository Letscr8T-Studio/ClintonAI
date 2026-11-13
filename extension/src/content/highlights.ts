import { palette } from "@/config/brand";

// Highlights on the words Clinton flagged, drawn with the browser's CSS Custom Highlight API:
// Gmail's text is never wrapped or changed, so its editor, Undo and draft saving are untouched.
// One shared highlight for the page; each compose window owns its own ranges in it.

const NAME = "clinton-ai-flag";
const STYLE_ID = "clinton-ai-flag-style";
const owners = new Map<object, Range[]>();

const supported = () => typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";

/** The only style Clinton AI adds to Gmail's page itself. */
function ensureStyle(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `::highlight(${NAME}) { background-color: ${palette.highlight}; text-decoration: underline wavy ${palette.amberDot}; text-decoration-thickness: 1.5px; }`;
  doc.head.append(style);
}

/** Replaces one compose window's highlighted ranges (an empty list clears them). */
export function setHighlights(owner: object, ranges: Range[]) {
  if (!supported()) return;
  if (ranges.length) owners.set(owner, ranges);
  else owners.delete(owner);
  const all = [...owners.values()].flat();
  if (!all.length) {
    CSS.highlights.delete(NAME);
    return;
  }
  ensureStyle(document);
  CSS.highlights.set(NAME, new Highlight(...all));
}
