import { NextResponse } from "next/server";
import { emailActionErrors as errors } from "@/content/app/outbox";
import { emailIdSchema } from "@/lib/validation/compose";
import { getCurrentUser } from "@/server/auth/user";
import { cancelEmail, sendNow, takeBackForEdit } from "@/server/emails/service";
import { fail } from "@/server/http";

type Params = { params: Promise<{ id: string; action: string }> };

// Outbox actions on one held email: POST /api/emails/:id/cancel | send-now | edit.
// Every action checks the email belongs to the signed-in user and is still waiting.
export async function POST(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  const { id, action } = await params;
  if (!emailIdSchema.safeParse(id).success) return fail(errors.notFound, 404);

  try {
    switch (action) {
      case "cancel":
        return (await cancelEmail(user, id)) ? NextResponse.json({ ok: true }) : fail(errors.notFound, 404);
      case "send-now": {
        const outcome = await sendNow(user, id);
        return outcome ? NextResponse.json({ ok: true, outcome }) : fail(errors.notFound, 404);
      }
      case "edit": {
        const draft = await takeBackForEdit(user, id);
        return draft ? NextResponse.json({ ok: true, draft }) : fail(errors.notFound, 404);
      }
      default:
        return fail("Not found", 404);
    }
  } catch (error) {
    console.error(`Outbox ${action} failed`, error instanceof Error ? error.message : error);
    return fail(errors.failed, 500);
  }
}
