import "server-only";
import type { DraftEmail } from "@/lib/check/types";
import type { CheckModel } from "./model";
import { FINDINGS_JSON_SCHEMA, SYSTEM_PROMPT, formatEmail, modelAnswerSchema } from "./prompt";

const URL = "https://api.openai.com/v1/chat/completions";

export class ModelError extends Error {}

/** Reasoning off (or minimal) for speed: the check has a ~2.5 s budget. */
function reasoningEffort(model: string): string | undefined {
  if (/^gpt-5\.\d/.test(model)) return "none";
  if (/^gpt-5/.test(model)) return "minimal";
  return undefined;
}

/** OpenAI Chat Completions with strict JSON-schema output. `store: false`: not kept for evals. */
export function createOpenAiModel(apiKey: string, model: string): CheckModel {
  return {
    name: `openai/${model}`,
    async check(draft: DraftEmail, signal: AbortSignal) {
      const effort = reasoningEffort(model);
      const res = await fetch(URL, {
        method: "POST",
        signal,
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          store: false,
          ...(effort ? { reasoning_effort: effort } : {}),
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: formatEmail(draft) },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "findings", strict: true, schema: FINDINGS_JSON_SCHEMA },
          },
        }),
      });
      if (!res.ok) throw new ModelError(`OpenAI request failed (${res.status})`);

      const json = (await res.json()) as { choices?: { message?: { content?: string; refusal?: string } }[] };
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new ModelError("OpenAI returned no content");
      return modelAnswerSchema.parse(JSON.parse(content));
    },
  };
}
