# Phase 1: v1 safety platform (launch product)

**Status:** In progress (started 2026-10-28). **Gate to Phase 2:** Google verification
approved and the beta is used weekly.

## Goal

A signed-in web app at tryclinton.com where a user connects Gmail and sends email through Clinton AI
with three protections: **AI check**, **Smart Delay**, **Safe Send** (withdrawable for 24 h), plus a
**dashboard** of what they sent and what was caught. Private beta, ≤100 users from the waitlist.

## Out of scope

Reading the inbox (no restricted scopes), outreach, extension, Outlook, mobile, payments, teams.

## User stories (acceptance criteria)

1. **Connect:** I click Continue with Google, approve _only_ "send email on my behalf", and land on my dashboard in under 2 minutes.
2. **Compose and check:** I write an email; on Send, within ~2 s I see "N things to check" (or nothing). Each finding has Fix it / Send anyway. I can always send.
3. **Smart Delay:** after Send, the email sits in my Outbox with a countdown (my default delay, 1-30 min). I can edit, cancel or send now. If I do nothing it sends from my own address and appears in my Gmail Sent folder.
4. **Safe Send:** I can toggle Safe Send per email (off by default; suggested on risky emails). Recipients get a normal email from me with a "View message from [Name]" card; the link opens the content without login.
5. **Unsend:** for 24 h I can withdraw for everyone or one recipient. Their page then reads "This message was withdrawn by the sender at [time]". After 24 h, content is deleted automatically.
6. **Dashboard:** I see sent this month, mistakes caught, Safe Send opened, can still unsend; a table of emails with status and unsend window; a "caught before sending" list.
7. **Onboarding tour:** three screens: AI check, Smart Delay, Safe Send. Default delay chosen during onboarding.

## Data model (built: `supabase/migrations/20261028100*_phase1_*.sql`)

All tables: RLS on, `user_id = auth.uid()` select policies, `created_at timestamptz default now()`.
**Clients only read; every write goes through the server with the service role.** Column grants hide
secrets from clients (`body_encrypted`, `vault_secret_id`, `key_ref`, `storage_path`, `token_hash`).
Profiles are the one exception: users may update their own settings columns.

Triggers enforce the trust rules in the database itself, so a server bug cannot break them:

- `enforce_email_transition`: content is editable only while `held`; only the transitions below are allowed; the body is wiped (`null`) once an email is sent, cancelled or failed.
- `guard_safe_send`: withdrawals are permanent; `storage_path`, `expires_at` and link `token_hash` never change (withdraw, never edit); deleted content cannot be restored; the window is at most 24 h and closed once expired.
- `forbid_change`: `activity_log` is append-only.
- `delete_account_secret`: disconnecting an account deletes its Vault token.
- `handle_new_user`: a profile is created on sign-up from the Google name and avatar.

Proven by the pgTAP tests in `supabase/tests/database/` (`npm run test:db`).

