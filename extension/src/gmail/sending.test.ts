import { afterEach, describe, expect, it, vi } from "vitest";
import { findComposeWindows, readCompose } from "./compose";
import captured from "./fixtures/compose-captured.html?raw";
import inlineReply from "./fixtures/reply-inline.html?raw";
import {
  accountIndex,
  composeUrl,
  discardDraft,
  gmailTabAccount,
  isReplyOrForward,
  textToSend,
} from "./sending";

function compose(fixture: string) {
  document.body.innerHTML = fixture;
  return findComposeWindows(document.body)[0];
}
afterEach(() => {
  document.body.innerHTML = "";
  document.title = "";
});

describe("sending helpers", () => {
  it("spots replies and forwards, in English and other languages", () => {
    expect(isReplyOrForward(readCompose(compose(inlineReply)))).toBe(true);
    const draft = readCompose(compose(captured));
    expect(isReplyOrForward(draft)).toBe(false);
    for (const subject of ["Re: Contract", "Fwd: Contract", "AW: Vertrag", "TR: Contrat", "RES: Contrato"])
      expect(isReplyOrForward({ ...draft, subject })).toBe(true);
    expect(isReplyOrForward({ ...draft, subject: "Recap: Q4" })).toBe(false);
  });

  it("reads which account the Gmail tab is signed in to", () => {
    document.title = "Inbox (3) - Ada@Gmail.com - Gmail";
    expect(gmailTabAccount(document)).toBe("ada@gmail.com");
    document.title = "Gmail";
    expect(gmailTabAccount(document)).toBeNull();
    expect(accountIndex("/mail/u/2/")).toBe("2");
    expect(accountIndex("/mail/")).toBe("0");
  });

  it("keeps link addresses in the text it sends", () => {
    const el = compose(captured);
    el.querySelector("[g_editable]")!.innerHTML =
      '<div>See <a href="https://x.com/q4">the summary</a> or <a href="https://x.com">https://x.com</a>.</div>';
    expect(textToSend(el).body).toBe("See the summary (https://x.com/q4) or https://x.com.");
  });

  it("builds a Gmail compose link for Undo, with or without the body", () => {
    const draft = {
      to: ["a@x.com", "b@y.com"],
      cc: [],
      bcc: ["c@z.com"],
      subject: "Q4 & more",
      body: "Hi\nthere",
    };
    const url = new URL(composeUrl(draft, "1"));
    expect(url.pathname).toBe("/mail/u/1/");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      view: "cm",
      fs: "1",
      tf: "1",
      to: "a@x.com,b@y.com",
      bcc: "c@z.com",
      su: "Q4 & more",
      body: "Hi\nthere",
    });
    expect(composeUrl(draft, "1")).toContain("su=Q4%20%26%20more");
    expect(composeUrl(draft, "1")).not.toContain("+");
    expect(new URL(composeUrl(draft, "0", false)).searchParams.has("body")).toBe(false);
  });

  it("discards the draft with Gmail's own bin button", () => {
    const el = compose(captured);
    const pressed = vi.fn();
    el.querySelector('[data-tooltip^="Discard draft"]')!.addEventListener("mousedown", pressed);
    expect(discardDraft(el)).toBe(true);
    expect(pressed).toHaveBeenCalled();
    el.querySelector('[data-tooltip^="Discard draft"]')!.remove();
    expect(discardDraft(el)).toBe(false);
  });
});
