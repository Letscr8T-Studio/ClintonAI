import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { connectOutcomes, gmailCopy } from "@/content/app/gmail";
import { a11yViolations } from "@/test/a11y";
import type { GmailAccount } from "@/types/accounts";
import { GmailCard } from "./GmailCard";

vi.mock("@/app/(app)/dashboard/actions", () => ({
  sendTestEmailAction: vi.fn(async () => ({})),
  disconnectAction: vi.fn(async () => ({})),
}));

const account = (status: GmailAccount["status"]): GmailAccount => ({
  id: "11111111-1111-4111-8111-111111111111",
  email: "ada@example.com",
  status,
  connectedAt: "2026-10-29T10:00:00Z",
});

describe("GmailCard", () => {
  it("invites the user to connect, and says exactly what is asked for", async () => {
    const { container } = render(<GmailCard accounts={[]} outcome={null} />);
    const connect = screen.getByRole("button", { name: gmailCopy.connectButton });
    expect(connect.closest("form")).toHaveAttribute("action", "/api/google/connect");
    expect(connect.closest("form")).toHaveAttribute("method", "post");
    expect(screen.getByText("Read your inbox")).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("shows a connected account with a test send and disconnect", async () => {
    const { container } = render(<GmailCard accounts={[account("active")]} outcome={null} />);
    expect(screen.getByRole("heading", { name: "ada@example.com" })).toBeInTheDocument();
    expect(screen.getByText("Connected 29 Oct 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: gmailCopy.testButton })).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("asks before disconnecting", async () => {
    render(<GmailCard accounts={[account("active")]} outcome={null} />);
    await userEvent.click(screen.getByRole("button", { name: gmailCopy.disconnect }));
    expect(screen.getByText(gmailCopy.disconnectConfirm)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: gmailCopy.disconnectNo }));
    expect(screen.queryByText(gmailCopy.disconnectConfirm)).not.toBeInTheDocument();
  });

  it("offers to reconnect a revoked account instead of a test send", () => {
    render(<GmailCard accounts={[account("revoked")]} outcome={null} />);
    expect(screen.getByText(gmailCopy.status.revoked)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: gmailCopy.reconnectButton })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: gmailCopy.testButton })).not.toBeInTheDocument();
  });

  it("announces the result of the Google round trip", () => {
    render(<GmailCard accounts={[]} outcome={connectOutcomes.missing_scope} />);
    expect(screen.getByRole("alert")).toHaveTextContent("leave that box ticked");
  });
});
