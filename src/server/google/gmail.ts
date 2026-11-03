import "server-only";

// The media-upload endpoint takes the raw message as bytes, up to Gmail's 35 MB, so emails with
// attachments go through the same way as plain ones.
const SEND_URL = "https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media";

export class GmailSendError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GmailSendError";
  }
}

/**
 * Sends a prebuilt message (base64url, from buildPlainEmail) from the token owner's own address.
 * Returns Gmail's message id.
 */
export async function sendRawMessage(accessToken: string, raw: string): Promise<string> {
  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "message/rfc822" },
    body: new Uint8Array(Buffer.from(raw, "base64url")),
    cache: "no-store",
  });
  if (!res.ok) throw new GmailSendError(`Gmail send failed (${res.status})`, res.status);
  const json = (await res.json()) as { id?: unknown };
  if (typeof json.id !== "string") throw new GmailSendError("Gmail send returned no id", res.status);
  return json.id;
}
