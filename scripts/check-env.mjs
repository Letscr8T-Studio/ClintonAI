// Checks a production environment file before it goes into Vercel: every variable present, in
// the right shape, consistent with the others, and nothing local or test-only left in.
// Usage: npm run deploy:check-env -- .env.production.local
// Exit code 1 if anything must be fixed; warnings don't fail. Prints no secret values.
import { readFileSync } from "node:fs";

const file = process.argv[2] ?? ".env.production.local";
let text;
try {
  text = readFileSync(file, "utf8");
} catch {
  console.error(`Can't read ${file}. Copy .env.example to ${file} and fill in the production values.`);
  process.exit(1);
}
const env = Object.fromEntries(
  text
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l.trim()))
    .map((l) => {
      const i = l.indexOf("=");
      return [
        l.slice(0, i).trim(),
        l
          .slice(i + 1)
          .trim()
          .replace(/^["']|["']$/g, ""),
      ];
    }),
);

const errors = [];
const warnings = [];
const need = (key, test, why) => {
  const v = env[key];
  if (!v) errors.push(`${key} is missing. ${why}`);
  else if (test && !test(v)) errors.push(`${key} looks wrong. ${why}`);
};
const https = (v) => /^https:\/\/[^/]+[^/]$/.test(v) && !/localhost|127\.0\.0\.1/.test(v);
const bytes = (v) => Buffer.from(v, "base64").length;

need(
  "NEXT_PUBLIC_SITE_URL",
  https,
  "The public site, e.g. https://tryclinton.com (https, no trailing slash).",
);
need("APP_URL", https, "Links inside emails (Safe Send, Likely opened); same as NEXT_PUBLIC_SITE_URL.");
need(
  "NEXT_PUBLIC_SUPABASE_URL",
  (v) => /^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(v),
  "Supabase → Project Settings → API → Project URL.",
);
need("SUPABASE_URL", (v) => v === env.NEXT_PUBLIC_SUPABASE_URL, "Must equal NEXT_PUBLIC_SUPABASE_URL.");
need(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  (v) => v.startsWith("sb_publishable_") || v.startsWith("eyJ"),
  "Supabase → API Keys → publishable key.",
);
need(
  "SUPABASE_SERVICE_ROLE_KEY",
  (v) =>
    (v.startsWith("sb_secret_") || v.startsWith("eyJ")) && v !== env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  "Supabase → API Keys → secret key (server only).",
);
need(
  "GOOGLE_CLIENT_ID",
  (v) => v.endsWith(".apps.googleusercontent.com"),
  "Google Cloud → Credentials → OAuth client ID.",
);
need("GOOGLE_CLIENT_SECRET", (v) => v.length >= 10, "Google Cloud → Credentials → OAuth client secret.");
need(
  "EMAIL_ENCRYPTION_KEY",
  (v) => bytes(v) === 32,
  "32 random bytes, base64: openssl rand -base64 32. Back it up: losing it makes waiting emails unreadable.",
);
need("CRON_SECRET", (v) => v.length >= 32, "32+ random characters: openssl rand -base64 32.");
need("AI_PROVIDER", (v) => v === "openai", 'Must be "openai".');
need("OPENAI_API_KEY", (v) => v.startsWith("sk-"), "OpenAI → API keys.");

if (env.APP_URL && env.NEXT_PUBLIC_SITE_URL && env.APP_URL !== env.NEXT_PUBLIC_SITE_URL)
  warnings.push("APP_URL differs from NEXT_PUBLIC_SITE_URL: email links will point somewhere else.");
if (env.EMAIL_ENCRYPTION_KEY && env.EMAIL_ENCRYPTION_KEY === env.CRON_SECRET)
  errors.push("EMAIL_ENCRYPTION_KEY and CRON_SECRET must be different secrets.");
if (env.RATE_LIMIT_STORE === "memory") errors.push("RATE_LIMIT_STORE=memory is for tests: remove it.");
for (const old of ["ADMIN_EMAILS", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"])
  if (env[old]) warnings.push(`${old} is no longer used (founders sign in with Google + MFA): remove it.`);
if (!env.OPENAI_MODEL) warnings.push("OPENAI_MODEL not set: gpt-5.4-mini is used.");
if (!env.NEXT_PUBLIC_TALLY_FORM_ID)
  warnings.push("NEXT_PUBLIC_TALLY_FORM_ID not set: the waitlist survey won't open.");
if (!env.TALLY_SIGNING_SECRET)
  warnings.push("TALLY_SIGNING_SECRET not set: survey answers won't be recorded.");
if (!env.NEXT_PUBLIC_SENTRY_DSN)
  warnings.push("NEXT_PUBLIC_SENTRY_DSN not set: errors won't be reported (launch checklist item).");
else if (!env.SENTRY_AUTH_TOKEN || !env.SENTRY_ORG || !env.SENTRY_PROJECT)
  warnings.push(
    "Sentry DSN set but SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN missing: stack traces will be unreadable.",
  );
for (const [k, v] of Object.entries(env))
  if (/localhost|127\.0\.0\.1|host\.docker\.internal/.test(v)) errors.push(`${k} points at a local address.`);

const ok = errors.length === 0;
console.log(`${file}: ${Object.keys(env).length} variables`);
for (const e of errors) console.log(`  ✗ ${e}`);
for (const w of warnings) console.log(`  ! ${w}`);
console.log(ok ? "Ready for Vercel." : `${errors.length} to fix before deploying.`);
process.exit(ok ? 0 : 1);
