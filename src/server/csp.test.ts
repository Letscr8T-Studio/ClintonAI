// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildCsp, newNonce } from "./csp";

const directive = (csp: string, name: string) =>
  csp
    .split("; ")
    .find((d) => d.startsWith(`${name} `))
    ?.split(" ")
    .slice(1) ?? [];

describe("buildCsp", () => {
  const csp = buildCsp({ nonce: "abc123", supabaseUrl: "https://proj.supabase.co/" });

  it("runs only scripts carrying this request's nonce (no unsafe-inline, no eval)", () => {
    const scripts = directive(csp, "script-src");
    expect(scripts).toContain("'nonce-abc123'");
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(scripts).not.toContain("'unsafe-eval'");
  });

  it("allows only what the product uses: Supabase uploads and sign-in, the Tally survey", () => {
    expect(directive(csp, "connect-src")).toEqual(["'self'", "https://proj.supabase.co", "https://tally.so"]);
    expect(directive(csp, "frame-src")).toEqual(["https://tally.so"]);
    expect(directive(csp, "form-action")).toContain("https://accounts.google.com");
  });

  it("can't be framed, has no plugins, and upgrades http in production", () => {
    expect(directive(csp, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(csp, "object-src")).toEqual(["'none'"]);
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("adds what the dev server needs only in dev", () => {
    const dev = buildCsp({ nonce: "n", dev: true });
    expect(directive(dev, "script-src")).toContain("'unsafe-eval'");
    expect(dev).not.toContain("upgrade-insecure-requests");
  });
});

describe("newNonce", () => {
  it("is fresh every time and long enough", () => {
    const a = newNonce();
    expect(a).not.toBe(newNonce());
    expect(Buffer.from(a, "base64")).toHaveLength(16);
  });
});
