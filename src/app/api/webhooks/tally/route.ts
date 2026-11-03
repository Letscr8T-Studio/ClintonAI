import { TALLY_FORM_ID } from "@/lib/tally";
import { getTallySigningSecret } from "@/server/env";
import { fail, ok } from "@/server/http";
import { markSurveyDone } from "@/server/waitlist/repository";
import { surveyEmail, verifyTallySignature } from "@/server/waitlist/tally-webhook";

export const runtime = "nodejs";

// POST /api/webhooks/tally: Tally calls this when someone submits the priority-access survey.
// Only a correctly signed request can mark an email as surveyed, and only one already on the list.
export async function POST(request: Request) {
  const secret = getTallySigningSecret();
  if (!secret) return fail("Webhook not configured", 503);
  const body = await request.text();
  if (!verifyTallySignature(body, request.headers.get("tally-signature"), secret)) {
    return fail("Invalid signature", 401);
  }
  // Anything else Tally sends (other events, other forms) is acknowledged and ignored.
  const email = surveyEmail(body, TALLY_FORM_ID);
  if (!email) return ok();
  try {
    await markSurveyDone(email);
    return ok();
  } catch (error) {
    console.error("[webhooks/tally]", error instanceof Error ? error.message : error);
    return fail("Could not record the survey", 500);
  }
}
