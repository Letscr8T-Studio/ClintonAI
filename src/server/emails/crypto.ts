import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getEmailCryptoEnv } from "@/server/env";

// The body of a held email, encrypted at rest with AES-256-GCM (authenticated: tampering is
// detected). Format: "v1.<iv>.<tag>.<ciphertext>", base64url. The key never touches the database.

const VERSION = "v1";

export class DecryptError extends Error {}

export function encryptBody(plain: string, key = getEmailCryptoEnv().key): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [VERSION, iv, cipher.getAuthTag(), data]
    .map((p) => (typeof p === "string" ? p : p.toString("base64url")))
    .join(".");
}

export function decryptBody(sealed: string, key = getEmailCryptoEnv().key): string {
  const [version, iv, tag, data] = sealed.split(".");
  if (version !== VERSION || !iv || !tag || data === undefined) throw new DecryptError("Unknown format");
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString(
      "utf8",
    );
  } catch {
    throw new DecryptError("Could not decrypt (wrong key or tampered data)");
  }
}
