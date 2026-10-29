import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loginCopy } from "@/content/app/auth";
import { a11yViolations } from "@/test/a11y";
import { SignInPanel } from "./SignInPanel";

vi.mock("@/app/login/actions", () => ({ signInWithGoogle: vi.fn() }));

describe("SignInPanel", () => {
  it("offers Continue with Google and carries the next path", () => {
    const { container } = render(<SignInPanel next="/onboarding" error={null} />);
    expect(screen.getByRole("button", { name: loginCopy.button })).toBeInTheDocument();
    expect(container.querySelector<HTMLInputElement>('input[name="next"]')?.value).toBe("/onboarding");
  });

  it("says plainly what signing in shares and never touches", () => {
    render(<SignInPanel next="/dashboard" error={null} />);
    for (const item of [...loginCopy.shares, ...loginCopy.never]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("shows an error as an alert", () => {
    render(<SignInPanel next="/dashboard" error="Sign-in was cancelled." />);
    expect(screen.getByRole("alert")).toHaveTextContent("cancelled");
  });

  it("is accessible", async () => {
    const { container } = render(<SignInPanel next="/dashboard" error={null} />);
    expect(await a11yViolations(container)).toEqual([]);
  });
});
