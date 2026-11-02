import "server-only";
import type { DraftEmail } from "@/lib/check/types";
import { getAiEnv } from "@/server/env";
import { createOpenAiModel } from "./openai";
import type { CheckContext, ModelAnswer } from "./prompt";

/** A model provider for the deeper check. Add Anthropic etc. by implementing this. */
export type CheckModel = {
  /** Recorded with each check (e.g. "openai/gpt-5.4-mini"); never the email itself. */
  name: string;
  check: (draft: DraftEmail, signal: AbortSignal, context: CheckContext) => Promise<ModelAnswer>;
};

/** The configured model, or null when only the rules should run. */
export function getCheckModel(): CheckModel | null {
  const env = getAiEnv();
  if (!env) return null;
  switch (env.provider) {
    case "openai":
      return createOpenAiModel(env.apiKey, env.model);
  }
}
