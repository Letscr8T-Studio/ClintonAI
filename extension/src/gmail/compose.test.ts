import { afterEach, describe, expect, it } from "vitest";
import { captureStructure } from "./capture";
import { findComposeWindows, readCompose } from "./compose";
import newCompose from "./fixtures/compose-new.html?raw";
import inlineReply from "./fixtures/reply-inline.html?raw";
import { addressesIn } from "./recipients";

function page(...fixtures: string[]) {
  document.body.innerHTML = fixtures.join("");
  return document.body;
}
afterEach(() => {
  document.body.innerHTML = "";
});

describe("finding compose windows", () => {
  it("finds a new email and an inline reply, each once, even in another language", () => {
    const windows = findComposeWindows(page(newCompose, inlineReply));
    expect(windows).toHaveLength(2);
    // The tightest box holding the editor and Send: inside the pop-up, and the reply box only.
    expect(windows[0].closest('[role="dialog"]')).not.toBeNull();
    expect(windows[1].classList.contains("M9")).toBe(true);
  });

  it("ignores editors without a Send button and pages without compose windows", () => {
    page('<div contenteditable="true" g_editable="true"></div><p>Inbox</p>');
    expect(findComposeWindows(document.body)).toEqual([]);
  });
});

describe("reading a new email", () => {
  const draft = () => readCompose(findComposeWindows(page(newCompose))[0]);

  it("reads recipients from their chips, lower-cased", () => {
    expect(draft()).toMatchObject({
      to: ["ada@example.com", "bola@example.com"],
      cc: ["chidi@example.org"],
      bcc: [],
      subject: "Q4 numbers",
    });
  });

  it("reads the body as the lines the person sees, apart from the signature", () => {
    const { body, signature, quoted } = draft();
    expect(body).toBe(
      "Hi Ada,\n\nPlease find the report attached.  See the summary.\n• Revenue up\n• Costs flat\n\nThanks",
    );
    expect(signature).toBe("Preye\nClinton AI");
    expect(quoted).toBe(false);
  });

  it("notices what plain text would lose", () => {
    expect(draft().rich).toEqual({ links: true, images: false, formatting: true });
    expect(draft().gmailAttachments).toBe(0);
  });
});

describe("reading an inline reply", () => {
  const draft = () => readCompose(findComposeWindows(page(inlineReply))[0]);

  it("reads Gmail's hidden recipient fields, names and all", () => {
    expect(draft()).toMatchObject({
      to: ["bola@example.com", "ops@example.com"],
      cc: [],
      bcc: ["audit@example.com"],
      subject: "Re: Contract",
    });
  });

  it("reads only what the person wrote: no quoted message, no conversation above", () => {
    const { body, quoted, gmailAttachments } = draft();
    expect(body).toBe("Sounds good, signing today.");
    expect(body).not.toMatch(/sign the contract|must not read/);
    expect(quoted).toBe(true);
    expect(gmailAttachments).toBe(1);
  });
});

describe("addressesIn", () => {
  it("pulls valid addresses out of display text", () => {
    expect(addressesIn('"Ade, Bola" <Bola@X.com>; c@y.org, not-an-address')).toEqual([
      "bola@x.com",
      "c@y.org",
    ]);
  });
});

describe("captureStructure (dev builds)", () => {
  it("keeps the structure the selectors need and nothing personal", () => {
    const outline = captureStructure(findComposeWindows(page(newCompose, inlineReply))[1]);
    expect(outline).toContain('g_editable="true"');
    expect(outline).toContain('name="to"');
    expect(outline).toContain("[text]");
    for (const secret of ["bola@example.com", "Bola Ade", "Sounds good", "Contract", "sign the contract"])
      expect(outline).not.toContain(secret);
    const chips = captureStructure(findComposeWindows(page(newCompose))[0]);
    expect(chips).toContain('data-hovercard-id="person@example.com"');
    expect(chips).not.toMatch(/Ada|Lovelace|Q4|ada@example/);
  });
});
