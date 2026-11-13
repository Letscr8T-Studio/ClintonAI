import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { outboxCopy } from "@/content/app/outbox";
import { safeSendCopy } from "@/content/app/safe-send";
import { popupOutboxCopy as copy } from "@/content/extension";
import type { PopupEmail } from "@/lib/validation/extension";
import { a11yViolations } from "@/test/a11y";
import type { OutboxReply } from "../outbox";
import { PopupOutbox } from "./PopupOutbox";

const ID = "11111111-1111-4111-8111-111111111111";
const inMinutes = (n: number) => new Date(Date.now() + n * 60_000).toISOString();
const waiting: PopupEmail = {
  id: ID,
  subject: "Q4 numbers",
  to: ["ada@example.com"],
  kind: "waiting",
  until: inMinutes(4),
  scheduled: false,
  safeSendMessageId: null,
};
const withdrawable: PopupEmail = {
  ...waiting,
  id: "22222222-2222-4222-8222-222222222222",
  subject: "Contract",
  kind: "withdrawable",
  until: inMinutes(23 * 60),
  safeSendMessageId: "33333333-3333-4333-8333-333333333333",
};

function setup(reply: OutboxReply, act = vi.fn(async () => true)) {
  const api = { load: vi.fn(async () => reply), act };
  const open = vi.fn();
  return { api, open, ...render(<PopupOutbox api={api} open={open} />) };
}

describe("popup Outbox", () => {
  it("shows what's waiting with a live countdown, and what can still be withdrawn", async () => {
    const { container } = setup({ kind: "ok", emails: [waiting, withdrawable] });
    const rows = await screen.findAllByRole("listitem");
    expect(rows[0]).toHaveTextContent(/Q4 numbers.*To ada@example\.com.*Leaves in 0[34]:\d\d/);
    expect(rows[1]).toHaveTextContent(/Contract.*2[23]h \d+m left to withdraw/);
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("Send now goes straight away; Cancel asks first", async () => {
    const { api } = setup({ kind: "ok", emails: [waiting] });
    const row = (await screen.findAllByRole("listitem"))[0];
    await userEvent.click(within(row).getByRole("button", { name: outboxCopy.sendNow }));
    expect(api.act).toHaveBeenCalledWith({ type: "send-now", id: ID });

    await userEvent.click(within(row).getByRole("button", { name: outboxCopy.cancel }));
    expect(api.act).toHaveBeenCalledTimes(1);
    expect(row).toHaveTextContent(outboxCopy.cancelConfirm);
    await userEvent.click(within(row).getByRole("button", { name: outboxCopy.cancelYes }));
    expect(api.act).toHaveBeenLastCalledWith({ type: "cancel", id: ID });
    expect(api.load).toHaveBeenCalledTimes(3); // opened, then after each action
  });

  it("withdraws a Safe Send for everyone, after confirming", async () => {
    const { api } = setup({ kind: "ok", emails: [withdrawable] });
    await userEvent.click(await screen.findByRole("button", { name: safeSendCopy.withdrawAll }));
    await userEvent.click(screen.getByRole("button", { name: safeSendCopy.withdrawYes }));
    expect(api.act).toHaveBeenCalledWith({ type: "withdraw", messageId: withdrawable.safeSendMessageId });
  });

  it("says so when an action didn't work, and when there's nothing to show", async () => {
    setup(
      { kind: "ok", emails: [waiting] },
      vi.fn(async () => false),
    );
    await userEvent.click(await screen.findByRole("button", { name: outboxCopy.sendNow }));
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.failed);

    document.body.innerHTML = "";
    const { open } = setup({ kind: "ok", emails: [] });
    expect(await screen.findByText(copy.empty)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: copy.openOutbox }));
    expect(open).toHaveBeenCalledWith("http://localhost:3000/outbox");
  });
});
