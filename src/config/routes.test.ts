import { describe, expect, it } from "vitest";
import { isProtectedPath } from "./routes";

describe("isProtectedPath", () => {
  it.each([
    "/dashboard",
    "/dashboard/emails",
    "/compose",
    "/outbox",
    "/settings",
    "/onboarding",
    "/owner/dashboard",
    "/owner/mfa",
  ])("protects %s", (path) => {
    expect(isProtectedPath(path)).toBe(true);
  });

  it.each(["/", "/login", "/auth/callback", "/dashboards", "/owners"])("leaves %s public", (path) => {
    expect(isProtectedPath(path)).toBe(false);
  });
});
