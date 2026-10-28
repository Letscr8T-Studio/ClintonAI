// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_MAX_AGE, checkCredentials, createSessionToken, verifySessionToken } from "./session";

const SECRET = "s".repeat(40);

beforeEach(() => {
  vi.stubEnv("ADMIN_EMAILS", "founder@tryclinton.com, Cofounder@tryclinton.com");
  vi.stubEnv("ADMIN_PASSWORD", "correct horse battery staple");
  vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
});

describe("checkCredentials", () => {
  it("accepts an allowed email (any case) with the right password", () => {
    expect(checkCredentials(" COFOUNDER@tryclinton.com", "correct horse battery staple")).toBe(true);
  });

  it("rejects a wrong password or an unknown email", () => {
    expect(checkCredentials("founder@tryclinton.com", "wrong")).toBe(false);
    expect(checkCredentials("stranger@example.com", "correct horse battery staple")).toBe(false);
  });

  it("is disabled when the env is incomplete", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "too-short");
    expect(checkCredentials("founder@tryclinton.com", "correct horse battery staple")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a token to the admin email", () => {
    const token = createSessionToken("Founder@tryclinton.com");
    expect(verifySessionToken(token)).toBe("founder@tryclinton.com");
  });

  it("rejects tampered, malformed and missing tokens", () => {
    const token = createSessionToken("founder@tryclinton.com")!;
    const [exp, email, sig] = token.split(".");
    const otherEmail = Buffer.from("cofounder@tryclinton.com").toString("base64url");
    expect(verifySessionToken(`${exp}.${otherEmail}.${sig}`)).toBeNull();
    expect(verifySessionToken(`${Number(exp) + 999}.${email}.${sig}`)).toBeNull();
    expect(verifySessionToken("a.b")).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });

  it("expires after the max age", () => {
    const now = Date.now();
    const token = createSessionToken("founder@tryclinton.com", now);
    expect(verifySessionToken(token, now + (SESSION_MAX_AGE - 60) * 1000)).not.toBeNull();
    expect(verifySessionToken(token, now + (SESSION_MAX_AGE + 1) * 1000)).toBeNull();
  });

  it("stops working when the email is removed from ADMIN_EMAILS", () => {
    const token = createSessionToken("cofounder@tryclinton.com");
    vi.stubEnv("ADMIN_EMAILS", "founder@tryclinton.com");
    expect(verifySessionToken(token)).toBeNull();
  });

  it("stops working when the secret rotates", () => {
    const token = createSessionToken("founder@tryclinton.com");
    vi.stubEnv("ADMIN_SESSION_SECRET", "r".repeat(40));
    expect(verifySessionToken(token)).toBeNull();
  });
});
