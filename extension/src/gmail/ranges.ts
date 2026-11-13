// Where a finding's words sit in Gmail's editor, as a DOM Range: for highlighting them, jumping to
// them, and replacing them. Text is matched across element boundaries (a word half in bold still
// matches), but not across lines, like the plain text the check read.

type Piece = { node: Text; start: number };

const normalise = (s: string) => s.replace(/ /g, " ");

function textPieces(root: Element, skip?: string): { text: string; pieces: Piece[] } {
  const pieces: Piece[] = [];
  let text = "";
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (skip && node.parentElement?.closest(skip)) continue;
    pieces.push({ node: node as Text, start: text.length });
    text += normalise(node.nodeValue ?? "");
  }
  return { text, pieces };
}

/** The piece holding character `at`; `end` picks the one a range ending at `at` should end in. */
function locate(pieces: Piece[], at: number, end: boolean): { node: Text; offset: number } {
  for (const piece of pieces) {
    const length = piece.node.nodeValue?.length ?? 0;
    if (end ? at <= piece.start + length : at < piece.start + length)
      return { node: piece.node, offset: at - piece.start };
  }
  const last = pieces[pieces.length - 1];
  return { node: last.node, offset: last.node.nodeValue?.length ?? 0 };
}

/** The first place `excerpt` appears in the editor's own text (quote and signature skipped). */
export function findTextRange(editor: Element, excerpt: string, skip?: string): Range | null {
  const wanted = normalise(excerpt);
  if (!wanted.trim()) return null;
  const { text, pieces } = textPieces(editor, skip);
  const at = text.indexOf(wanted);
  if (at < 0) return null;
  const range = editor.ownerDocument.createRange();
  const start = locate(pieces, at, false);
  const end = locate(pieces, at + wanted.length, true);
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  return range;
}
