import { afterEach, describe, expect, it, vi } from "vitest";
import { NOT_WRITTEN } from "./compose";
import { replaceInInput } from "./edit";
import { findTextRange } from "./ranges";

function editor(html: string) {
  document.body.innerHTML = `<div contenteditable="true" g_editable="true">${html}</div>`;
  return document.body.firstElementChild!;
}
afterEach(() => {
  document.body.innerHTML = "";
});

describe("findTextRange", () => {
  it("finds words inside one line", () => {
    const range = findTextRange(
      editor("<div>Hi Ada,</div><div>See the report attached.</div>"),
      "report attached",
    );
    expect(String(range)).toBe("report attached");
  });

  it("finds words split by formatting, and treats non-breaking spaces as spaces", () => {
    const range = findTextRange(
      editor("<div>Please find the <b>rep</b>ort&nbsp;attached</div>"),
      "the report attached",
    );
    expect(String(range)).toBe("the report attached");
  });

  it("never matches in the quoted message or the signature", () => {
    const root = editor(
      '<div>Fine.</div><div class="gmail_signature">Regards, Ada</div><div class="gmail_quote">Regards to all</div>',
    );
    expect(findTextRange(root, "Regards", NOT_WRITTEN)).toBeNull();
    expect(String(findTextRange(root, "Fine", NOT_WRITTEN))).toBe("Fine");
  });

  it("returns nothing for missing or blank words", () => {
    const root = editor("<div>Hello</div>");
    expect(findTextRange(root, "Goodbye")).toBeNull();
    expect(findTextRange(root, "  ")).toBeNull();
  });
});

describe("replaceInInput (the subject)", () => {
  it("replaces the words, or fills an empty subject, and tells Gmail it changed", () => {
    document.body.innerHTML = '<input name="subjectbox" value="Q4 nmbers" />';
    const input = document.querySelector("input")!;
    const changed = vi.fn();
    input.addEventListener("input", changed);
    expect(replaceInInput(input, "nmbers", "numbers")).toBe(true);
    expect(input.value).toBe("Q4 numbers");
    expect(changed).toHaveBeenCalled();

    input.value = "";
    expect(replaceInInput(input, undefined, "Contract")).toBe(true);
    expect(input.value).toBe("Contract");
    expect(replaceInInput(input, "missing", "x")).toBe(false);
  });
});
