// Gmail's editor holds HTML (<div>Hi</div><div><br></div>…). The check and sending work on plain
// text, so turn it into lines the way the person sees them. Works without layout (no innerText), so
// it behaves the same in tests.

const BLOCKS = new Set(["DIV", "P", "LI", "UL", "OL", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "TABLE", "TR"]);
const NBSP = / /g;

type TextOptions = {
  /** Leave out anything matching this (quoted replies, the signature). */
  skip?: string;
  /** For sending: keep each link's address after its words, "the summary (https://…)". */
  links?: boolean;
};

/** Where a link goes, when sending it as plain text would otherwise lose that. */
function linkTarget(el: Element, words: string): string | null {
  const href = el.getAttribute("href") ?? "";
  if (!/^(https?:|mailto:)/i.test(href)) return null;
  const shown = href.replace(/^mailto:/i, "");
  return words.includes(shown) ? null : shown;
}

/** Plain text of an editor. */
export function editorText(editor: Element, { skip, links = false }: TextOptions = {}): string {
  let out = "";
  const newline = () => {
    if (out && !out.endsWith("\n")) out += "\n";
  };
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue ?? "";
      // Source indentation between blocks: the browser doesn't show it, so neither do we.
      if (/^\s*\n\s*$/.test(text)) return;
      out += text.replace(NBSP, " ");
      return;
    }
    if (!(node instanceof Element) || (skip && node.matches(skip))) return;
    if (node.tagName === "BR") {
      out += "\n";
      return;
    }
    const block = BLOCKS.has(node.tagName);
    if (block) newline();
    if (node.tagName === "LI") out += "• ";
    const before = out.length;
    node.childNodes.forEach(walk);
    if (links && node.tagName === "A") {
      const target = linkTarget(node, out.slice(before));
      if (target) out += ` (${target})`;
    }
    if (block) newline();
  };
  editor.childNodes.forEach(walk);
  return out
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** What plain text would lose: shown to the person before Clinton AI sends it. */
export type RichContent = { links: boolean; images: boolean; formatting: boolean };

export function richContent(editor: Element, skip?: string): RichContent {
  const has = (selector: string) =>
    [...editor.querySelectorAll(selector)].some((el) => !(skip && el.closest(skip)));
  return {
    links: has("a[href]"),
    images: has("img"),
    formatting: has(
      "b, strong, i, em, u, s, ul, ol, font, h1, h2, h3, [style*='font-weight'], [style*='color']",
    ),
  };
}
