import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { appShellCopy } from "@/content/app/home";
import { a11yViolations } from "@/test/a11y";
import { AccountMenu } from "./AccountMenu";

const open = () =>
  userEvent.click(screen.getByRole("button", { name: new RegExp(`^${appShellCopy.accountMenu}`) }));

describe("AccountMenu", () => {
  it("opens to show who is signed in and a POST sign-out", async () => {
    render(<AccountMenu name="Ada Obi" email="ada@example.com" />);
    const trigger = screen.getByRole("button", { name: new RegExp(`^${appShellCopy.accountMenu}`) });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("AO")).toBeInTheDocument();

    await open();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const signOut = screen.getByRole("button", { name: appShellCopy.signOut });
    expect(signOut.closest("form")).toHaveAttribute("action", "/auth/signout");
    expect(signOut.closest("form")).toHaveAttribute("method", "post");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    render(<AccountMenu name="Ada Obi" email="ada@example.com" />);
    await open();
    await userEvent.keyboard("{Escape}");
    const trigger = screen.getByRole("button", { name: new RegExp(`^${appShellCopy.accountMenu}`) });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes on a click outside", async () => {
    render(
      <div>
        <AccountMenu name={null} email="ada@example.com" />
        <p>Outside</p>
      </div>,
    );
    await open();
    await userEvent.click(screen.getByText("Outside"));
    expect(screen.getByRole("button", { name: new RegExp(`^${appShellCopy.accountMenu}`) })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("is accessible open and closed", async () => {
    const { container } = render(<AccountMenu name="Ada Obi" email="ada@example.com" />);
    expect(await a11yViolations(container)).toEqual([]);
    await open();
    expect(await a11yViolations(container)).toEqual([]);
  });
});
