import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { onboardingCopy, tourSteps } from "@/content/app/onboarding";
import { a11yViolations } from "@/test/a11y";
import { OnboardingFlow } from "./OnboardingFlow";

const finishOnboarding = vi.fn();
vi.mock("@/app/onboarding/actions", () => ({
  finishOnboarding: (...args: unknown[]) => finishOnboarding(...args),
}));

beforeEach(() => {
  finishOnboarding.mockReset();
  finishOnboarding.mockResolvedValue({});
});

const heading = () => screen.getByRole("heading", { level: 1 });
const click = (name: string) => userEvent.click(screen.getByRole("button", { name }));

describe("OnboardingFlow", () => {
  it("walks the three tour screens, moving focus to each heading", async () => {
    render(<OnboardingFlow defaultDelaySeconds={300} />);
    expect(heading()).toHaveTextContent(tourSteps[0]!.title);
    expect(heading()).not.toHaveFocus();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();

    await click(onboardingCopy.next);
    expect(heading()).toHaveTextContent(tourSteps[1]!.title);
    expect(heading()).toHaveFocus();

    await click(onboardingCopy.back);
    expect(heading()).toHaveTextContent(tourSteps[0]!.title);
  });

  it("can skip straight to the delay choice", async () => {
    render(<OnboardingFlow defaultDelaySeconds={300} />);
    await click(onboardingCopy.skip);
    expect(heading()).toHaveTextContent(onboardingCopy.delayTitle);
    expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
  });

  it("pre-selects the current default and submits the chosen delay", async () => {
    render(<OnboardingFlow defaultDelaySeconds={300} />);
    await click(onboardingCopy.skip);

    const group = screen.getByRole("group", { name: onboardingCopy.delayLegend });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^5 min/ })).toBeChecked();

    await userEvent.click(screen.getByRole("radio", { name: "10 min" }));
    await click(onboardingCopy.finish);

    expect(finishOnboarding).toHaveBeenCalledTimes(1);
    const formData = finishOnboarding.mock.calls[0]![1] as FormData;
    expect(formData.get("delaySeconds")).toBe("600");
  });

  it("shows a save error as an alert", async () => {
    finishOnboarding.mockResolvedValue({ error: "We couldn't save that. Please try again." });
    render(<OnboardingFlow defaultDelaySeconds={300} />);
    await click(onboardingCopy.skip);
    await click(onboardingCopy.finish);
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn't save");
  });

  it("has no accessibility violations on a tour screen or the delay screen", async () => {
    const { container } = render(<OnboardingFlow defaultDelaySeconds={300} />);
    expect(await a11yViolations(container)).toEqual([]);
    await click(onboardingCopy.skip);
    expect(await a11yViolations(container)).toEqual([]);
  });
});
