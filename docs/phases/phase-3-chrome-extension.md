# Phase 3: Chrome extension (Clinton AI inside Gmail)

**Status:** Planning (opened 2026-11-13 by founder decision, ahead of the Phase 1 gate; see
[decisions](../decisions.md)). Phase 1 continues in parallel: Google verification, beta, Yahoo
deliverability. **Gate to the next phase:** Chrome Web Store approval.

## Goal

People write in Gmail's own compose window and still get Clinton AI: the AI check with inline
highlights, and a **Send with Clinton AI** button that offers Smart Delay, Send later and Safe Send.
Same account, same settings and same Outbox as tryclinton.com. Desktop only (Chrome, Edge, Brave,
Opera, Arc). Phones keep using the web app.

## Out of scope

Reading the inbox or any received email; replacing or catching Gmail's own Send button; Firefox and
Safari; Gmail mobile app (a Google Workspace add-on is a separate, later decision); Outlook web;
outreach features; payments.

## User stories (acceptance criteria)

1. **Install and connect:** I install from the Chrome Web Store, click the Clinton AI icon, and connect it to my account in one click (signed in on tryclinton.com already) or after signing in. Under 1 minute.
2. **Check while I write:** in Gmail's compose window a small Clinton AI bar shows "Checking…", then "All good" or "2 things to check". Highlights appear on the words; each has Fix it / Ignore. Nothing is checked until I've stopped typing for ~1.5 s, and nothing is ever blocked.
3. **Gmail's Send still works:** if I use Gmail's own Send, Clinton AI stays out of the way. The email is not held, tracked or recorded by us.
4. **Send with Clinton AI:** a button next to Gmail's Send. Its menu: Smart Delay (my default), Send later, Safe Send toggle, "Likely opened" toggle. Choosing sends the email to our Outbox, closes the compose window and discards the Gmail draft, and shows "Held for 5:00 · Undo".
5. **Outbox anywhere:** the toolbar popup lists what's waiting (countdown, Cancel, Send now) and what can still be withdrawn. Everything links to tryclinton.com for the full view.
6. **Disconnect:** Settings on tryclinton.com lists "Chrome extension · last used …" with Disconnect. The extension also has Sign out. Either one revokes its access at once.
7. **Honest about limits:** if the draft has things we can't carry over (Gmail attachments, inline images, rich formatting), the menu says so and offers "Open in Clinton AI" (moves the draft to tryclinton.com Compose) or "Use Gmail's Send".

## How it works

```
mail.google.com tab                     extension service worker            tryclinton.com
┌──────────────────────────┐   message   ┌───────────────────────┐  HTTPS   ┌──────────────────┐
│ content script            │ ─────────▶ │ holds the device token │ ───────▶ │ /api/check       │
│  · finds compose windows  │ ◀───────── │ calls the API          │ ◀─────── │ /api/emails …    │
│  · reads To/Cc/Bcc/subject│            └───────────────────────┘ Bearer   │ (same routes as  │
│    /body of THAT window   │                                                │  the web app)    │
│  · draws bar + highlights │                                                └──────────────────┘
└──────────────────────────┘
```

