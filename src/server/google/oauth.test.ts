// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOAuthState,
  decodeOAuthState,
  encodeOAuthState,
  pkceChallenge,
  stateMatches,
} from "./oauth-state";
import { GMAIL_SEND_SCOPE, buildConsentUrl, emailFromIdToken, grantedScopes } from "./oauth";

beforeEach(() => {
  vi.stubEnv("GOOGLE_CLIENT_ID", "123-abc.apps.googleusercontent.com");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "GOCSPX-test-secret");
});

const jwt = (claims: object) => `h.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.s`;

describe("buildConsentUrl", () => {
  it("asks only to send, offline, with PKCE and state", () => {
    const url = new URL(
      buildConsentUrl({
        state: "st",
        challenge: "ch",
        redirectUri: "http://localhost:3000/api/google/callback",
        loginHint: "ada@example.com",
      }),
    );
    const p = url.searchParams;
    expect(url.origin).toBe("https://accounts.google.com");
    expect(p.get("scope")).toBe(`openid email ${GMAIL_SEND_SCOPE}`);
    expect(p.get("scope")).not.toMatch(/readonly|modify|mail\.google\.com/);
    expect(p.get("access_type")).toBe("offline");
    expect(p.get("prompt")).toBe("consent");
    expect(p.get("code_challenge_method")).toBe("S256");
    expect(p.get("state")).toBe("st");
    expect(p.get("login_hint")).toBe("ada@example.com");
  });
});

describe("OAuth state", () => {
  it("round-trips through the cookie and matches only for the same user", () => {
    const saved = decodeOAuthState(encodeOAuthState(createOAuthState("user-1")));
    expect(saved).not.toBeNull();
    expect(stateMatches(saved, saved!.state, "user-1")).toBe(true);
    expect(stateMatches(saved, saved!.state, "user-2")).toBe(false);
    expect(stateMatches(saved, "forged", "user-1")).toBe(false);
    expect(stateMatches(null, "x", "user-1")).toBe(false);
  });

  it("rejects tampered cookies", () => {
    expect(decodeOAuthState("not-base64-json")).toBeNull();
    expect(decodeOAuthState(Buffer.from('{"state":1}').toString("base64url"))).toBeNull();
    expect(decodeOAuthState(undefined)).toBeNull();
  });

  it("derives the RFC 7636 S256 challenge", () => {
    // Test vector from RFC 7636, appendix B.
    expect(pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });
});

describe("emailFromIdToken", () => {
  it("reads a verified address", () => {
    expect(emailFromIdToken(jwt({ email: "ada@example.com", email_verified: true }))).toBe("ada@example.com");
  });

  it("ignores unverified or missing addresses", () => {
    expect(emailFromIdToken(jwt({ email: "ada@example.com", email_verified: false }))).toBeNull();
    expect(emailFromIdToken(undefined)).toBeNull();
    expect(emailFromIdToken("garbage")).toBeNull();
  });
});

describe("grantedScopes", () => {
  it("splits Google's space-separated scope string", () => {
    expect(grantedScopes(`openid ${GMAIL_SEND_SCOPE}`)).toEqual(["openid", GMAIL_SEND_SCOPE]);
    expect(grantedScopes("")).toEqual([]);
  });
});
