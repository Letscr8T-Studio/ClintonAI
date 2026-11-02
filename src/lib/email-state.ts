import type { OutboxEmail } from "@/types/emails";

/**
 * Where an email stands for the person who sent it, and until when it can still be taken back:
 * cancelled while waiting (Smart Delay), withdrawn while a Safe Send link is readable.
 */
export type EmailState =
  | { kind: "waiting"; until: string }
  | { kind: "withdrawable"; until: string }
  | { kind: "sending" | "sent" | "withdrawn" | "expired" | "cancelled" | "failed" };

export function emailState(email: OutboxEmail, now: number): EmailState {
  switch (email.status) {
    case "held":
      return { kind: "waiting", until: email.sendAt };
    case "sending":
    case "cancelled":
    case "failed":
      return { kind: email.status };
    case "sent": {
      const info = email.safeSendInfo;
      if (!info) return { kind: "sent" };
      if (info.withdrawnAt) return { kind: "withdrawn" };
      if (info.contentDeletedAt || new Date(info.expiresAt).getTime() <= now) return { kind: "expired" };
      return { kind: "withdrawable", until: info.expiresAt };
    }
  }
}
