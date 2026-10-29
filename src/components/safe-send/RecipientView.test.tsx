import { render, screen } from "@testing-library/react";
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
  body: "Hi Kemi,\n\nHere are the numbers.",
};

describe("RecipientView", () => {
  it("shows the message, who sent it and until when it can be withdrawn; accessible", async () => {
    const { container } = render(<RecipientView view={readable} />);
    expect(screen.getByRole("heading", { level: 1, name: "Pricing deck v2" })).toBeInTheDocument();
    expect(screen.getByText("Ada Obi")).toBeInTheDocument();
    expect(screen.getByText(/Here are the numbers/)).toBeInTheDocument();
    expect(screen.getByText(viewCopy.window, { exact: false })).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("renders the body as text, never as HTML", () => {
    const { container } = render(
      <RecipientView view={{ ...readable, body: '<img src=x onerror="alert(1)"><script>x()</script>' }} />,
    );
    expect(container.querySelector("img[src='x']")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/<script>x\(\)<\/script>/)).toBeInTheDocument();
  });

  it("tells the reader it was withdrawn, and by whom (trust rule 2)", async () => {
    const { container } = render(
      <RecipientView
        view={{ kind: "withdrawn", senderName: "Ada Obi", withdrawnAt: "2026-10-31T11:00:00Z" }}
      />,
    );
    expect(screen.getByRole("heading", { name: viewCopy.withdrawnTitle })).toBeInTheDocument();
    expect(screen.getByText(viewCopy.withdrawnBy("Ada Obi"), { exact: false })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/deleted from your inbox/i); // trust rule 7
    expect(await a11yViolations(container)).toEqual([]);
  });

  it.each([
    [{ kind: "expired", senderName: "Ada" } as const, viewCopy.expiredTitle],
    [{ kind: "not_found" } as const, viewCopy.notFoundTitle],
  ])("explains %o", (view, title) => {
    render(<RecipientView view={view} />);
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  });
});
