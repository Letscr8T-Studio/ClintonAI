/** What a recipient's Safe Send link shows. Built on the server; the body is present only while readable. */
export type SafeSendViewModel =
  | { kind: "not_found" }
  | { kind: "unreadable" }
  | { kind: "withdrawn"; senderName: string; withdrawnAt: string }
  | { kind: "expired"; senderName: string }
  | {
      kind: "readable";
      senderName: string;
      senderEmail: string;
      recipientEmail: string;
      subject: string;
      sentAt: string | null;
      expiresAt: string;
      body: string;
    };