| Table                  | Key columns                                                                                                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`             | `user_id` PK → auth.users, `display_name`, `avatar_url`, `default_delay_seconds` (default 300, 60-1800), `open_tracking` bool (default off), `onboarded_at`                                                                                                                           |
| `connected_accounts`   | `id`, `user_id`, `provider` ('google'), `email`, `scopes` text[], `vault_secret_id` (refresh token in Vault), `status` ('active','revoked','error')                                                                                                                                   |
| `emails`               | `id`, `user_id`, `account_id`, `subject`, `to`/`cc`/`bcc` jsonb, `body_encrypted` (only while held), `safe_send` bool default false, `status` enum ('held','sending','sent','cancelled','failed'), `send_at`, `sent_at`, `provider_message_id`, `findings_count`, `findings_accepted` |
| `safe_send_messages`   | `id`, `email_id`, `storage_path` (encrypted blob), `key_ref`, `expires_at` (sent_at + 24 h), `withdrawn_at`, `content_deleted_at`                                                                                                                                                     |
| `safe_send_recipients` | `id`, `message_id`, `recipient_email`, `token_hash` (sha256 of the link token), `first_opened_at`, `open_count`, `withdrawn_at`                                                                                                                                                       |
| `ai_check_events`      | `id`, `user_id`, `email_id`, `finding_types` text[], `accepted` int, `dismissed` int. **No email text** (trust rule 7)                                                                                                                                                                |
| `activity_log`         | `id`, `user_id`, `email_id`, `action` ('held','edited','sent','cancelled','failed','withdrawn','expired','opened'), append-only                                                                                                                                                       |

Email status machine: `held → sending → sent` · `held → cancelled` · `sending → held` (retry) · `sending → failed` (retry ×3 with backoff, then notify).
Safe Send: `sent → withdrawn (per recipient or all)` · `sent → expired (24 h, content deleted)`.

## Server modules

```
src/server/auth/          Supabase Auth session helpers (replaces founders password later)
src/server/google/        OAuth (gmail.send, offline access), token refresh via Vault, MIME builder, send
src/server/ai/            check-rules.ts (deterministic), check-model.ts (Claude, JSON schema), check.ts (merge)
src/server/emails/        repository.ts, service.ts (create/hold/cancel/sendNow/dispatch)
src/server/safe-send/     crypto.ts (AES-256-GCM, per-message key), repository.ts, service.ts (withdraw, expire, view)
```

## Routes

| Route                                                                   | Purpose                                                                             |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `GET /auth/callback`                                                    | Supabase/Google OAuth callback; stores refresh token in Vault                       |
| `POST /api/check`                                                       | AI check: rules + model; returns findings. Text not stored                          |
| `POST /api/emails`                                                      | Create and hold (`send_at = now + delay`)                                           |
| `POST /api/emails/[id]/cancel` · `/send-now` · `PATCH /api/emails/[id]` | Outbox actions while held                                                           |
| `POST /api/safe-send/[id]/withdraw`                                     | Body `{ recipient?: string }`                                                       |
| `GET /m/[token]`                                                        | Public recipient page (content, withdrawn notice, or expired notice); records opens |
| `POST /api/cron/dispatch` · `/api/cron/expire`                          | Called by pg_cron (via `pg_net`) with a shared secret header                        |

## AI check

Deterministic rules first (fast, free, explainable): attachment mentioned but none; greeting name vs
recipient name; >N recipients or reply-all; weekday/date mismatch; sensitive patterns (account numbers,
passwords, salary); external domains; unfilled merge fields `{…}`. Then the model for subtle issues
(tone, wrong-recipient-for-topic, contradictions, unfinished sentences) via the Claude API with a
strict JSON schema. Use a fast Haiku-class model; confirm the current model ID and structured-output
API before implementing. Timeout ~2.5 s; on timeout return rule findings only. Never block sending.

Built (milestone 4): the provider is chosen by `AI_PROVIDER` (OpenAI today, model `OPENAI_MODEL`, default
`gpt-5.4-mini`, picked by benchmark: ~1.6 s, structured output). Anthropic can be added by implementing
`CheckModel` in `src/server/ai/model.ts`. Only finding types, model name and latency are recorded
(`ai_check_events`); the email text is never stored or logged.

## Milestones

1. [x] Migrations + types + RLS tests (Supabase local). 43 pgTAP tests; CI `database` job.
2. [x] Supabase Auth with Google; `(app)` layout; onboarding (default delay, tour). Sign-in asks only for name + email.
3. [x] Gmail connect (`gmail.send`, offline) + Vault token storage + send a plain email. Own OAuth flow (`/api/google/connect` → `/api/google/callback`, PKCE + state cookie), tokens via `save_google_account` / `get_account_refresh_token` (service role only), test send from the home screen, disconnect revokes and deletes. Verified live 2026-10-29: real Gmail connected, test email received.
4. [x] Compose UI + AI check (rules → model) + findings card. `/compose`; rules in `src/lib/check/` (attachment, greeting name, recipients, weekday/date, card/password/account, placeholders, subject), model via `src/server/ai/` (provider interface; OpenAI `gpt-5.4-mini`, strict JSON schema, 2.5 s budget, invented excerpts dropped); `POST /api/check`; findings with Fix it (previewed suggestion, user-applied) or Show me, Ignore and Send anyway; in-browser rules fallback. Sending itself arrives with milestone 5.
5. [x] Smart Delay: Outbox, countdown, edit/cancel/send-now, pg_cron dispatcher. Body AES-256-GCM encrypted while held (`EMAIL_ENCRYPTION_KEY`); `claim_emails()` (FOR UPDATE SKIP LOCKED, crashed sends marked failed, never retried); pg_cron every 20 s → pg_net → `POST /api/cron/dispatch` (Bearer `CRON_SECRET`, URL + secret in Vault via `configure_dispatcher()`); retries 1 min / 5 min, 3 attempts; `invalid_grant` fails at once and marks the account revoked; Edit takes the email back into Compose (cancelled, re-checked on send); disconnect cancels held emails and keeps history (`on delete set null (account_id)`). `/outbox` with live countdowns; clean emails go straight to the Outbox from Compose; phones get a bottom tab bar. Verified live 2026-10-30: real email held, counted down and delivered from the founder's Gmail.
6. [x] Safe Send: encryption, storage, recipient page `/m/[token]`, card email template, withdraw, expiry job. Card only (no text in the inbox). Per-message AES-256-GCM key in Vault (`create_safe_send` / `get_safe_send_key` / `open_safe_send` / `shred_safe_send`, service role only); ciphertext in the private `safe-send` bucket; one copy and one 256-bit link per person (only its SHA-256 stored), Bcc never revealed; withdraw for one person or everyone (everyone = key destroyed at once); expiry shredded by the 20 s dispatcher heartbeat; opens counted only while readable and labelled approximate; Compose toggle off by default, suggested for sensitive data / many recipients, max 20 people.
7. [x] Dashboard (stats, table, caught list) + activity history. Home becomes the dashboard after the first send: four numbers for the last 30 days (`dashboard_stats()`, security invoker so RLS applies), recent emails with live time left to cancel or withdraw, emails Clinton flagged with the kinds of mistake (from `ai_check_events` linked to the email) and what the user did, and the activity history. Getting started stays until Gmail, a first send and a first Safe Send are done. (Settings page built early, 2026-10-30: default Smart Delay with instant save, sender name with From preview, Gmail account, what Clinton keeps.)
       7b. [x] Compose extras (2026-11-03), before launch by founder decision:
   - **Bcc.**
   - **Attachments**, up to 10 files and 18 MB:
     - uploaded straight from the browser to the private `attachments` bucket with one-time signed URLs;
     - sent as `multipart/mixed` through Gmail's media-upload endpoint;
     - deleted when the email leaves or is cancelled;
     - leftovers swept after 24 h by `stale_attachments()`.
   - **Send later**: quick picks or any time up to 30 days ahead, held like Smart Delay with `scheduled = true`.
   - **"Likely opened"**: opt-in per account (`profiles.open_tracking`) and per email. A 1×1 pixel at `/api/o/[token]` (only the SHA-256 is stored); `record_email_open()` ignores the first 5 s; always labelled a guess.
   - **Rewrite with Clinton**: fix, shorter, friendlier, formal. `POST /api/rewrite`, text never stored, Undo in Compose.
8. [ ] Hardening: every item in the [launch checklist](../launch-checklist.md) (shared rate limits, CSP, signed Tally webhook, real console auth, Sentry), plus privacy policy + Limited Use page and terms.
9. [ ] Human + AI security review of auth, tokens, encryption. Deliverability tests (Gmail, Outlook, Yahoo spam folders).
10. [ ] Google verification submission (demo video, scope justifications). Invite beta in batches.

## Open decisions

- Default Smart Delay value: set to 5 min for now; confirm from beta testing.
- ~~`gmail.send` offline tokens~~ Decided 2026-10-29: our own "Connect Gmail" OAuth step, separate from sign-in (see decisions.md).
- ~~Disconnecting an account with held emails~~ Done in milestone 5: held emails are cancelled first; sent history is kept.
- Attachments with Safe Send (not supported yet: Compose and the API refuse the combination). Normal emails: 18 MB, decided 2026-11-03.
- Optional one-time code for very sensitive Safe Send emails: in v1 or later?
