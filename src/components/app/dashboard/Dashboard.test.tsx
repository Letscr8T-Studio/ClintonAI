import { render, screen, within } from "@testing-library/react";
import { outboxDefaults } from "@/test/fixtures";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stepStatuses } from "@/components/app/home/SetupSteps";
import { activityCopy, caughtCopy, recentCopy, statsCopy } from "@/content/app/dashboard";
import { a11yViolations } from "@/test/a11y";
import type { OutboxEmail } from "@/types/emails";
import { ActivityList } from "./ActivityList";
import { CaughtList } from "./CaughtList";
import { RecentEmails } from "./RecentEmails";
import { StatTiles, tilesFor } from "./StatTiles";

const NOW = new Date("2026-11-02T10:00:00Z").getTime();
const at = (ms: number) => new Date(NOW + ms).toISOString();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

const stats = {
  sent: 12,
  caught: 5,
  fixed: 4,
  safeSendPeople: 3,
  safeSendOpened: 2,
  waiting: 1,
  withdrawable: 2,
};

const emails: OutboxEmail[] = [
  {
    id: "e1",
    safeSend: false,
    subject: "Board update",
    to: ["kemi@client.co"],
    cc: [],
    ...outboxDefaults,
    status: "held",
    sendAt: at(3 * 60_000 + 5_000),
    sentAt: null,
    failureReason: null,
    createdAt: at(-60_000),
  },
  {
    id: "e2",
    safeSend: true,
    safeSendInfo: {
      messageId: "m1",
      expiresAt: at(18 * 3_600_000 + 42 * 60_000 + 30_000),
      withdrawnAt: null,
      contentDeletedAt: null,
      recipients: [],
    },
    subject: "Pricing",
    to: ["tunde@client.co"],
    cc: [],
    ...outboxDefaults,
    status: "sent",
    sendAt: at(-3_600_000),
    sentAt: at(-3_600_000),
    failureReason: null,
    createdAt: at(-3_700_000),
  },
];

describe("Dashboard", () => {
  it("the numbers: what was fixed, who opened, and what can still be unsent", () => {
    const tiles = tilesFor(stats);
    expect(tiles.map((t) => t.value)).toEqual([12, 5, 2, 3]);
    expect(tiles[1]!.note).toBe("4 fixed before sending");
    expect(tiles[2]!.meter?.label).toBe("2 of 3 people opened it");
    expect(tiles[3]).toMatchObject({ note: "1 waiting · 2 Safe Send", accent: true });
    const quiet = tilesFor({ ...stats, safeSendPeople: 0, safeSendOpened: 0, waiting: 0, withdrawable: 0 });
    expect(quiet[2]!.note).toBe(statsCopy.opens.none);
    expect(quiet[3]).toMatchObject({ note: statsCopy.unsend.none, accent: false });
  });

  it("the table shows live time left to cancel or withdraw; accessible", async () => {
    const { container } = render(<RecentEmails emails={emails} />);
    const table = screen.getByRole("table", { name: recentCopy.caption });
    const rows = within(table).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("3m to cancel");
    expect(rows[2]).toHaveTextContent("18h 42m to withdraw");
    expect(rows[2]).toHaveTextContent(recentCopy.safeSend);
    vi.useRealTimers();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("caught: the kinds of mistake and what the user did, never the words", async () => {
    const { container } = render(
      <CaughtList
        items={[
          {
            id: "e1",
            subject: "Offer",
            status: "sent",
            caught: 3,
            fixed: 2,
            kinds: ["greeting_mismatch", "missing_attachment", "tone"],
            createdAt: at(-60_000),
          },
        ]}
      />,
    );
    const kinds = screen.getByRole("list", { name: caughtCopy.kindsLabel });
    expect(
      within(kinds)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Name", "Attachment", "Tone"]);
    expect(screen.getByText("2 of 3 fixed")).toBeInTheDocument();
    vi.useRealTimers();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("activity reads as plain sentences, newest first; accessible", async () => {
    const { container } = render(
      <ActivityList
        items={[
          { id: 3, action: "opened", recipient: "kemi@client.co", subject: "Pricing", at: at(-5 * 60_000) },
          { id: 2, action: "withdrawn", recipient: null, subject: "", at: at(-2 * 3_600_000) },
        ]}
      />,
    );
    expect(screen.getByText("kemi@client.co opened “Pricing”")).toBeInTheDocument();
    expect(screen.getByText("Withdrew “(no subject)” for everyone")).toBeInTheDocument();
    expect(screen.getByText("5m ago")).toBeInTheDocument();
    vi.useRealTimers();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("empty states explain what will appear", () => {
    render(
      <>
        <StatTiles stats={stats} />
        <CaughtList items={[]} />
        <ActivityList items={[]} />
      </>,
    );
    expect(screen.getByText(caughtCopy.empty)).toBeInTheDocument();
    expect(screen.getByText(activityCopy.empty)).toBeInTheDocument();
  });

  it("getting started: one step at a time, Safe Send last", () => {
    expect(stepStatuses({ gmailConnected: false, hasSent: false, triedSafeSend: false })).toEqual([
      "next",
      "soon",
      "soon",
    ]);
    expect(stepStatuses({ gmailConnected: true, hasSent: true, triedSafeSend: false })).toEqual([
      "done",
      "done",
      "next",
    ]);
  });
});
