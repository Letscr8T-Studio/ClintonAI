import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { decryptBody, encryptBody } from "@/server/emails/crypto";

// Per-message data keys (kept in Vault, destroyed to shred) and per-recipient link tokens
// (only their SHA-256 hash is stored; the raw token exists only in the recipient's email).

const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;

/** A fresh 256-bit key for one message, base64. */
export function newDataKey(): string {
  return randomBytes(32).toString("base64");
}

export function sealContent(body: string, dataKey: string): string {
  return encryptBody(body, Buffer.from(dataKey, "base64"));
}

export function openContent(sealed: string, dataKey: string): string {
  return decryptBody(sealed, Buffer.from(dataKey, "base64"));
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A 256-bit, URL-safe link token and the hash we store. */
export function newLinkToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

/** Cheap shape check before touching the database. */
export function isLinkToken(value: string): boolean {
  return TOKEN_FORMAT.test(value);
}
