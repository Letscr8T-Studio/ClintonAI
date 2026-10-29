import { NextResponse } from "next/server";
import { safeSendErrors as errors } from "@/content/app/safe-send";
import { emailIdSchema, withdrawSchema } from "@/lib/validation/compose";
import { getCurrentUser } from "@/server/auth/user";
import { fail, parseJson } from "@/server/http";
import { withdraw } from "@/server/safe-send/service";

type Params = { params: Promise<{ messageId: string }> };

// Withdraw a Safe Send message for everyone (content shredded at once) or for one recipient.
// Only the sender, only within the 24 hours; a withdrawal is permanent and visible (trust rules 1-2).
export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  const { messageId } = await params;
  if (!emailIdSchema.safeParse(messageId).success) return fail(errors.notFound, 404);

  const parsed = await parseJson(request, withdrawSchema);
  if (parsed.response) return parsed.response;

  try {
    const done = await withdraw(user.id, messageId, parsed.data.recipientId);
    return done ? NextResponse.json({ ok: true }) : fail(errors.notFound, 404);
  } catch (error) {
    console.error("Withdraw failed", error instanceof Error ? error.message : error);
    return fail(errors.failed, 500);
  }
}
