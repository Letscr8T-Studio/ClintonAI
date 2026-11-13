import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { panelCopy } from "@/content/app/compose";
import { composeBarCopy as copy, composeBarDevCopy as dev } from "@/content/extension";
import { extensionSendCopy as send } from "@/content/extension-send";
import type { Finding } from "@/lib/check/types";
import { a11yViolations } from "@/test/a11y";
import type { AccountState } from "../account";
import type { CheckReply } from "../check";
import { findComposeWindows } from "../gmail/compose";
import * as edit from "../gmail/edit";
import newCompose from "../gmail/fixtures/compose-new.html?raw";
import inlineReply from "../gmail/fixtures/reply-inline.html?raw";
import type { QueueReply, QueueRequest } from "../send";
import type { ExtensionApi } from "./api";
import { ComposeBar } from "./ComposeBar";

const ready: AccountState = {
  kind: "ready",
  me: {
    ok: true,
    email: "ada@example.com",
    name: "Ada",
    gmail: { email: "ada@gmail.com", status: "active" },
    defaultDelaySeconds: 300,
  },
};
const thanks: Finding = {
  id: "m1",
  source: "model",
  type: "spelling",
  field: "body",
  message: "Did you mean “Thank you”?",
  excerpt: "Thanks",
  suggestion: "Thank you",
};
const later = { timeout: 4000 };
const clean: CheckReply = { kind: "ok", findings: [], modelUsed: true, checkId: null };

function setup(account: AccountState, reply = clean, fixture = newCompose, queued?: QueueReply) {
  const gmailPage = document.createElement("div");
  gmailPage.innerHTML = fixture;
  document.body.append(gmailPage);
  const [compose] = findComposeWindows(gmailPage);
  const api = {
    loadAccount: async () => account,
    requestCheck: vi.fn<ExtensionApi["requestCheck"]>(async () => reply),
    queue: vi.fn<(r: QueueRequest) => Promise<QueueReply>>(
      async () => queued ?? { kind: "ok", id: "e1", sendAt: new Date().toISOString() },
    ),
    takeBack: vi.fn(async () => true),
  };
  const open = vi.fn();
  const onSent = vi.fn();
  const view = render(<ComposeBar compose={compose} api={api} open={open} onSent={onSent} />);
  return { api, open, onSent, compose, ...view };
}
const openPanel = async (name: string) => userEvent.click(await screen.findByRole("button", { name }, later));
afterEach(() => {
  document.body.innerHTML = "";
  document.title = "";
});

describe("compose bar: the check", () => {
  it("checks the email once the person pauses, and says when it's all good", async () => {
    const { api, container } = setup(ready);
    await openPanel(copy.allGoodLabel);
    expect(api.requestCheck).toHaveBeenCalledTimes(1);
    expect(api.requestCheck.mock.calls[0][0]).toMatchObject({ to: ["ada@example.com", "bola@example.com"] });
    expect(screen.getByText(send.allGood)).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("Fix it changes Gmail's text and settles the finding; Ignore settles without a change", async () => {
    const replace = vi.spyOn(edit, "replaceRange").mockReturnValue(true);
    setup(ready, { ...clean, findings: [thanks] });
    await openPanel(copy.toCheck(1));
    await userEvent.click(screen.getByRole("button", { name: panelCopy.fix }));
    expect(String(replace.mock.calls[0][0])).toBe("Thanks");
    expect(replace.mock.calls[0][1]).toBe("Thank you");
    await waitFor(() => expect(screen.queryByText(thanks.message)).toBeNull());

    document.body.innerHTML = "";
    setup(ready, { ...clean, findings: [{ ...thanks, id: "m2" }] });
    await openPanel(copy.toCheck(1));
    replace.mockClear();
    await userEvent.click(screen.getByRole("button", { name: panelCopy.ignore }));
    await waitFor(() => expect(screen.queryByText(thanks.message)).toBeNull());
    expect(replace).not.toHaveBeenCalled();
  });

  it("falls back to the in-browser rules when the check can't be reached", async () => {
    setup(ready, { kind: "failed" });
    await openPanel(copy.toCheck(1)); // "find the report attached", with nothing attached
    expect(screen.getByText(panelCopy.errorBody)).toBeInTheDocument();
  });

  it("doesn't check for signed-out people: it sends them to sign in", async () => {
    const { api, open } = setup({ kind: "signed-out" });
    await openPanel(copy.signIn);
    expect(open).toHaveBeenCalledWith("http://localhost:3000/login");
    await new Promise((r) => setTimeout(r, 1700));
    expect(api.requestCheck).not.toHaveBeenCalled();
  });
});

describe("compose bar: Send with Clinton AI", () => {
  it("sends what's written, signature and link addresses included", async () => {
    const { api, onSent, container } = setup(ready);
    await openPanel(copy.allGoodLabel);
    expect(screen.getByText(send.plainText)).toBeInTheDocument(); // the fixture has bold and a list
    await userEvent.click(screen.getByRole("switch", { name: "Safe Send" }));
    expect(await a11yViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: send.button }));

    const request = api.queue.mock.calls[0][0];
    expect(request).toMatchObject({ to: ["ada@example.com", "bola@example.com"], cc: ["chidi@example.org"] });
    expect(request).toMatchObject({ subject: "Q4 numbers", safeSend: true, trackOpens: false });
    expect(request.body).toContain("See the summary (https://example.com/q4).");
    expect(request.body.endsWith("Thanks\n\nPreye\nClinton AI")).toBe(true);
    expect(request.sendAt).toBeUndefined(); // the Smart Delay
    expect(onSent).toHaveBeenCalledWith(
      expect.objectContaining({ id: "e1", safeSend: true, scheduled: false, discarded: false }),
    );
    expect(onSent.mock.calls[0][0].reopen.body).not.toContain("Preye\nClinton AI");
  });

  it("shows the site's error and keeps the email in Gmail", async () => {
    const { onSent } = setup(ready, clean, newCompose, { kind: "error", error: "Connect Gmail first." });
    await openPanel(copy.allGoodLabel);
    await userEvent.click(screen.getByRole("button", { name: send.button }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Connect Gmail first.");
    expect(onSent).not.toHaveBeenCalled();
  });

  it("leaves replies to Gmail's Send, and refuses a Gmail tab that isn't the connected account", async () => {
    setup(ready, clean, inlineReply);
    await openPanel(copy.allGoodLabel);
    expect(screen.getByText(send.blocked.reply)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: send.button })).toBeNull();

    document.body.innerHTML = "";
    document.title = "Inbox (2) - work@company.com - Gmail";
    setup(ready);
    await openPanel(copy.allGoodLabel);
    expect(
      screen.getByText(send.blocked.otherAccount("work@company.com", "ada@gmail.com")),
    ).toBeInTheDocument();
  });

  it("dev builds show what was read", async () => {
    setup(ready);
    await userEvent.click(screen.getByRole("button", { name: dev.toggle }));
    expect(screen.getByRole("region", { name: dev.heading })).toHaveTextContent(
      "ada@example.com, bola@example.com",
    );
  });
});
