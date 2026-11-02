import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeCopy, findingLabels, panelCopy, sentToastCopy } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { a11yViolations } from "@/test/a11y";
import { ComposeWorkspace } from "./ComposeWorkspace";

// Compose after the check: highlights in the text, and the Undo bar after sending.

const typo: Finding = {
  id: "model-0-spelling",
  source: "model",
  type: "spelling",
  field: "body",
  message: "“mizz” looks like a typo.",
  excerpt: "mizz",
  suggestion: "miss",
};
const EMAIL_ID = "00000000-0000-4000-8000-0000000000aa";
const inFiveMinutes = () => new Date(Date.now() + 300_000).toISOString();

function mockApi(findings: Finding[]) {
  const fetchMock = vi.fn<typeof fetch>(async (url) => {
    if (url === "/api/check") return new Response(JSON.stringify({ ok: true, findings, modelUsed: true }));
    if (url === "/api/emails")
      return new Response(JSON.stringify({ ok: true, id: EMAIL_ID, sendAt: inFiveMinutes() }));
    const draft = { to: ["dami@x.co"], cc: [], subject: "Offer", body: "I miss you." };
    return new Response(JSON.stringify({ ok: true, draft }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function writeAndCheck(body: string) {
  render(<ComposeWorkspace fromEmail="ada@example.com" defaultDelaySeconds={300} />);
  await userEvent.type(screen.getByLabelText(composeCopy.to), "dami@x.co");
  await userEvent.type(screen.getByLabelText(composeCopy.subject), "Offer");
  await userEvent.type(screen.getByLabelText(composeCopy.body), body);
  await userEvent.click(screen.getByRole("button", { name: composeCopy.submit }));
}

/** Puts the caret at `index` in the message, as a tap or arrow key would. */
function caretAt(index: number) {
  const body = screen.getByLabelText(composeCopy.body) as HTMLTextAreaElement;
  body.focus();
  body.setSelectionRange(index, index);
  fireEvent.select(body);
  return body;
}

afterEach(() => vi.unstubAllGlobals());

describe("Compose: Clinton's notes in the text", () => {
  it("highlights the flagged words and, with the caret on them, offers the fix in place", async () => {
    mockApi([typo]);
    await writeAndCheck("I mizz you.");
    await screen.findByText(panelCopy.inlineHint);
    expect(document.querySelector("mark.cl-flag")?.textContent).toBe("mizz");

    caretAt(3);
    const note = await screen.findByRole("group", { name: panelCopy.inlineLabel(findingLabels.spelling) });
    expect(await a11yViolations(note)).toEqual([]);
    const fixButtons = screen.getAllByRole("button", { name: panelCopy.fix });
    await userEvent.click(fixButtons.find((b) => note.contains(b))!);

    const body = screen.getByLabelText(composeCopy.body) as HTMLTextAreaElement;
    expect(body.value).toBe("I miss you.");
    expect(document.querySelector("mark.cl-flag")).toBeNull();
  });

  it("closes the note with Esc, and Ignore drops the highlight", async () => {
    mockApi([{ ...typo, suggestion: undefined }]);
    await writeAndCheck("I mizz you.");
    await screen.findByText(panelCopy.inlineHint);
    const body = caretAt(4);
    const name = panelCopy.inlineLabel(findingLabels.spelling);
    await screen.findByRole("group", { name });
    fireEvent.keyDown(body, { key: "Escape" });
    expect(screen.queryByRole("group", { name })).toBeNull();

    caretAt(3); // React reports a selection only when it moves
    const note = await screen.findByRole("group", { name });
    const ignore = screen.getAllByRole("button", { name: panelCopy.ignore }).find((b) => note.contains(b))!;
    await userEvent.click(ignore);
    expect(document.querySelector("mark.cl-flag")).toBeNull();
  });
});

describe("Compose: the Undo bar", () => {
  it("stays in Compose after sending, clears the form, and Undo brings the email back", async () => {
    const fetchMock = mockApi([]);
    await writeAndCheck("I miss you.");
    const bar = await screen.findByRole("region", { name: sentToastCopy.label });
    expect(bar).toHaveFocus(); // one Tab from Undo
    expect(screen.getByLabelText(composeCopy.body)).toHaveValue("");
    expect(screen.getByRole("link", { name: sentToastCopy.viewLabel })).toHaveAttribute("href", "/outbox");
    expect(await a11yViolations(bar)).toEqual([]);

    await userEvent.click(screen.getByRole("button", { name: sentToastCopy.undo }));
    await waitFor(() => expect(screen.getByLabelText(composeCopy.body)).toHaveValue("I miss you."));
    expect(fetchMock).toHaveBeenLastCalledWith(`/api/emails/${EMAIL_ID}/edit`, { method: "POST" });
    expect(screen.queryByRole("region", { name: sentToastCopy.label })).toBeNull();
  });

  it("has no Undo when Smart Delay is off (the email has already left)", async () => {
    mockApi([]);
    render(<ComposeWorkspace fromEmail="ada@example.com" defaultDelaySeconds={0} />);
    await userEvent.type(screen.getByLabelText(composeCopy.to), "dami@x.co");
    await userEvent.type(screen.getByLabelText(composeCopy.body), "Hello");
    await userEvent.click(screen.getByRole("button", { name: composeCopy.submit }));
    await screen.findByRole("region", { name: sentToastCopy.label });
    expect(screen.getByText(sentToastCopy.sent)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: sentToastCopy.undo })).toBeNull();
  });
});
