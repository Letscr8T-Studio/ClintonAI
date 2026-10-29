import { describe, expect, it } from "vitest";
import { loginErrorMessage, loginErrors } from "./auth";

describe("loginErrorMessage", () => {
  it("shows nothing without an error", () => {
    expect(loginErrorMessage(undefined)).toBeNull();
  });

  it("maps known keys", () => {
    expect(loginErrorMessage("cancelled")).toBe(loginErrors.cancelled);
  });

  it("never echoes unknown input back to the page", () => {
    expect(loginErrorMessage("<script>")).toBe(loginErrors.callback);
    expect(loginErrorMessage("toString")).toBe(loginErrors.callback);
  });
});
