import "server-only";
import { z } from "zod";

// Validated server environment. Read lazily so a missing optional value only
// fails the feature that needs it, with a clear message, not the whole build.

const supabaseSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const adminSchema = z.object({
  ADMIN_EMAILS: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(32),
});

export class EnvError extends Error {
  constructor(group: string, issues: z.ZodError) {
    const keys = [...new Set(issues.issues.map((i) => i.path.join(".")))].join(", ");
    super(
      `Missing or invalid ${group} env vars: ${keys}. See .env.example and docs/engineering/environment.md.`,
    );
    this.name = "EnvError";
  }
}

export function getSupabaseEnv() {
  const parsed = supabaseSchema.safeParse(process.env);
  if (!parsed.success) throw new EnvError("Supabase", parsed.error);
  return { url: parsed.data.SUPABASE_URL, serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY };
}

/** Founders console settings, or null when they aren't configured (login is then disabled). */
export function getAdminEnv() {
  const parsed = adminSchema.safeParse(process.env);
  if (!parsed.success) return null;
  return {
    emails: parsed.data.ADMIN_EMAILS.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    password: parsed.data.ADMIN_PASSWORD,
    sessionSecret: parsed.data.ADMIN_SESSION_SECRET,
  };
}
