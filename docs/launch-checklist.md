# Launch checklist: before we open to users

**Hard gate.** Nothing on this list is optional. Do not invite beta users to connect Gmail, and do not
open sign-ups publicly, until every box in "Must fix" is ticked. Tick a box only when the work is merged,
deployed and verified; add the PR link next to it.

## Must fix

- [ ] **Shared rate limiting.** Today limits live in memory per serverless instance (`src/server/rate-limit.ts`), so each instance counts separately and counts reset on redeploy. Move to a shared store (Upstash Redis or a Supabase table) behind the same `createRateLimiter` interface, so callers don't change. Cover the waitlist API, founders login, and every Phase 1 sending and AI check route.
- [ ] **Content-Security-Policy.** No CSP header yet (`next.config.ts`). Add one with per-request nonces, allow-listing only what we load: the Tally script and frame (`tally.so`), Supabase, and Sentry once added. Verify in the browser console that nothing is blocked, and add a Playwright check that the header is present.
- [ ] **Signed Tally webhook.** `did_survey` is set because the browser calls `/api/survey-complete`, so anyone can mark any listed email as surveyed. Replace with `POST /api/webhooks/tally` that verifies Tally's signing secret and reads the hidden `email` field, then remove the client call and the old route.
- [ ] **Real auth for the founders console.** It uses one shared password from env vars (`src/server/auth/`). Replace with Supabase Auth (the same sign-in as the product) plus an `admins` table or role, with per-person accounts, logged admin access and MFA if available. Then delete `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- [ ] **Error tracking.** Add Sentry (client, server and edge), with source maps uploaded on build and email addresses and email content scrubbed from events (trust rule 7). Alert the founders on new errors.

## Also required before real users (from the Phase 1 plan)

- [ ] Human backend engineer + AI security review of auth, Google tokens and Safe Send encryption.
- [ ] Privacy policy (with Google's Limited Use disclosure) and terms of service live on tryclinton.com.
- [ ] Deliverability tests: Safe Send emails land in the inbox, not spam, on Gmail, Outlook and Yahoo.
- [ ] Trademark search on "Clinton AI" for software.
- [ ] Smart Delay in production: `EMAIL_ENCRYPTION_KEY` and `CRON_SECRET` set in Vercel (key backed up in the team password manager), dispatcher registered against the hosted project with `DISPATCH_URL=https://tryclinton.com/api/cron/dispatch`, and one real email verified end to end. Gmail sending quotas understood (about 500/day on personal Gmail).
- [ ] AI provider data terms: the privacy policy names the AI check provider (OpenAI today) and its retention (API requests kept up to 30 days for abuse monitoring; not used for training). Request zero data retention if available, or switch provider, before real users. Our side already stores no email text.
- [ ] Hosted sign-in configured: production redirect URI and origin on the Google client, Google provider and URL configuration in the Supabase dashboard, `NEXT_PUBLIC_SUPABASE_*` and `GOOGLE_CLIENT_*` set in Vercel, `https://tryclinton.com/api/google/callback` added as a redirect URI (see [environment.md](engineering/environment.md)). Every beta tester added as a Google test user until verification is approved.

## When this list is done

Record it in [decisions.md](decisions.md) (date and PR links), move the closed items in
[engineering/security.md](engineering/security.md) from "Known gaps" into "Current posture", and only
then start inviting the beta.
