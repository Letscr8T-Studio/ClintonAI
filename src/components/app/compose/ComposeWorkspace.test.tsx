import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeCopy, panelCopy } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { a11yViolations } from "@/test/a11y";
import { ComposeWorkspace } from "./ComposeWorkspace";

const finding: Finding = {
  id: "rule-0-greeting_mismatch",
  source: "rules",
  type: "greeting_mismatch",
  field: "body",
  message: "You wrote “Tunde”, but this is going to dami@brightlane.io.",
  excerpt: "Tunde",
};

function mockCheck(response: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(response), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function write(to: string, body: string) {
  await userEvent.type(screen.getByLabelText(composeCopy.to), to);
  await userEvent.type(screen.getByLabelText(composeCopy.subject), "Offer");
  await userEvent.type(screen.getByLabelText(composeCopy.body), body);
}
const submit = () => userEvent.click(screen.getByRole("button", { name: composeCopy.submit }));

afterEach(() => vi.unstubAllGlobals());

describe("ComposeWorkspace", () => {
  it("shows Clinton ready, and is accessible", async () => {
    const { container } = render(<ComposeWorkspace fromEmail="ada@example.com" />);
    expect(screen.getByText(panelCopy.idleTitle)).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("validates before checking", async () => {
    const fetchMock = mockCheck({ ok: true, findings: [], modelUsed: true });
    render(<ComposeWorkspace fromEmail="ada@example.com" />);
    await userEvent.type(screen.getByLabelText(composeCopy.to), "dami@x.co, not-an-email");
    await submit();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText(composeCopy.to)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(composeCopy.invalidAddresses("not-an-email"))).toBeInTheDocument();
    expect(screen.getByText(composeCopy.needBody)).toBeInTheDocument();
  });

  it("sends the draft and shows what Clinton caught; Show me selects the words", async () => {
    const fetchMock = mockCheck({ ok: true, findings: [finding], modelUsed: true });
    const { container } = render(<ComposeWorkspace fromEmail="ada@example.com" />);
    await write("dami@brightlane.io", "Hi Tunde, welcome.");
    await submit();

    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body as string)).toEqual({
      to: ["dami@brightlane.io"],
      cc: [],
      subject: "Offer",
      body: "Hi Tunde, welcome.",
      attachments: [],
    });
    expect(await screen.findByText(panelCopy.caught(1))).toBeInTheDocument();
    expect(screen.getByText(finding.message)).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);

    await userEvent.click(screen.getByRole("button", { name: panelCopy.show }));
    const body = screen.getByLabelText(composeCopy.body) as HTMLTextAreaElement;
    expect(body).toHaveFocus();
    expect(body.value.slice(body.selectionStart, body.selectionEnd)).toBe("Tunde");
    expect(screen.getByText(panelCopy.readyTitle)).toBeInTheDocument();
  });

  it("previews a suggested fix and applies it only when the user taps Fix it", async () => {
    mockCheck({ ok: true, findings: [{ ...finding, suggestion: "Dami" }], modelUsed: true });
    const { container } = render(<ComposeWorkspace fromEmail="ada@example.com" />);
    await write("dami@brightlane.io", "Hi Tunde, welcome.");
    await submit();

    const body = screen.getByLabelText(composeCopy.body) as HTMLTextAreaElement;
    expect(await screen.findByText("Dami")).toBeInTheDocument(); // the "after" in the preview
    expect(body.value).toBe("Hi Tunde, welcome."); // nothing changes until the user decides
    expect(await a11yViolations(container)).toEqual([]);

    await userEvent.click(screen.getByRole("button", { name: panelCopy.fix }));
    expect(body.value).toBe("Hi Dami, welcome.");
    await waitFor(() => expect(body.value.slice(body.selectionStart, body.selectionEnd)).toBe("Dami"));
    // Applying Clinton's own fix is not a user edit, so the result is not marked stale.
    expect(screen.queryByText(panelCopy.stale)).not.toBeInTheDocument();
  });

  it("fills an empty subject with Clinton's suggestion when the user taps Fix it", async () => {
    const subjectFinding: Finding = {
      id: "rule-0-empty_subject",
      source: "rules",
      type: "empty_subject",
      field: "subject",
      message: "There's no subject. Emails without one are easy to miss.",
      suggestion: "Your offer from Brightlane",
    };
    mockCheck({ ok: true, findings: [subjectFinding], modelUsed: true });
    render(<ComposeWorkspace fromEmail="ada@example.com" />);
    await userEvent.type(screen.getByLabelText(composeCopy.to), "dami@brightlane.io");
    await userEvent.type(screen.getByLabelText(composeCopy.body), "Hi Dami, welcome aboard.");
    await submit();

    expect(await screen.findByText(panelCopy.suggested)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: panelCopy.fix }));
    const subject = screen.getByLabelText(composeCopy.subject) as HTMLInputElement;
    expect(subject.value).toBe("Your offer from Brightlane");
    await waitFor(() => expect(subject).toHaveFocus());
  });

  it("lets the user send anyway (advise, never block)", async () => {
    mockCheck({ ok: true, findings: [finding], modelUsed: true });
    render(<ComposeWorkspace fromEmail="ada@example.com" />);
    await write("dami@brightlane.io", "Hi Tunde, welcome.");
    await submit();
    await userEvent.click(await screen.findByRole("button", { name: panelCopy.sendAnyway }));
    expect(screen.getByText(panelCopy.readyTitle)).toBeInTheDocument();
  });

  it("goes straight to ready when nothing is found, and notices later edits", async () => {
    mockCheck({ ok: true, findings: [], modelUsed: true });
    render(<ComposeWorkspace fromEmail="ada@example.com" />);
    await write("dami@brightlane.io", "Hi Dami, welcome.");
    await submit();
    expect(await screen.findByText(panelCopy.readyBody)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(composeCopy.body), " More.");
    expect(screen.getByText(panelCopy.stale)).toBeInTheDocument();
  });

  it("falls back to the in-browser rules when the check can't be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("offline"))),
    );
    render(<ComposeWorkspace fromEmail="ada@example.com" />);
    await write("dami@brightlane.io", "Hi Tunde, I've attached it.");
    await submit();
    await waitFor(() => expect(screen.getByText(panelCopy.errorBody)).toBeInTheDocument());
    expect(screen.getByText("You mention an attachment, but nothing is attached.")).toBeInTheDocument();
  });
});
