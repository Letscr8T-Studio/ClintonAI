import "server-only";
import { z } from "zod";
import type { RewriteMode } from "@/lib/validation/rewrite";
import { getAiEnv } from "@/server/env";

// "Rewrite with Clinton": the user's own words, rewritten one way, on request. The text goes to
// the model with store: false and is never kept or logged here (trust rule 6). The user sees the
// result in Compose and can undo it (trust rule 4).

const URL = "https://api.openai.com/v1/chat/completions";
export const REWRITE_TIMEOUT_MS = 20_000;

export class RewriteError extends Error {}

const INSTRUCTIONS: Record<RewriteMode, string> = {
  fix: 'Fix every spelling, grammar, capitalisation and punctuation mistake. Capitalise the first word of the greeting, of every sentence and of the sign-off, every name, and "I"; fix its/it\'s, their/there and similar. Keep the wording, tone and line breaks otherwise.',
  shorter: "Make it shorter and clearer. Cut repetition and filler; keep every request, fact and the tone.",
  friendlier: "Make it warmer and friendlier, still professional. Keep it about the same length.",
  formal: "Make it more formal and polished, for a client or senior reader. Keep it about the same length.",
};

const SYSTEM = [
  "You rewrite the body of an email the user wrote, exactly as instructed.",
  "Never change facts, names, numbers, amounts, dates, times, links or email addresses.",
  "Never add new information, promises or attachments. Keep the greeting and sign-off.",
  "Write in the same language as the email. Return only the rewritten body text, no subject.",
].join(" ");

const answerSchema = z.object({ text: z.string().min(1) });
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["text"],
  properties: { text: { type: "string" } },
};

/** True when Rewrite can run (an AI model is configured). */
export const canRewrite = () => getAiEnv() !== null;

export async function rewriteEmail(body: string, mode: RewriteMode): Promise<string> {
  const env = getAiEnv();
  if (!env) throw new RewriteError("No model configured");
  const res = await fetch(URL, {
    method: "POST",
    signal: AbortSignal.timeout(REWRITE_TIMEOUT_MS),
    headers: { Authorization: `Bearer ${env.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.model,
      store: false,
      messages: [
        { role: "system", content: `${SYSTEM} ${INSTRUCTIONS[mode]}` },
        { role: "user", content: body },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "rewrite", strict: true, schema: SCHEMA },
      },
    }),
  });
  if (!res.ok) throw new RewriteError(`Rewrite request failed (${res.status})`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new RewriteError("Rewrite returned no content");
  return answerSchema.parse(JSON.parse(content)).text.trim();
}
