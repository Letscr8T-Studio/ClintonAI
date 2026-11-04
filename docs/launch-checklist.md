# Launch checklist: before we open to users

**Hard gate.** Nothing on this list is optional. Do not invite beta users to connect Gmail, and do not
open sign-ups publicly, until every box in "Must fix" is ticked. Tick a box only when the work is merged,
deployed and verified; add the PR link next to it.

## Must fix

- [ ] **Shared rate limiting.** _Built 2026-11-03: `rate_limit_take()` in the database; every limiter moved over. Verify after deploy: send 11 waitlist requests within a minute and see the 11th refused._ Today limits live in memory per serverless instance (`src/server/rate-limit.ts`), so each instance counts separately and counts reset on redeploy. Move to a shared store (Upstash Redis or a Supabase table) behind the same `createRateLimiter` interface, so callers don't change. Cover the waitlist API, founders login, and every Phase 1 sending and AI check route.
- [ ] **Content-Security-Policy.** _Built 2026-11-03: nonce + `strict-dynamic` from `src/proxy.ts`; e2e checks the header and zero violations. Verify after deploy: with the browser console open, browse the site, sign in, compose with an attachment and open the Tally survey; no CSP errors._ No CSP header yet (`next.config.ts`). Add one with per-request nonces, allow-listing only what we load: the Tally script and frame (`tally.so`), Supabase, and Sentry once added. Verify in the browser console that nothing is blocked, and add a Playwright check that the header is present.
- [ ] **Signed Tally webhook.** _Built 2026-11-03: `/api/webhooks/tally`; the old route is removed. Verify after deploy: set `TALLY_SIGNING_SECRET`, add the webhook in Tally, submit the survey once and see `did_survey` flip._ `did_survey` is set because the browser calls `/api/survey-complete`, so anyone can mark any listed email as surveyed. Replace with `POST /api/webhooks/tally` that verifies Tally's signing secret and reads the hidden `email` field, then remove the client call and the old route.
- [ ] **Real auth for the founders console.** _Built 2026-11-03: Google sign-in + `admins` table + TOTP MFA + `admin_access_log`; the `ADMIN_*` variables are gone (delete them in Vercel). Verify after deploy: turn on TOTP in the hosted Supabase project, `npm run admin:add` each founder, set up the authenticator, open `/owner`._ It uses one shared password from env vars (`src/server/auth/`). Replace with Supabase Auth (the same sign-in as the product) plus an `admins` table or role, with per-person accounts, logged admin access and MFA if available. Then delete `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- [ ] **Error tracking.** _Deferred to just before beta (2026-11-04): first deploy runs without a DSN._ _Built 2026-11-03: `@sentry/nextjs` (client, server, edge), scrubbed, tunnelled through `/monitoring`. Verify after deploy: create the Sentry project, set the DSN and build variables in Vercel, turn on the new-issue email alert for the founders, trigger a test error and check it arrives with no email address in it._ Add Sentry (client, server and edge), with source maps uploaded on build and email addresses and email content scrubbed from events (trust rule 7). Alert the founders on new errors.

## Also required before real users (from the Phase 1 plan)

- [ ] Human backend engineer + AI security review of auth, Google tokens and Safe Send encryption.
- [ ] Privacy policy (with Google's Limited Use disclosure) and terms of service live on tryclinton.com. _Drafted 2026-11-03 at `/privacy` and `/terms` from what the product really does. Before launch: confirm the legal entity, country and mailboxes in `src/content/legal/types.ts`, and have a lawyer review both._
- [ ] Deliverability tests: Safe Send emails land in the inbox, not spam, on Gmail, Outlook and Yahoo.
- [ ] Trademark search on "Clinton AI" for software.
- [ ] Attachments in production: the CSP's `connect-src` allows the Supabase storage origin (uploads go straight there); the `attachments` bucket is confirmed private; a real email with a PDF and a non-English file name is received correctly in Gmail and Outlook.
- [ ] "Likely opened" disclosed: the privacy policy explains the tracking image (what it records, that it's off unless turned on, that it's a guess) for both senders and recipients (GDPR / ePrivacy, CCPA, NDPA). Measure whether tracked emails land in spam more often before promoting the feature.
- [ ] Smart Delay in production: `EMAIL_ENCRYPTION_KEY` and `CRON_SECRET` set in Vercel (key backed up in the team password manager), dispatcher registered against the hosted project with `DISPATCH_URL=https://tryclinton.com/api/cron/dispatch`, and one real email verified end to end. Gmail sending quotas understood (about 500/day on personal Gmail).
- [ ] Safe Send in production: `APP_URL=https://tryclinton.com` in Vercel; card email deliverability tested (Gmail, Outlook, Yahoo: inbox, not spam); the recipient page checked on phones; storage bucket confirmed private.
- [ ] AI provider data terms: the privacy policy names the AI check provider (OpenAI today) and its retention (API requests kept up to 30 days for abuse monitoring; not used for training). Request zero data retention if available, or switch provider, before real users. Our side already stores no email text.
- [ ] Hosted sign-in configured: production redirect URI and origin on the Google client, Google provider and URL configuration in the Supabase dashboard, `NEXT_PUBLIC_SUPABASE_*` and `GOOGLE_CLIENT_*` set in Vercel, `https://tryclinton.com/api/google/callback` added as a redirect URI (see [environment.md](engineering/environment.md)). Every beta tester added as a Google test user until verification is approved.

## When this list is done

Record it in [decisions.md](decisions.md) (date and PR links), move the closed items in
[engineering/security.md](engineering/security.md) from "Known gaps" into "Current posture", and only
then start inviting the beta.
