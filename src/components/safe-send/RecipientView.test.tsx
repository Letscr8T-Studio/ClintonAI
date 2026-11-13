import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { viewCopy } from "@/content/app/safe-send";
import { a11yViolations } from "@/test/a11y";
import type { SafeSendViewModel } from "@/types/safe-send";
import { RecipientView } from "./RecipientView";

const readable: SafeSendViewModel = {
  kind: "readable",
  senderName: "Ada Obi",
  senderEmail: "ada@gmail.com",
  recipientEmail: "kemi@client.co",
  subject: "Pricing deck v2",
  sentAt: "2026-10-31T10:00:00Z",
  expiresAt: "2026-11-01T10:00:00Z",
  body: "Hi Kemi,\n\nHere are the numbers (https://example.com/deck).",
};

describe("RecipientView", () => {
  it("shows the message as a letter: sender, subject, text, and until when it can be withdrawn", async () => {
    const { container } = render(<RecipientView view={readable} />);
    expect(screen.getByRole("heading", { level: 1, name: "Pricing deck v2" })).toBeInTheDocument();
    expect(screen.getByText("Ada Obi")).toBeInTheDocument();
    expect(screen.getByText("ada@gmail.com")).toBeInTheDocument();
    expect(screen.getByText(/Here are the numbers/)).toBeInTheDocument();
    expect(screen.getByText(viewCopy.window("Ada"), { exact: false })).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("makes web addresses in the text clickable, safely", () => {
    render(<RecipientView view={readable} />);
    const link = screen.getByRole("link", { name: "https://example.com/deck" });
    expect(link).toHaveAttribute("href", "https://example.com/deck");
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
  });

  it("replies in the app the message went to: Gmail for a Gmail address, in that account", async () => {
    const { container } = render(<RecipientView view={{ ...readable, recipientEmail: "kemi@gmail.com" }} />);
    const reply = screen.getByRole("link", { name: viewCopy.replyIn("Gmail") });
    expect(reply.getAttribute("href")).toMatch(
      /^https:\/\/mail\.google\.com\/mail\/\?authuser=kemi%40gmail\.com&view=cm/,
    );
    expect(reply.getAttribute("href")).toContain("su=Re%3A%20Pricing%20deck%20v2");
    await userEvent.click(screen.getByRole("button", { name: viewCopy.moreReply }));
    const menu = screen.getByRole("list", { name: viewCopy.moreReply });
    expect(within(menu).getByRole("link", { name: viewCopy.replyApps.mailto })).toHaveAttribute(
      "href",
      "mailto:ada@gmail.com?subject=Re%3A%20Pricing%20deck%20v2",
    );
    expect(within(menu).queryByRole("link", { name: viewCopy.replyApps.gmail })).toBeNull();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("offers every app, and copying the address, when the address doesn't say which app", async () => {
    render(<RecipientView view={readable} />);
    await userEvent.click(screen.getByRole("button", { name: viewCopy.reply("Ada") }));
    const menu = screen.getByRole("list", { name: viewCopy.moreReply });
    for (const app of Object.values(viewCopy.replyApps))
      expect(within(menu).getByRole("link", { name: app })).toBeInTheDocument();
    expect(
      within(menu).getByRole("button", { name: viewCopy.copyAddress("ada@gmail.com") }),
    ).toBeInTheDocument();
  });

  it("renders the body as text, never as HTML", () => {
    const { container } = render(
      <RecipientView view={{ ...readable, body: '<img src=x onerror="alert(1)"><script>x()</script>' }} />,
    );
    expect(container.querySelector("img[src='x']")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/<script>x\(\)<\/script>/)).toBeInTheDocument();
  });

  it("tells the reader it was withdrawn, by whom, and how to reach them (trust rule 2)", async () => {
    const { container } = render(
      <RecipientView
        view={{
          kind: "withdrawn",
          senderName: "Ada Obi",
          senderEmail: "ada@gmail.com",
          withdrawnAt: "2026-10-31T11:00:00Z",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: viewCopy.withdrawnTitle })).toBeInTheDocument();
    expect(screen.getByText(viewCopy.withdrawnBy("Ada Obi"), { exact: false })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: viewCopy.reply("Ada") }));
    expect(screen.getByRole("link", { name: viewCopy.replyApps.mailto })).toHaveAttribute(
      "href",
      "mailto:ada@gmail.com",
    );
    expect(container.textContent).not.toMatch(/deleted from your inbox/i); // trust rule 7
    expect(await a11yViolations(container)).toEqual([]);
  });

  it.each([
    [{ kind: "expired", senderName: "Ada", senderEmail: "ada@gmail.com" } as const, viewCopy.expiredTitle],
    [{ kind: "not_found" } as const, viewCopy.notFoundTitle],
  ])("explains %o", async (view, title) => {
    const { container } = render(<RecipientView view={view} />);
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });
});
