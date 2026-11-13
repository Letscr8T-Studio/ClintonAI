// Changes to Gmail's own fields, made only when the person presses Fix it (trust rule 4). They go
// through the browser's editing commands, as if typed: Gmail saves the draft as usual and its own
// Undo (Ctrl-Z) takes the change back.

/** Types `text` over the selection, as the person would. False where the browser has no such command. */
function insertText(doc: Document | null | undefined, text: string): boolean {
  return typeof doc?.execCommand === "function" && doc.execCommand("insertText", false, text);
}

function select(range: Range) {
  const selection = range.startContainer.ownerDocument?.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/** Selects the words and scrolls them into view ("Show me"). */
export function showRange(range: Range) {
  const editor = range.startContainer.parentElement?.closest<HTMLElement>('[contenteditable="true"]');
  editor?.focus();
  select(range);
  range.startContainer.parentElement?.scrollIntoView({ block: "nearest" });
}

/** Replaces the words in Gmail's editor. False if the browser refused. */
export function replaceRange(range: Range, text: string): boolean {
  showRange(range);
  return insertText(range.startContainer.ownerDocument, text);
}

/** Replaces `excerpt` in a text field (the subject); fills it when it's empty and there's no excerpt. */
export function replaceInInput(input: HTMLInputElement, excerpt: string | undefined, text: string): boolean {
  const at = excerpt ? input.value.indexOf(excerpt) : input.value.trim() ? -1 : 0;
  if (at < 0) return false;
  input.focus();
  input.setSelectionRange(at, excerpt ? at + excerpt.length : input.value.length);
  if (insertText(input.ownerDocument, text)) return true;
  // Fallback: set it directly and tell Gmail it changed.
  input.setRangeText(text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}
