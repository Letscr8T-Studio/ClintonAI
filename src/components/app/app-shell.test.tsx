import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { appShellCopy, loginCopy } from "@/content/app/auth";
import { a11yViolations } from "@/test/a11y";
import { AppHeader } from "./AppHeader";
import { SignInForm } from "./auth/SignInForm";

vi.mock("@/app/login/actions", () => ({ signInWithGoogle: vi.fn() }));

describe("SignInForm", () => {
  it("offers Continue with Google and carries the next path", () => {
    const { container } = render(<SignInForm next="/onboarding" />);
    expect(screen.getByRole("button", { name: loginCopy.button })).toBeInTheDocument();
    expect(container.querySelector<HTMLInputElement>('input[name="next"]')?.value).toBe("/onboarding");
  });

  it("is accessible", async () => {
    const { container } = render(<SignInForm />);
    expect(await a11yViolations(container)).toEqual([]);
  });
});

describe("AppHeader", () => {
  it("shows who is signed in and signs out with a POST form", () => {
    render(<AppHeader name="Ada Obi" email="ada@example.com" />);
    expect(screen.getByText("Ada Obi")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    const signOut = screen.getByRole("button", { name: appShellCopy.signOut });
    expect(signOut.closest("form")).toHaveAttribute("method", "post");
    expect(signOut.closest("form")).toHaveAttribute("action", "/auth/signout");
  });

  it("is accessible", async () => {
    const { container } = render(<AppHeader name={null} email="ada@example.com" />);
    expect(await a11yViolations(container)).toEqual([]);
  });
});
