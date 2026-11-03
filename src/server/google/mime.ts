import "server-only";
import { randomBytes } from "node:crypto";

// Minimal RFC 5322 message builder for the Gmail API: plain text, optionally with an HTML
// alternative and attached files.
// Every header value is checked for CR/LF so user input can never inject headers.

export type PlainEmail = {
  from: { email: string; name?: string | null };
  to: string[];
  cc?: string[];
  /** Sent as a Bcc header; Gmail delivers it and removes the header before anyone sees it. */
  bcc?: string[];
  subject: string;
  body: string;
  /** Optional HTML version; `body` stays as the plain-text alternative. */
  html?: string;
  attachments?: MailFile[];
};

/** A file to attach, already read into memory. */
export type MailFile = { name: string; type: string; data: Buffer };

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
    ...withFiles(email.html ? alternative(email.body, email.html) : part("text/plain", email.body), email),
  ];
  return Buffer.from(lines.join("\r\n"), "utf8").toString("base64url");
}

const boundary = () => `clinton-${randomBytes(12).toString("hex")}`;

/** The message text first, then each file: clients list the files as attachments. */
function withFiles(content: string[], { attachments = [] }: PlainEmail): string[] {
  if (attachments.length === 0) return content;
  const b = boundary();
  return [
    `Content-Type: multipart/mixed; boundary="${b}"`,
    "",
    `--${b}`,
    ...content,
    ...attachments.flatMap((file) => [`--${b}`, ...filePart(file)]),
    `--${b}--`,
  ];
}

/** name="report.pdf", or RFC 2231 (name*=UTF-8''...) for anything beyond plain ASCII. */
export function fileParam(param: "name" | "filename", name: string): string {
  assertHeader(name);
  if (/^[\x20-\x7e]*$/.test(name) && !/["\\]/.test(name)) return `${param}="${name}"`;
  const encoded = encodeURIComponent(name).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `${param}*=UTF-8''${encoded}`;
}

function filePart({ name, type, data }: MailFile): string[] {
  return [
    `Content-Type: ${assertHeader(type)}; ${fileParam("name", name)}`,
    `Content-Disposition: attachment; ${fileParam("filename", name)}`,
    "Content-Transfer-Encoding: base64",
    "",
    (data.toString("base64").match(/.{1,76}/g) ?? []).join("\r\n"),
  ];
}

function part(type: "text/plain" | "text/html", content: string): string[] {
  return [
    `Content-Type: ${type}; charset="UTF-8"`,
    "Content-Transfer-Encoding: base64",
    "",
    base64Body(content),
  ];
}

/** Plain text first, HTML second: clients show the richest part they support. */
function alternative(text: string, html: string): string[] {
  const b = boundary();
  return [
    `Content-Type: multipart/alternative; boundary="${b}"`,
    "",
    `--${b}`,
    ...part("text/plain", text),
    `--${b}`,
    ...part("text/html", html),
    `--${b}--`,
  ];
}
