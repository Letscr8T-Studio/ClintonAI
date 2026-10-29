import "server-only";
import { z } from "zod";

// Validated server environment. Read lazily so a missing optional value only
// fails the feature that needs it, with a clear message, not the whole build.

const supabaseSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

// Public by design: the publishable key only grants what row-level security allows.
const supabaseAuthSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

// The same OAuth client Supabase Auth uses for sign-in; here for the separate "Connect Gmail" step.
const googleSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().endsWith(".apps.googleusercontent.com"),
  GOOGLE_CLIENT_SECRET: z.string().min(10),
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

/** For user sessions (sign-in with Google); every query runs as the signed-in user under RLS. */
export function getSupabaseAuthEnv() {
  const parsed = supabaseAuthSchema.safeParse({
    // Referenced explicitly so Next.js inlines them at build time.
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!parsed.success) throw new EnvError("Supabase Auth", parsed.error);
  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

// The deeper AI check. Optional: without it, Clinton runs the deterministic rules only.
const aiSchema = z.object({
  AI_PROVIDER: z.literal("openai"),
  OPENAI_API_KEY: z.string().startsWith("sk-"),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.4-mini"),
});

export type AiEnv = { provider: "openai"; apiKey: string; model: string };

/** The configured model provider, or null when the AI check is not set up (rules only). */
export function getAiEnv(): AiEnv | null {
  if (!process.env.AI_PROVIDER) return null;
  const parsed = aiSchema.safeParse(process.env);
  if (!parsed.success) throw new EnvError("AI check", parsed.error);
  return {
    provider: parsed.data.AI_PROVIDER,
    apiKey: parsed.data.OPENAI_API_KEY,
    model: parsed.data.OPENAI_MODEL,
  };
}

export function getGoogleEnv() {
  const parsed = googleSchema.safeParse(process.env);
  if (!parsed.success) throw new EnvError("Google OAuth", parsed.error);
  return { clientId: parsed.data.GOOGLE_CLIENT_ID, clientSecret: parsed.data.GOOGLE_CLIENT_SECRET };
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
