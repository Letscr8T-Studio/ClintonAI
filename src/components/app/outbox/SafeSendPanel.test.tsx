import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { safeSendCopy as copy } from "@/content/app/safe-send";
import { a11yViolations } from "@/test/a11y";
import type { SafeSendInfo } from "@/types/emails";
import { SafeSendPanel } from "./SafeSendPanel";

const NOW = new Date("2026-10-31T10:00:00Z").getTime();
const info = (over: Partial<SafeSendInfo> = {}): SafeSendInfo => ({
  messageId: "m1",
  expiresAt: new Date(NOW + 18 * 3_600_000 + 42 * 60_000 + 30_000).toISOString(),
  withdrawnAt: null,
  contentDeletedAt: null,
  recipients: [
    { id: "r1", email: "kemi@client.co", openCount: 2, firstOpenedAt: "x", withdrawnAt: null },
    { id: "r2", email: "tunde@client.co", openCount: 0, firstOpenedAt: null, withdrawnAt: null },
  ],
  ...over,
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

describe("SafeSendPanel", () => {
  it("shows time left and who opened it; accessible", async () => {
    const { container } = render(<SafeSendPanel info={info()} busy={false} onWithdraw={vi.fn()} />);
    expect(screen.getByText(copy.timeLeft("18h 42m"))).toBeInTheDocument();
    expect(screen.getByText(copy.opened(2))).toBeInTheDocument();
    expect(screen.getByText(copy.notOpened)).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("withdraws for one person", async () => {
    const onWithdraw = vi.fn();
    render(<SafeSendPanel info={info()} busy={false} onWithdraw={onWithdraw} />);
    await userEvent.click(screen.getByRole("button", { name: `${copy.withdrawOne} tunde@client.co` }));
    expect(onWithdraw).toHaveBeenCalledWith("r2");
  });

  it("asks before withdrawing for everyone", async () => {
    const onWithdraw = vi.fn();
    render(<SafeSendPanel info={info()} busy={false} onWithdraw={onWithdraw} />);
    await userEvent.click(screen.getByRole("button", { name: copy.withdrawAll }));
    expect(onWithdraw).not.toHaveBeenCalled();
    expect(screen.getByText(copy.withdrawAllConfirm)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: copy.withdrawYes }));
    expect(onWithdraw).toHaveBeenCalledWith();
  });

  it("offers nothing once withdrawn or expired", () => {
    const { rerender } = render(
      <SafeSendPanel info={info({ withdrawnAt: "x" })} busy={false} onWithdraw={vi.fn()} />,
    );
    expect(screen.getAllByText(copy.withdrawn).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(
      <SafeSendPanel
        info={info({ expiresAt: new Date(NOW - 1000).toISOString() })}
        busy={false}
        onWithdraw={vi.fn()}
      />,
    );
    expect(screen.getByText(copy.expired)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
