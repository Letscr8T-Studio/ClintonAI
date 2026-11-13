// Development builds only: an anonymised outline of a real Gmail compose window, so a Gmail
// change can be fixed against the real structure. Keeps tags and the attributes the selectors
// use; drops all text, input values and anything that could name a person.

const KEEP = [
  "role",
  "name",
  "type",
  "contenteditable",
  "g_editable",
  "aria-multiline",
  "class",
  "data-tooltip",
];
const ADDRESS_ATTRS = ["email", "data-hovercard-id"];
const MAX_DEPTH = 40;

function attributes(el: Element): string {
  const parts: string[] = [];
  const person = ADDRESS_ATTRS.some((name) => el.hasAttribute(name));
  for (const name of KEEP) {
    const value = el.getAttribute(name);
    // A recipient chip's tooltip can carry the person's name.
    if (person && name === "data-tooltip") continue;
    if (value !== null) parts.push(`${name}="${value.replace(/@/g, "(at)").replace(/"/g, "'")}"`);
  }
  for (const name of ADDRESS_ATTRS) if (el.hasAttribute(name)) parts.push(`${name}="person@example.com"`);
  if (el instanceof HTMLInputElement && el.value) parts.push(`value="[${el.value.length} chars]"`);
  if (el.hasAttribute("aria-label")) parts.push(`aria-label="[label]"`);
  return parts.length ? " " + parts.join(" ") : "";
}

export function captureStructure(root: Element): string {
  const lines: string[] = [];
  const walk = (el: Element, depth: number) => {
    const pad = "  ".repeat(depth);
    const tag = el.tagName.toLowerCase();
    const text = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim());
    if (depth > MAX_DEPTH || ["svg", "script", "style"].includes(tag)) {
      lines.push(`${pad}<${tag}${attributes(el)}>…</${tag}>`);
      return;
    }
    lines.push(`${pad}<${tag}${attributes(el)}>${text ? "[text]" : ""}`);
    for (const child of el.children) walk(child, depth + 1);
    lines.push(`${pad}</${tag}>`);
  };
  walk(root, 0);
  return lines.join("\n");
}
