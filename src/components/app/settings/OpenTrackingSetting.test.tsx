import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmailBadges } from "@/components/app/outbox/EmailBadges";
import { badgeCopy } from "@/content/app/outbox";
import { settingsCopy } from "@/content/app/settings";
import { a11yViolations } from "@/test/a11y";
import { outboxDefaults } from "@/test/fixtures";
import type { OutboxEmail } from "@/types/emails";
import { OpenTrackingSetting } from "./OpenTrackingSetting";

const saveOpenTracking = vi.hoisted(() => vi.fn(async () => ({ ok: true as const })));
vi.mock("@/app/(app)/settings/actions", () => ({ saveOpenTracking }));

const copy = settingsCopy.tracking;

describe("OpenTrackingSetting", () => {
  it("is off unless turned on, explains it's a guess, and saves straight away", async () => {
    const { container } = render(<OpenTrackingSetting initialOn={false} />);
    const toggle = screen.getByRole("switch", { name: copy.toggle });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(copy.honest)).toBeInTheDocument();
    await userEvent.click(toggle);
    expect(saveOpenTracking).toHaveBeenCalledWith(true);
    expect(await screen.findByText(copy.savedOn)).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });
});

describe("EmailBadges", () => {
  const email = (over: Partial<OutboxEmail>): OutboxEmail => ({
    id: "e1",
    safeSend: false,
    subject: "Deck",
    to: ["a@x.co"],
    cc: [],
    ...outboxDefaults,
    status: "sent",
    sendAt: "",
    sentAt: "",
    failureReason: null,
    createdAt: "",
    ...over,
  });

  it("says Likely opened (never Opened), counts files, and shows nothing when there's nothing to say", () => {
    const { rerender, container } = render(
      <EmailBadges email={email({ trackOpens: true, opensCount: 2, attachments: ["a.pdf", "b.png"] })} />,
    );
    expect(screen.getByText(badgeCopy.likelyOpened)).toBeInTheDocument();
    expect(screen.getByText(badgeCopy.files(2))).toBeInTheDocument();
    rerender(<EmailBadges email={email({ trackOpens: true })} />);
    expect(screen.getByText(badgeCopy.noOpens)).toBeInTheDocument();
    rerender(<EmailBadges email={email({})} />);
    expect(container).toBeEmptyDOMElement();
  });
});
