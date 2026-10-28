import { MESSAGES, surveyCompleteSchema } from "@/lib/validation/waitlist";
import { fail, ok, parseJson } from "@/server/http";
import { markSurveyDone } from "@/server/waitlist/repository";

export const runtime = "nodejs";

// POST /api/survey-complete  { email }
// Called by the page when the Tally survey is submitted. It can only flip did_survey
// from false to true for an email already on the list, so abuse is harmless.
// Tamper-proof upgrade: a signed Tally webhook (docs/phases/phase-0-validation.md).
export async function POST(request: Request) {
  const { data, response } = await parseJson(request, surveyCompleteSchema);
  if (response) return response;

  try {
    await markSurveyDone(data.email);
    return ok();
  } catch (err) {
    console.error("[api/survey-complete]", err);
    return fail(MESSAGES.generic, 500);
  }
}
