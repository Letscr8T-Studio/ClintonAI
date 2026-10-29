// @vitest-environment node
import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { DecryptError, decryptBody, encryptBody } from "./crypto";

const key = randomBytes(32);

describe("email body encryption", () => {
  it("round-trips unicode text", () => {
    const text = "Hi Dami,\n\nỌjọ́ dáadáa ✓ — ₦5m.";
    expect(decryptBody(encryptBody(text, key), key)).toBe(text);
  });

  it("never stores the plain text, and never repeats a ciphertext", () => {
    const a = encryptBody("secret salary", key);
    const b = encryptBody("secret salary", key);
    expect(a).not.toContain("secret");
    expect(a).not.toBe(b); // fresh IV every time
    expect(a.startsWith("v1.")).toBe(true);
  });

  it("detects tampering and wrong keys", () => {
    const sealed = encryptBody("hello", key);
    const parts = sealed.split(".");
    const flipped = Buffer.from(parts[3]!, "base64url");
    flipped[0] = flipped[0]! ^ 1;
    parts[3] = flipped.toString("base64url");
    expect(() => decryptBody(parts.join("."), key)).toThrow(DecryptError);
    expect(() => decryptBody(sealed, randomBytes(32))).toThrow(DecryptError);
    expect(() => decryptBody("garbage", key)).toThrow(DecryptError);
  });
});
