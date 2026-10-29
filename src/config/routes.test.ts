import { describe, expect, it } from "vitest";
import { isProtectedPath } from "./routes";

describe("isProtectedPath", () => {
  it.each(["/dashboard", "/dashboard/emails", "/compose", "/onboarding"])("protects %s", (path) => {
    expect(isProtectedPath(path)).toBe(true);
  });

  it.each(["/", "/login", "/auth/callback", "/dashboards", "/owner/dashboard"])(
    "leaves %s public",
    (path) => {
      expect(isProtectedPath(path)).toBe(false);
    },
  );
});
