import { describe, expect, it } from "vitest";
import { MimeError, buildPlainEmail, encodeHeader } from "./mime";

const decode = (raw: string) => Buffer.from(raw, "base64url").toString("utf8");
const bodyOf = (message: string) =>
  Buffer.from(message.split("\r\n\r\n")[1]!.replace(/\r\n/g, ""), "base64").toString("utf8");

const base = {
  from: { email: "ada@example.com", name: "Ada Obi" },
  to: ["ada@example.com"],
  subject: "Clinton AI is connected",
  body: "Hello\nworld",
};

describe("buildPlainEmail", () => {
  it("builds a plain-text message from the user's own address", () => {
    const message = decode(buildPlainEmail(base, new Date("2026-10-29T10:00:00Z")));
    expect(message).toContain('From: "Ada Obi" <ada@example.com>');
    expect(message).toContain("To: ada@example.com");
    expect(message).toContain("Subject: Clinton AI is connected");
    expect(message).toContain("Date: Thu, 29 Oct 2026 10:00:00 +0000");
    expect(message).toMatch(/Message-ID: <[0-9a-f]{32}@example\.com>/);
    expect(bodyOf(message)).toBe("Hello\r\nworld");
  });

  it("encodes non-ASCII subjects and names", () => {
    const message = decode(
      buildPlainEmail({ ...base, subject: "Ọjọ́ dáadáa ✓", from: { ...base.from, name: "Adé" } }),
    );
    expect(message).toContain(`Subject: =?UTF-8?B?${Buffer.from("Ọjọ́ dáadáa ✓").toString("base64")}?=`);
    expect(message).toContain(`From: =?UTF-8?B?${Buffer.from("Adé").toString("base64")}?= <ada@example.com>`);
  });

  it("refuses header injection through the subject", () => {
    expect(() => buildPlainEmail({ ...base, subject: "Hi\r\nBcc: everyone@corp.com" })).toThrow(MimeError);
  });

  it("refuses malformed or injected addresses", () => {
    expect(() => buildPlainEmail({ ...base, to: ["a@b.co\r\nBcc: x@y.z"] })).toThrow(MimeError);
    expect(() => buildPlainEmail({ ...base, to: ["not-an-address"] })).toThrow(MimeError);
    expect(() => buildPlainEmail({ ...base, to: [] })).toThrow(MimeError);
  });

  it("strips quotes from display names", () => {
    const message = decode(buildPlainEmail({ ...base, from: { email: "ada@example.com", name: 'A"da' } }));
    expect(message).toContain('From: "Ada" <ada@example.com>');
  });
});

describe("encodeHeader", () => {
  it("leaves printable ASCII alone", () => {
    expect(encodeHeader("Plain subject")).toBe("Plain subject");
  });
});