- **Manifest V3.** Permissions: `storage` only. Host permissions: `https://mail.google.com/*` and `https://tryclinton.com/*`. No `tabs`, `history`, `cookies`, `<all_urls>`, `scripting` or remote code.
- **Content script** (UI in a closed Shadow DOM so Gmail's CSS and ours never mix). It reads only compose windows the user is writing in, never the message list or opened emails. Gmail's DOM is undocumented: all selectors live in one `gmail-dom.ts` module with tests against saved fixtures, so a Gmail change is a one-file fix.
- **Service worker** makes every API call. The content script never sees the token.
- **The extension sends nothing by itself.** It creates an email with the existing `POST /api/emails` and our dispatcher sends it from the user's own Gmail, exactly like the web app (trust rule 5). Gmail's Sent folder shows it as usual.

## Connecting the extension (auth)

The web app's session is a Supabase cookie; the extension gets its own revocable **device token**:

1. The popup opens `https://tryclinton.com/extension/connect`. The user signs in if needed and clicks **Connect**.
2. The page sends a one-time code to the extension (`chrome.runtime.sendMessage` via `externally_connectable`, limited to `https://tryclinton.com/*`). The service worker swaps it at `POST /api/extension/token` for a random 256-bit token.
3. Only the token's SHA-256 is stored (`extension_tokens`), with a 90-day life renewed by use. API routes accept `Authorization: Bearer` from the extension's origin as well as the session cookie; the check, emails and outbox routes get the same rate limits.

## Data model (new migration)

| Table              | Key columns                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `extension_tokens` | `id`, `user_id`, `token_hash` (sha256, unique), `label` ('Chrome on Windows'), `created_at`, `last_used_at`, `expires_at`, `revoked_at` |
| `extension_codes`  | `code_hash`, `user_id`, `expires_at` (60 s), `used_at`. One use only                                                                    |

RLS on; users can read their own tokens' label and dates (never the hash) and revoke them. pgTAP
tests: one-use codes, expiry, revoked tokens refused, other users' tokens invisible.

## Routes (new or changed)

| Route                               | Purpose                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `GET /extension/connect`            | Signed-in page with Connect; sends the one-time code to the extension    |
| `POST /api/extension/token`         | Swap code for device token                                               |
| `DELETE /api/extension/token`       | Sign out (revoke own token)                                              |
| `/api/check`, `/api/emails`, outbox | Also accept the Bearer token; CORS only for the published extension's ID |
| `GET /api/outbox`                   | Small JSON list for the popup (held + withdrawable)                      |

## Repo layout

`extension/` beside `src/`: its own `package.json`, Vite build to `extension/dist`, TypeScript, React
for the popup only. It imports the pure modules in `src/lib/` (check rules, validation, time) so the
rules and limits are one copy. The same conventions apply (~150 lines per file, tokens for colours,
content in typed files, axe on the popup).

## Testing

- Unit: `gmail-dom.ts` against saved Gmail compose fixtures; message passing; token storage.
- API: Bearer auth, CORS, revoked/expired tokens, rate limits.
- Playwright: loads the built extension in Chromium against a local fake-Gmail page built from the fixtures (we can't automate a real Gmail login). Manual run on real Gmail before each store submission.

## Milestones

1. [ ] Scaffold `extension/` (MV3, Vite, Shadow DOM, popup), CI build, `npm run ext:dev`.
2. [ ] Device tokens: migration, `/extension/connect`, token routes, Bearer support, Settings list with Disconnect.
3. [ ] Gmail compose detection and reading (`gmail-dom.ts` + fixtures), multiple compose windows, pop-out and reply.
4. [ ] Check bar and inline highlights in Gmail's editor, Fix it / Ignore, debounce.
5. [ ] Send with Clinton AI menu: Smart Delay, Send later, Safe Send, Likely opened; discard draft; Undo toast; limits notice and "Open in Clinton AI".
6. [ ] Popup Outbox: countdowns, Cancel, Send now, withdraw.
7. [ ] Privacy policy update (extension section), store listing, screenshots, permission justifications; submit to the Chrome Web Store, then Edge Add-ons.

## Open questions

- **Rich text.** Gmail compose is HTML; our sending is plain text today. Keep plain text in v1 (with the notice), or add HTML sending for links, bold and lists?
- **Gmail attachments.** Not readable from the page. v1 offers "Open in Clinton AI"; later, re-attach in our own picker?
- **Check data.** The check already sends text to the AI provider without storing it; checking while typing sends it more often. Confirm the rate (debounce + only on changes) is acceptable to the privacy policy.
- **Workspace add-on for the Gmail mobile app:** check-only (it can't hold or take back). Separate decision after the beta.
