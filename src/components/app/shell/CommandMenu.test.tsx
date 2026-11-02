import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AppearanceSetting } from "@/components/app/settings/AppearanceSetting";
import { commandsCopy as copy } from "@/content/app/commands";
import { settingsCopy } from "@/content/app/settings";
import { a11yViolations } from "@/test/a11y";
import { CommandButton } from "./CommandButton";
import { CommandMenu } from "./CommandMenu";

const push = vi.hoisted(() => vi.fn());
const saveTheme = vi.hoisted(() => vi.fn(async () => ({ ok: true as const })));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));
vi.mock("@/app/(app)/settings/actions", () => ({ saveTheme }));

beforeAll(() => {
  // jsdom has no modal dialogs; open/close are all the menu needs.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});

afterEach(() => {
  push.mockReset();
  saveTheme.mockClear();
});

function renderShell() {
  return render(
    <div data-theme="system">
      <CommandButton />
      <textarea aria-label="Message" />
      <CommandMenu initialTheme="system" />
    </div>,
  );
}

const menu = () => screen.getByRole("dialog", { hidden: true }) as HTMLDialogElement;

describe("CommandMenu", () => {
  it("opens from the header button and with Ctrl + K, and is accessible", async () => {
    const { container } = renderShell();
    expect(menu().open).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: copy.open }));
    expect(menu().open).toBe(true);
    expect(await a11yViolations(container)).toEqual([]);
    menu().close();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(menu().open).toBe(true);
  });

  it("filters as you type; arrows and Enter run a command", async () => {
    renderShell();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    const input = screen.getByRole("combobox", { name: copy.inputLabel });
    await userEvent.type(input, "out");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["OutboxGthenO"]);
    await userEvent.clear(input);
    await userEvent.type(input, "{ArrowDown}{Enter}");
    expect(push).toHaveBeenCalledWith("/settings#smart-delay"); // second command
    expect(menu().open).toBe(false);
  });

  it("runs single keys and G-then-H sequences, but never while typing", () => {
    renderShell();
    fireEvent.keyDown(window, { key: "c" });
    expect(push).toHaveBeenLastCalledWith("/compose");
    fireEvent.keyDown(window, { key: "g" });
    fireEvent.keyDown(window, { key: "o" });
    expect(push).toHaveBeenLastCalledWith("/outbox");
    push.mockReset();
    fireEvent.keyDown(screen.getByLabelText("Message"), { key: "c" });
    expect(push).not.toHaveBeenCalled();
  });

  it("? shows every shortcut", () => {
    renderShell();
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByRole("heading", { name: copy.shortcutsTitle })).toBeInTheDocument();
  });

  it("switches the theme at once, saves it, and keeps Settings in step", async () => {
    render(
      <div data-theme="system">
        <CommandMenu initialTheme="system" />
        <AppearanceSetting initialTheme="system" />
      </div>,
    );
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await userEvent.type(screen.getByRole("combobox"), "dark{Enter}");
    expect(document.querySelector("[data-theme]")).toHaveAttribute("data-theme", "dark");
    expect(saveTheme).toHaveBeenCalledWith("dark");
    expect(
      screen.getByRole("radio", { name: new RegExp(settingsCopy.appearance.options.dark.label) }),
    ).toBeChecked();
  });
});
