import "server-only";

const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export class GmailSendError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GmailSendError";
  }
}

/** Sends a prebuilt message from the token owner's own address. Returns Gmail's message id. */
export async function sendRawMessage(accessToken: string, raw: string): Promise<string> {
  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
    cache: "no-store",
  });
  if (!res.ok) throw new GmailSendError(`Gmail send failed (${res.status})`, res.status);
  const json = (await res.json()) as { id?: unknown };
  if (typeof json.id !== "string") throw new GmailSendError("Gmail send returned no id", res.status);
  return json.id;
}
