// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildCard, escapeHtml } from "./card";
import { hashToken, isLinkToken, newDataKey, newLinkToken, openContent, sealContent } from "./keys";

const input = {
  senderName: "Ada Obi",
  subject: "Pricing deck v2",
  link: "https://tryclinton.com/m/abc",
  others: ["tunde@client.co"],
};

describe("buildCard", () => {
  it("carries the link, the sender and who else it went to, never the message itself", () => {
    const { html, text } = buildCard(input);
    expect(html).toContain('href="https://tryclinton.com/m/abc"');
    expect(html).toContain("Ada Obi sent you a message");
    expect(html).toContain("Also sent to tunde@client.co");
    expect(text).toContain("Read it here: https://tryclinton.com/m/abc");
  });

  it("escapes anything hostile in the subject or name (no HTML injection)", () => {
    const { html } = buildCard({
      ...input,
      senderName: '<img src=x onerror="alert(1)">',
      subject: "<script>steal()</script>",
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;steal()&lt;/script&gt;");
  });

  it("omits the 'also sent to' line for a single recipient", () => {
    expect(buildCard({ ...input, others: [] }).html).not.toContain("Also sent to");
  });

  it("escapes all five HTML-special characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("keys and link tokens", () => {
  it("seals content so only its own key opens it", () => {
    const key = newDataKey();
    const sealed = sealContent("Salary: ₦5m", key);
    expect(sealed).not.toContain("Salary");
    expect(openContent(sealed, key)).toBe("Salary: ₦5m");
    expect(() => openContent(sealed, newDataKey())).toThrow();
  });

  it("makes long, URL-safe tokens and stores only their hash", () => {
    const { token, hash } = newLinkToken();
    expect(isLinkToken(token)).toBe(true);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).toBe(hash);
    expect(hash).not.toContain(token);
    expect(newLinkToken().token).not.toBe(token);
  });

  it("rejects malformed tokens before any database lookup", () => {
    expect(isLinkToken("short")).toBe(false);
    expect(isLinkToken("x".repeat(42) + "!")).toBe(false);
    expect(isLinkToken("../../etc/passwd")).toBe(false);
  });
});
