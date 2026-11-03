import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";
import { safeEqual } from "@/server/secure-compare";

// Tally form webhooks. Tally signs the raw body: Tally-Signature = base64(HMAC-SHA256(body, secret)).
// Docs: https://tally.so/help/webhooks

export function verifyTallySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  return safeEqual(createHmac("sha256", secret).update(body).digest("base64"), signature);
}

const payloadSchema = z.object({
  eventType: z.string(),
  data: z.object({
    formId: z.string(),
    fields: z.array(
      z.object({ key: z.string(), label: z.string().nullish(), type: z.string(), value: z.unknown() }),
    ),
  }),
});

/**
 * The respondent's email from a FORM_RESPONSE, read from the hidden "email" field the waitlist
 * page fills in. Null for other events, other forms, or no usable email.
 */
export function surveyEmail(body: string, formId: string): string | null {
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return null;
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success || parsed.data.eventType !== "FORM_RESPONSE") return null;
  if (formId && parsed.data.data.formId !== formId) return null;
  const field = parsed.data.data.fields.find(
    (f) => f.type === "HIDDEN_FIELDS" && (f.label ?? "").toLowerCase() === "email",
  );
  const email = z.email().safeParse(typeof field?.value === "string" ? field.value.trim().toLowerCase() : "");
  return email.success ? email.data : null;
}
