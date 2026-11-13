import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { extensionSendCopy } from "@/content/extension-send";
import { a11yViolations } from "@/test/a11y";
import { SentNote } from "./SentNote";
import type { Sent } from "./useClintonSend";

const copy = extensionSendCopy.sent;
const sent: Sent = {
  id: "e1",
  sendAt: new Date(Date.now() + 5 * 60_000).toISOString(),
  scheduled: false,
  safeSend: false,
  immediate: false,
  reopen: { to: ["ada@example.com"], cc: [], bcc: [], subject: "Hi", body: "Hello" },
  discarded: true,
};

function setup(over: Partial<Sent> = {}, back = true) {
  const takeBack = vi.fn(async () => back);
  const open = vi.fn();
  const popup = { location: { href: "" }, close: vi.fn() };
  vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
  const view = render(
    <SentNote sent={{ ...sent, ...over }} takeBack={takeBack} open={open} onDismiss={vi.fn()} />,
  );
  return { takeBack, open, popup, ...view };
}

describe("the note after sending", () => {
  it("says when it leaves; Undo takes it back and reopens it in Gmail", async () => {
    const { takeBack, popup, container } = setup();
    expect(screen.getByRole("status")).toHaveTextContent(/In your Outbox\. It leaves Today/);
    expect(await a11yViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: copy.undo }));
    expect(takeBack).toHaveBeenCalledWith("e1");
    expect(popup.location.href).toMatch(
      /^https:\/\/mail\.google\.com\/mail\/u\/0\/\?view=cm.*su=Hi.*body=Hello/,
    );
    expect(await screen.findByText(copy.undone)).toBeInTheDocument();
  });

  it("says when it's too late, and closes the window it opened", async () => {
    const { popup } = setup({}, false);
    await userEvent.click(screen.getByRole("button", { name: copy.undo }));
    expect(await screen.findByText(copy.tooLate)).toBeInTheDocument();
    expect(popup.close).toHaveBeenCalled();
  });

  it("offers no Undo once it has left, and warns when Gmail kept the draft", () => {
    setup({ immediate: true, discarded: false });
    expect(screen.queryByRole("button", { name: copy.undo })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(copy.now);
    expect(screen.getByRole("status")).toHaveTextContent(copy.draftKept);
  });

  it("mentions Safe Send and the scheduled time", () => {
    setup({ scheduled: true, safeSend: true });
    expect(screen.getByRole("status")).toHaveTextContent(/Scheduled: it leaves .*withdraw it for 24 hours/);
  });
});
