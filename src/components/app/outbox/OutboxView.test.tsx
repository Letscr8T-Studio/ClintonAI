import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DRAFT_HANDOFF_KEY } from "@/components/app/compose/useSendEmail";
import { failureReasons, outboxCopy as copy } from "@/content/app/outbox";
import { a11yViolations } from "@/test/a11y";
import type { OutboxEmail } from "@/types/emails";
import { OutboxView } from "./OutboxView";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const NOW = new Date("2026-10-30T10:00:00Z").getTime();
const email = (over: Partial<OutboxEmail>): OutboxEmail => ({
  id: "11111111-1111-4111-8111-111111111111",
  safeSend: false,
  subject: "Q3 investor update",
  to: ["investor@fund.co"],
  cc: [],
  status: "held",
  sendAt: new Date(NOW + 4 * 60_000 + 59_000).toISOString(),
  sentAt: null,
  failureReason: null,
  createdAt: new Date(NOW - 1000).toISOString(),
  ...over,
});
const waiting = email({});
const sent = email({
  id: "s1",
  subject: "Lunch",
  status: "sent",
  sentAt: new Date(NOW - 3_600_000).toISOString(),
});
const failed = email({
  id: "f1",
  subject: "Invoice",
  status: "failed",
  failureReason: failureReasons.revoked,
});

function mockFetch(body: unknown = { ok: true }) {
  const fn = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body)));
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  router.push.mockReset();
  router.refresh.mockReset();
});

describe("OutboxView", () => {
  it("shows the countdown, the history and the reason something wasn't sent; accessible", async () => {
    const { container } = render(<OutboxView emails={[waiting, sent, failed]} justQueued />);
    expect(screen.getByText("04:59")).toBeInTheDocument();
    expect(screen.getByText(copy.queued)).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText(failureReasons.revoked)).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("sends now", async () => {
    const fetchMock = mockFetch();
    render(<OutboxView emails={[waiting]} justQueued={false} />);
    await userEvent.click(screen.getByRole("button", { name: copy.sendNow }));
    expect(fetchMock).toHaveBeenCalledWith(`/api/emails/${waiting.id}/send-now`, { method: "POST" });
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
  });

  it("asks before cancelling", async () => {
    const fetchMock = mockFetch();
    render(<OutboxView emails={[waiting]} justQueued={false} />);
    await userEvent.click(screen.getByRole("button", { name: copy.cancel }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(copy.cancelConfirm)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: copy.cancelYes }));
    expect(fetchMock).toHaveBeenCalledWith(`/api/emails/${waiting.id}/cancel`, { method: "POST" });
  });

  it("takes an email back into Compose to edit", async () => {
    const draft = { to: ["investor@fund.co"], cc: [], subject: "Q3", body: "Hi" };
    mockFetch({ ok: true, draft });
    render(<OutboxView emails={[waiting]} justQueued={false} />);
    await userEvent.click(screen.getByRole("button", { name: copy.edit }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/compose"));
    expect(JSON.parse(window.sessionStorage.getItem(DRAFT_HANDOFF_KEY)!)).toEqual(draft);
  });

  it("shows an error if the email already left", async () => {
    mockFetch({ ok: false, error: "This email has already left, or was cancelled." });
    render(<OutboxView emails={[waiting]} justQueued={false} />);
    await userEvent.click(screen.getByRole("button", { name: copy.sendNow }));
    expect(await screen.findByRole("alert")).toHaveTextContent("already left");
  });

  it("offers no actions while an email is leaving", () => {
    render(<OutboxView emails={[email({ status: "sending" })]} justQueued={false} />);
    expect(screen.getByText(copy.leaving)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.sendNow })).not.toBeInTheDocument();
  });
});
