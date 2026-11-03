# Security, verification and compliance

## Current posture (Phase 0)

- **Secrets server-only.** Supabase service-role key and admin credentials are read only in `src/server/` (guarded by `import "server-only"`). Only `NEXT_PUBLIC_*` vars reach the browser.
- **Database locked down.** `waitlist` has RLS enabled with no policies; only the service role can touch it.
- **Founders console:** the product's Google sign-in, plus a row in `admins` (only the service role can add one), plus TOTP MFA (the session must be `aal2`). Non-admins get a 404. Every page view and export is logged in `admin_access_log`. `noindex` and disallowed in robots.
- **Public API:** zod validation, honeypot, 10 requests/min/IP on `/api/waitlist`, generic error messages (internals only in server logs).
- **Rate limits** are shared by every instance through the database (`rate_limit_take()`; keys are SHA-256 hashed, so no IPs or emails are stored). They fail open, with a logged error, if the database is unreachable.
- **Content-Security-Policy** per request from `src/proxy.ts`: scripts only with the request's nonce (`'strict-dynamic'`), no `unsafe-inline` or `eval` in production, `frame-ancestors 'none'`, network and form targets limited to Supabase, Tally and Google sign-in. Every page renders per request so it can carry the nonce.
- **Tally webhook** verified with HMAC-SHA256 (`Tally-Signature`), compared in constant time.
- **Error tracking (Sentry):** off until a DSN is set; every `dataCollection` category off (no user info, cookies, headers, bodies, query strings, AI inputs or local variables); every event scrubbed of email addresses (`src/lib/error-scrub.ts`); no session replay; sent through our own `/monitoring` tunnel.
- **CSV export:** formula-injection defused (`csvCell`).
- **Headers** (`next.config.ts`): `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS; `X-Powered-By` removed.
- **JSON-LD** is static and `<`-escaped.

### Known gaps (block launch)

The five "Must fix" items were built on 3 November 2026 and wait for deploy and verification in the
**[launch checklist](../launch-checklist.md)**, with the human security review, the legal review of
the privacy policy and terms, and production configuration. Track progress there, not here.

## Google verification (Phase 1 gate)

| Level      | Gmail scopes                                                              | Google requires                                                                   | Features                                             |
| ---------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Sensitive  | `gmail.send`                                                              | App verification: forms, privacy policy, demo video; usually < 1 week if prepared | AI check, Smart Delay, Safe Send, outreach sending   |
| Restricted | `gmail.readonly`, `gmail.compose`, `gmail.modify`, `gmail.metadata`, full | Verification + yearly CASA assessment (~5-20 days, ~$540-720/yr)                  | Reply detection, summaries, priority inbox (Phase 5) |

**Stay at sensitive for as long as possible:** the extension reads the draft from the compose window on
screen and sends with `gmail.send`; no inbox-reading scope needed.

Checklist: Google Cloud project with OAuth consent screen (name, logo, monitored support email);
public homepage on tryclinton.com; privacy policy on the same domain with Google's **Limited Use**
disclosure; domain verified in Search Console; written reason per scope; unlisted English YouTube demo
showing the consent screen and every feature using each scope.

**Before verification:** max 100 test users, "unverified app" warning, re-login every 7 days. The count
cannot be reset.

Other approvals: Microsoft publisher verification + `Mail.Send` (Phase 4); Chrome Web Store ($5, review
of a few days, Phase 3); AMP for Email sender registration (later).

## Data protection and law

GDPR and UK GDPR (EU/UK), CCPA (California), Nigeria Data Protection Act 2023. Outreach: CAN-SPAM, GDPR
consent/opt-out, NDPA; every outreach email carries unsubscribe and opt-outs are permanent. Terms of
service and acceptable use: no spam, no bought lists, no using Safe Send to deceive. SOC 2 later.

## Data security requirements for Phase 1

- Google tokens encrypted at rest (Vault), never sent to the browser, revocable by the user.
- Safe Send content and attachments encrypted at rest with keys stored separately; deleted on withdrawal or when the 24 h window closes.
- Email text sent to the AI model for checking or rewriting only; never stored or logged; covered by the provider's no-training terms for API data.
- Attachments on normal emails live in the private, service-role-only `attachments` bucket.
  - Uploads use one-time signed URLs for the user's own folder (the API refuses any other folder).
  - Files are deleted when the email leaves or is cancelled, and swept after 24 h if unused.
  - They rely on storage encryption at rest, not our own key (see the decision log, 3 Nov 2026).
- "Likely opened" is opt-in. The pixel URL carries a 256-bit random token; only its SHA-256 is stored, and the pixel endpoint returns the same image whatever happens.
- RLS on every user table (`user_id = auth.uid()`); admin access logged.
- **A human backend engineer and an AI security review sign off before real users connect Gmail.** Every login, token and encryption change is reviewed by a person.
