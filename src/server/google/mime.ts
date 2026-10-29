import "server-only";
import { randomBytes } from "node:crypto";

// Minimal RFC 5322 message builder for plain-text email sent through the Gmail API.
// Every header value is checked for CR/LF so user input can never inject headers.

export type PlainEmail = {
  from: { email: string; name?: string | null };
  to: string[];
  cc?: string[];
  /** Sent as a Bcc header; Gmail delivers it and removes the header before anyone sees it. */
  bcc?: string[];
  subject: string;
  body: string;
};

export class MimeError extends Error {}

const ADDRESS = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

function assertAddress(email: string): string {
  if (!ADDRESS.test(email) || email.length > 254) throw new MimeError(`Invalid address: ${email}`);
  return email;
}

function assertHeader(value: string): string {
  if (/[\r\n]/.test(value)) throw new MimeError("Header values cannot contain line breaks");
  return value;
}

/** RFC 2047 encoded-word for anything outside printable ASCII. */
export function encodeHeader(value: string): string {
  assertHeader(value);
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function mailbox({ email, name }: PlainEmail["from"]): string {
  assertAddress(email);
  if (!name) return email;
  const display = encodeHeader(name.replace(/["\\]/g, ""));
  return display.startsWith("=?") ? `${display} <${email}>` : `"${display}" <${email}>`;
}

/** Base64 body, wrapped at 76 characters. */
function base64Body(text: string): string {
  const normalised = text.replace(/\r?\n/g, "\r\n");
  return (
    Buffer.from(normalised, "utf8")
      .toString("base64")
      .match(/.{1,76}/g) ?? []
  ).join("\r\n");
}

/** The full message as base64url, ready for `users.messages.send` ({ raw }). */
export function buildPlainEmail(email: PlainEmail, now = new Date()): string {
  if (email.to.length === 0) throw new MimeError("At least one recipient is required");
  const domain = email.from.email.split("@")[1];
  const lines = [
    `From: ${mailbox(email.from)}`,
    `To: ${email.to.map(assertAddress).join(", ")}`,
    ...(email.cc?.length ? [`Cc: ${email.cc.map(assertAddress).join(", ")}`] : []),
    ...(email.bcc?.length ? [`Bcc: ${email.bcc.map(assertAddress).join(", ")}`] : []),
    `Subject: ${encodeHeader(email.subject)}`,
    `Date: ${now.toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${randomBytes(16).toString("hex")}@${domain}>`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64Body(email.body),
  ];
  return Buffer.from(lines.join("\r\n"), "utf8").toString("base64url");
}
