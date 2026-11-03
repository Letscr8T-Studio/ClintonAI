import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeCopy, sentToastCopy } from "@/content/app/compose";
import {
  attachCopy,
  recipientsCopy,
  rewriteCopy,
  scheduleCopy,
  trackCopy,
} from "@/content/app/compose-options";
import { a11yViolations } from "@/test/a11y";
import { ComposeWorkspace } from "./ComposeWorkspace";

// Compose's extras: Bcc, attachments, Send later, Likely opened, Rewrite with Clinton.

const PATH = "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222";

function mockApi(rewritten = "Hi Dami, I miss you.") {
  const fetchMock = vi.fn<typeof fetch>(async (url) => {
    const json = (body: object) => new Response(JSON.stringify(body));
    if (url === "/api/check") return json({ ok: true, findings: [], modelUsed: true });
    if (url === "/api/rewrite") return json({ ok: true, text: rewritten });
    if (url === "/api/attachments") return json({ ok: true, path: PATH, url: "https://storage.test/sign/x" });
    if (String(url).startsWith("https://storage.test")) return new Response("{}", { status: 200 });
    return json({ ok: true, id: "e1", sendAt: new Date(Date.now() + 86_400_000).toISOString() });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
const queued = (fetchMock: ReturnType<typeof mockApi>) =>
  JSON.parse(fetchMock.mock.calls.find(([u]) => u === "/api/emails")![1]!.body as string);

async function write(body = "hi dami i mizz u") {
  render(<ComposeWorkspace fromEmail="ada@example.com" defaultDelaySeconds={300} />);
  await userEvent.type(screen.getByLabelText(composeCopy.to), "dami@x.co");
  await userEvent.type(screen.getByLabelText(composeCopy.body), body);
}
const send = (name: string | RegExp = composeCopy.submit) =>
  userEvent.click(screen.getByRole("button", { name }));

afterEach(() => vi.unstubAllGlobals());

describe("Compose options", () => {
  it("adds Bcc on request and sends it, hidden from the model", async () => {
    const fetchMock = mockApi();
    await write();
    await userEvent.click(screen.getByRole("button", { name: recipientsCopy.addBccLabel }));
    await userEvent.type(screen.getByLabelText(recipientsCopy.bcc), "boss@me.co");
    await send();
    await screen.findByRole("region", { name: sentToastCopy.label });
    expect(queued(fetchMock).bcc).toEqual(["boss@me.co"]);
  });

  it("uploads an attached file straight to storage and sends it with the email", async () => {
    const fetchMock = mockApi();
    await write("Deck attached.");
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(input, {
      target: { files: [new File(["%PDF"], "deck.pdf", { type: "application/pdf" })] },
    });
    const list = await screen.findByRole("list", { name: attachCopy.listLabel });
    await waitFor(() => expect(list).not.toHaveTextContent(attachCopy.uploading));
    expect(await a11yViolations(list)).toEqual([]);
    expect(
      fetchMock.mock.calls.some(
        ([u, init]) => String(u).startsWith("https://storage.test") && init?.method === "PUT",
      ),
    ).toBe(true);

    await send();
    await screen.findByRole("region", { name: sentToastCopy.label });
    expect(queued(fetchMock).attachments).toEqual([
      { path: PATH, name: "deck.pdf", size: 4, type: "application/pdf" },
    ]);
    // The check knows something is attached, so "Deck attached." isn't flagged.
    expect(
      JSON.parse(fetchMock.mock.calls.find(([u]) => u === "/api/check")![1]!.body as string).attachments,
    ).toEqual(["deck.pdf"]);
  });

  it("schedules for a picked time: the button says so and the email goes with that time", async () => {
    const fetchMock = mockApi();
    await write();
    await userEvent.click(screen.getByRole("button", { name: scheduleCopy.button }));
    await userEvent.click(screen.getByRole("button", { name: new RegExp(scheduleCopy.tomorrowMorning) }));
    expect(screen.getByText(/^Sends Tomorrow/)).toBeInTheDocument();
    await send(scheduleCopy.submit);
    await screen.findByText(/^Scheduled:/);
    const sendAt = new Date(queued(fetchMock).sendAt);
    expect(sendAt.getHours()).toBe(8);
    expect(sendAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("Likely opened is off by default, can be turned on per email, and never goes with Safe Send", async () => {
    const fetchMock = mockApi();
    await write();
    const track = screen.getByRole("switch", { name: trackCopy.toggle });
    expect(track).toHaveAttribute("aria-checked", "false");
    await userEvent.click(track);
    expect(track).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("switch", { name: /Safe Send/ }));
    expect(track).toBeDisabled();
    expect(track).toHaveAttribute("aria-checked", "false");
    await userEvent.click(screen.getByRole("switch", { name: /Safe Send/ }));
    await send();
    await screen.findByRole("region", { name: sentToastCopy.label });
    expect(queued(fetchMock).trackOpens).toBe(true);
  });

  it("rewrites the message on request, and Undo brings the user's own words back", async () => {
    mockApi();
    await write();
    await userEvent.click(screen.getByRole("button", { name: rewriteCopy.button }));
    await userEvent.click(screen.getByRole("button", { name: new RegExp(rewriteCopy.modes.fix.label) }));
    const body = screen.getByLabelText(composeCopy.body);
    await waitFor(() => expect(body).toHaveValue("Hi Dami, I miss you."));
    expect(screen.getByText(rewriteCopy.done(rewriteCopy.modes.fix.label))).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: rewriteCopy.undo }));
    expect(body).toHaveValue("hi dami i mizz u");
  });
});
