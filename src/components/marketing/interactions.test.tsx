import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { faqs } from "@/content/faq";
import { mainNav } from "@/content/navigation";
import { MobileNav } from "./layout/MobileNav";
import { Faq } from "./sections/Faq";

describe("Faq accordion", () => {
  it("opens the first answer and toggles one at a time", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const [first, second] = faqs;
    const firstButton = screen.getByRole("button", { name: first.question });
    const secondButton = screen.getByRole("button", { name: second.question });

    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(first.answer)).toBeVisible();

    await user.click(secondButton);
    expect(secondButton).toHaveAttribute("aria-expanded", "true");
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(first.answer)).not.toBeVisible();

    await user.click(secondButton);
    expect(secondButton).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MobileNav", () => {
  it("opens, lists the links and closes on Escape with focus returned", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    for (const link of mainNav) expect(screen.getByRole("link", { name: link.label })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("closes when a link is chosen", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("link", { name: mainNav[0].label }));
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });
});
