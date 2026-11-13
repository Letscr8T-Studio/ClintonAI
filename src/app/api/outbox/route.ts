import { NextResponse } from "next/server";
import { emailState } from "@/lib/email-state";
import type { PopupEmail } from "@/lib/validation/extension";
import { getCurrentUser } from "@/server/auth/user";
import { listOutbox } from "@/server/emails/outbox-repository";
import { fail } from "@/server/http";
import { attachSafeSend } from "@/server/safe-send/service";

// GET /api/outbox: what the Chrome extension's popup can still act on, soonest first: emails
// waiting to leave (Cancel, Send now) and Safe Send emails that can still be withdrawn. Subjects
// and recipients only, never the text. Same session and row-level security as the Outbox page.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);

  const now = Date.now();
  // Two days covers everything still actionable: Safe Send links last 24 hours after sending.
  const emails = await listOutbox(2).then(attachSafeSend);
  const actionable = emails.flatMap((email): PopupEmail[] => {
    const state = emailState(email, now);
    if (state.kind !== "waiting" && state.kind !== "withdrawable") return [];
    return [
      {
        id: email.id,
        subject: email.subject,
        to: [...email.to, ...email.cc],
        kind: state.kind,
        until: state.until,
        scheduled: email.scheduled,
        safeSendMessageId: email.safeSendInfo?.messageId ?? null,
      },
    ];
  });
  actionable.sort((a, b) => Date.parse(a.until) - Date.parse(b.until));

  return NextResponse.json(
    { ok: true, emails: actionable.slice(0, 20) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
