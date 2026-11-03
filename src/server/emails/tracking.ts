import "server-only";
import { createHash, randomBytes } from "node:crypto";

// "Likely opened": a 1×1 image in an HTML copy of the email. Opt-in per account and per email.
// It is a guess (Apple Mail loads images for everyone; many apps block them), so the app always
// says "Likely opened", never "Opened".

/** A fresh pixel token; only its hash is stored, so the database can't rebuild the URL. */
export function newOpenToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashOpenToken(token) };
}

export function hashOpenToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** 43 base64url characters: what newOpenToken makes. Anything else is not ours. */
export const OPEN_TOKEN = /^[A-Za-z0-9_-]{43}$/;

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * The email's own text as simple HTML (same words, line breaks kept), with the pixel last.
 * Plain on purpose: it should look exactly like the text version in any mail app.
 */
export function trackedHtml(body: string, pixelUrl: string): string {
  const text = escapeHtml(body).replace(/\r?\n/g, "<br>");
  return [
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5">${text}</div>`,
    `<img src="${escapeHtml(pixelUrl)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">`,
  ].join("");
}
