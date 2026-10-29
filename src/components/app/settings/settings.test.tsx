import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { settingsCopy } from "@/content/app/settings";
import { displayNameSchema } from "@/lib/validation/profile";
import { a11yViolations } from "@/test/a11y";
import { DelaySetting } from "./DelaySetting";
import { NameSetting } from "./NameSetting";
import { PrivacySummary } from "./PrivacySummary";

const actions = vi.hoisted(() => ({ saveDefaultDelay: vi.fn(), saveDisplayName: vi.fn() }));
vi.mock("@/app/(app)/settings/actions", () => actions);

beforeEach(() => {
  actions.saveDefaultDelay.mockReset().mockResolvedValue({ ok: true });
  actions.saveDisplayName.mockReset().mockResolvedValue({ ok: true });
});

describe("DelaySetting", () => {
  it("saves the moment a new delay is picked, and is accessible", async () => {
    const { container } = render(<DelaySetting initialSeconds={300} />);
    expect(screen.getByRole("radio", { name: /^5 min/ })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "1 min" }));
    expect(actions.saveDefaultDelay).toHaveBeenCalledWith(60);
    expect(await screen.findByText(settingsCopy.delay.saved("1 min"))).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "1 min" })).toBeChecked();
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("goes back to the saved value if the save fails", async () => {
    actions.saveDefaultDelay.mockResolvedValue({ ok: false, error: settingsCopy.saveFailed });
    render(<DelaySetting initialSeconds={300} />);
    await userEvent.click(screen.getByRole("radio", { name: "10 min" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(settingsCopy.saveFailed);
    expect(screen.getByRole("radio", { name: /^5 min/ })).toBeChecked();
  });
});

describe("NameSetting", () => {
  it("previews the From line and saves the trimmed name", async () => {
    const { container } = render(<NameSetting initialName="Ada" email="ada@gmail.com" />);
    const save = screen.getByRole("button", { name: settingsCopy.name.save });
    expect(save).toBeDisabled(); // nothing changed yet
    const input = screen.getByLabelText(settingsCopy.name.label);
    await userEvent.clear(input);
    await userEvent.type(input, "  Ada Obi ");
    expect(screen.getByText("Ada Obi")).toBeInTheDocument();
    expect(screen.getByText("<ada@gmail.com>", { exact: false })).toBeInTheDocument();
    await userEvent.click(save);
    expect(actions.saveDisplayName).toHaveBeenCalledWith("Ada Obi");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(settingsCopy.name.saved));
    expect(await a11yViolations(container)).toEqual([]);
  });

  it("shows why a name was refused", async () => {
    actions.saveDisplayName.mockResolvedValue({ ok: false, error: "Keep it under 80 characters." });
    render(<NameSetting initialName="Ada" email={null} />);
    await userEvent.type(screen.getByLabelText(settingsCopy.name.label), " Obi");
    await userEvent.click(screen.getByRole("button", { name: settingsCopy.name.save }));
    expect(await screen.findByRole("alert")).toHaveTextContent("80 characters");
  });
});

describe("PrivacySummary", () => {
  it("lists what Clinton keeps", async () => {
    const { container } = render(<PrivacySummary />);
    expect(screen.getByText("Never stored")).toBeInTheDocument();
    expect(await a11yViolations(container)).toEqual([]);
  });
});

describe("displayNameSchema", () => {
  it("accepts a plain name and refuses header tricks", () => {
    expect(displayNameSchema.parse("  Ada Obi ")).toBe("Ada Obi");
    expect(displayNameSchema.safeParse("Ada\r\nBcc: x@y.z").success).toBe(false);
    expect(displayNameSchema.safeParse("<script>").success).toBe(false);
    expect(displayNameSchema.safeParse("   ").success).toBe(false);
  });
});
