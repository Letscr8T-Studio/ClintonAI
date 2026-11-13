import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { panelCopy } from "@/content/app/compose";
import { composeBarCopy as copy, composeBarDevCopy as dev } from "@/content/extension";
import type { Finding } from "@/lib/check/types";
import type { CheckRequest } from "@/lib/validation/compose";
import { a11yViolations } from "@/test/a11y";
import type { AccountState } from "../account";
import type { CheckReply } from "../check";
import { findComposeWindows } from "../gmail/compose";
import newCompose from "../gmail/fixtures/compose-new.html?raw";
import { ComposeBar } from "./ComposeBar";
import * as edit from "../gmail/edit";

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

function setup(account: AccountState, reply: CheckReply = { kind: "ok", findings: [], modelUsed: true }) {
  const gmailPage = document.createElement("div");
  gmailPage.innerHTML = newCompose;
  document.body.append(gmailPage);
  const [compose] = findComposeWindows(gmailPage);
  const open = vi.fn();
  const requestCheck = vi.fn<(request: CheckRequest) => Promise<CheckReply>>(async () => reply);
  const view = render(
    <ComposeBar
      compose={compose}
      loadAccount={async () => account}
      requestCheck={requestCheck}
      open={open}
    />,
  );
  return { open, compose, requestCheck, ...view };
}
afterEach(() => {
  document.body.innerHTML = "";
});

describe("compose bar", () => {
  it("checks the email once the person pauses, and says when it's all good", async () => {
    const { requestCheck, container } = setup(ready);
    // A live status: screen readers announce its text, which carries the full sentence.
    expect(await screen.findByText(copy.allGoodLabel, {}, later)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(copy.allGoodLabel);
    expect(requestCheck).toHaveBeenCalledTimes(1);
    expect(requestCheck.mock.calls[0][0]).toMatchObject({
      to: ["ada@example.com", "bola@example.com"],
      subject: "Q4 numbers",
    });
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("lists what it found; Fix it changes Gmail's text and settles the finding", async () => {
    const replace = vi.spyOn(edit, "replaceRange").mockReturnValue(true);
    const { container } = setup(ready, { kind: "ok", findings: [thanks], modelUsed: true });
    await userEvent.click(await screen.findByRole("button", { name: copy.toCheck(1) }, later));
    expect(screen.getByRole("region", { name: copy.panelLabel })).toHaveTextContent(thanks.message);
    expect(await a11yViolations(container)).toEqual([]);

    await userEvent.click(screen.getByRole("button", { name: panelCopy.fix }));
    expect(replace).toHaveBeenCalledWith(expect.objectContaining({ collapsed: false }), "Thank you");
    expect(String(replace.mock.calls[0][0])).toBe("Thanks");

    // Fixed: dealt with, even though "Thanks" may still appear elsewhere.
    await waitFor(() => expect(screen.queryByRole("region", { name: copy.panelLabel })).toBeNull());
    expect(screen.queryByRole("button", { name: copy.toCheck(1) })).toBeNull();
  });

  it("Ignore settles a finding without changing the email", async () => {
    const replace = vi.spyOn(edit, "replaceRange");
    setup(ready, { kind: "ok", findings: [thanks], modelUsed: true });
    await userEvent.click(await screen.findByRole("button", { name: copy.toCheck(1) }, later));
    await userEvent.click(screen.getByRole("button", { name: panelCopy.ignore }));
    await waitFor(() => expect(screen.queryByRole("region", { name: copy.panelLabel })).toBeNull());
    expect(replace).not.toHaveBeenCalled();
  });

  it("falls back to the in-browser rules when the check can't be reached", async () => {
    setup(ready, { kind: "failed" });
    // The fixture says "find the report attached" with no file: the attachment rule catches it.
    await userEvent.click(await screen.findByRole("button", { name: /to check/ }, later));
    expect(screen.getByText(panelCopy.errorBody)).toBeInTheDocument();
  });

  it("doesn't check for signed-out people: it sends them to sign in", async () => {
    const { open, requestCheck } = setup({ kind: "signed-out" });
    await userEvent.click(await screen.findByRole("button", { name: copy.signIn }));
    expect(open).toHaveBeenCalledWith("http://localhost:3000/login");
    await new Promise((r) => setTimeout(r, 1700));
    expect(requestCheck).not.toHaveBeenCalled();
  });

  it("dev builds show what was read, and update as the person types", async () => {
    const { compose } = setup(ready);
    await userEvent.click(screen.getByRole("button", { name: dev.toggle }));
    const panel = screen.getByRole("region", { name: dev.heading });
    expect(panel).toHaveTextContent("ada@example.com, bola@example.com");
    compose.querySelector<HTMLInputElement>('input[name="subjectbox"]')!.value = "Q4, final";
    compose.dispatchEvent(new Event("input", { bubbles: true }));
    expect(await screen.findByText("Q4, final")).toBeInTheDocument();
  });
});
