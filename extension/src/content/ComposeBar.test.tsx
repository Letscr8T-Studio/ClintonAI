import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeBarCopy as copy, composeBarDevCopy as dev } from "@/content/extension";
import { a11yViolations } from "@/test/a11y";
import type { AccountState } from "../account";
import { findComposeWindows } from "../gmail/compose";
import newCompose from "../gmail/fixtures/compose-new.html?raw";
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

function setup(account: AccountState) {
  const gmailPage = document.createElement("div");
  gmailPage.innerHTML = newCompose;
  document.body.append(gmailPage);
  const [compose] = findComposeWindows(gmailPage);
  const open = vi.fn();
  const view = render(<ComposeBar compose={compose} loadAccount={async () => account} open={open} />);
  return { open, compose, ...view };
}
afterEach(() => {
  document.body.innerHTML = "";
});

describe("compose bar", () => {
  it("says Clinton AI is on, and is accessible", async () => {
    const { container } = setup(ready);
    expect(await screen.findByRole("status")).toHaveTextContent(copy.ready);
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("sends signed-out people to sign in, and people without Gmail to connect it", async () => {
    const { open, unmount } = setup({ kind: "signed-out" });
    await userEvent.click(await screen.findByRole("button", { name: copy.signIn }));
    expect(open).toHaveBeenCalledWith("http://localhost:3000/login");
    unmount();
    document.body.innerHTML = "";
    const noGmail = setup({ kind: "ready", me: { ...ready.me, gmail: null } } as AccountState);
    await userEvent.click(await screen.findByRole("button", { name: copy.connectGmail }));
    expect(noGmail.open).toHaveBeenCalledWith("http://localhost:3000/dashboard");
  });

  it("dev builds show what was read, and update as the person types", async () => {
    const { compose } = setup(ready);
    await userEvent.click(screen.getByRole("button", { name: dev.toggle }));
    const panel = screen.getByRole("region", { name: dev.heading });
    expect(panel).toHaveTextContent("ada@example.com, bola@example.com");
    expect(panel).toHaveTextContent("Q4 numbers");

    compose.querySelector<HTMLInputElement>('input[name="subjectbox"]')!.value = "Q4, final";
    compose.dispatchEvent(new Event("input", { bubbles: true }));
    expect(await screen.findByText("Q4, final")).toBeInTheDocument();
  });
});
