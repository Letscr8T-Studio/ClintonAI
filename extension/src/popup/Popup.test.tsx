import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { extensionPopupCopy as copy } from "@/content/extension";
import { a11yViolations } from "@/test/a11y";
import type { AccountState } from "../account";
import { Popup } from "./Popup";

const ready = (gmail: { email: string; status: "active" | "revoked" } | null): AccountState => ({
  kind: "ready",
  me: { ok: true, email: "ada@example.com", name: "Ada", gmail, defaultDelaySeconds: 120 },
});

function setup(...states: AccountState[]) {
  const load = vi.fn<() => Promise<AccountState>>();
  states.forEach((s) => load.mockResolvedValueOnce(s));
  const open = vi.fn();
  const outbox = {
    load: vi.fn(async () => ({ kind: "ok" as const, emails: [] })),
    act: vi.fn(async () => true),
  };
  return { load, open, outbox, ...render(<Popup load={load} open={open} outbox={outbox} />) };
}

describe("extension popup", () => {
  it("sends signed-out people to sign in on the site", async () => {
    const { open } = setup({ kind: "signed-out" });
    expect(screen.getByRole("status")).toHaveTextContent(copy.loading);
    await userEvent.click(await screen.findByRole("button", { name: copy.signedOut.button }));
    expect(open).toHaveBeenCalledWith("http://localhost:3000/login");
  });

  it("asks for Gmail when it's missing, and to reconnect when it's revoked", async () => {
    const { open, unmount } = setup(ready(null));
    await userEvent.click(await screen.findByRole("button", { name: copy.noGmail.button }));
    expect(open).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    unmount();
    setup(ready({ email: "ada@gmail.com", status: "revoked" }));
    expect(await screen.findByRole("heading", { name: copy.revoked.title })).toBeInTheDocument();
  });

  it("shows who is signed in and the sending address, and opens Gmail", async () => {
    const { open, container } = setup(ready({ email: "ada@gmail.com", status: "active" }));
    expect(await screen.findByText("ada@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText(copy.ready.delay(2))).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: copy.ready.openGmail }));
    expect(open).toHaveBeenCalledWith("https://mail.google.com/");
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("offers Try again when the site can't be reached, and loads again", async () => {
    const { load, container } = setup({ kind: "offline" }, { kind: "signed-out" });
    await userEvent.click(await screen.findByRole("button", { name: copy.offline.button }));
    expect(await screen.findByRole("button", { name: copy.signedOut.button })).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    expect(await a11yViolations(container)).toEqual([]);
  });
});
