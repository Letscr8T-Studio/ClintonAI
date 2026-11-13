# Chrome Web Store pack

Everything needed to publish the Clinton AI extension. Phase 3, milestone 7. The texts below are
written to be pasted as they are; keep them true of the code (and of [the privacy policy](../src/content/legal/privacy.ts)).

## 1. Before you start

- [ ] **Developer account:** chrome.google.com/webstore/devconsole with the dedicated Clinton AI Google account (not a personal one: the item belongs to the account that pays). One-time $5. Google requires 2-Step Verification on it.
- [ ] **Publisher name:** `Clinton AI`. Contact email: support@tryclinton.com (it must be verified by email).
- [ ] **Trader or non-trader** (asked for the EU): **non-trader** while it's free. Once Clinton AI charges, switch to trader (contact email, phone and address shown to EU users).
- [ ] **Reviewer account.** Reviewers sign in to test. Google sign-in is in Testing until verification, so create a Google account for reviewers (e.g. `clintonai.review@gmail.com`), add it as a **test user** in Google Cloud, sign in once at tryclinton.com, and connect its Gmail. Turn off 2-Step Verification on that account only, so reviewers can sign in.

## 2. The package

```bash
npm run ext:zip      # builds the store version → extension/clinton-ai-<version>.zip
```

It refuses development or local builds. **Every upload needs a higher version**: bump `version` in `package.json` (0.1.0 → 0.1.1) before the next one.

## 3. Store listing tab

**Name:** Clinton AI

**Summary** (from the manifest, 132 characters max):

> Check every email for mistakes right in Gmail, then send it with Smart Delay, Send later or Safe Send.

**Description:**

> Never regret an email again. Clinton AI checks the email you're writing in Gmail and helps you send it safely.
>
> CATCHES MISTAKES AS YOU WRITE
> Pause for a moment and Clinton AI reads the email you're writing: a wrong name in the greeting, "see attached" with nothing attached, a date that doesn't match its weekday, a card number or password, a harsh tone. The words are highlighted right in Gmail, with a one-click fix. It only ever advises: you decide, and Gmail's own Send always works.
>
> SEND IT THE SAFE WAY
> Send with Clinton AI from the same compose window, from your own Gmail address:
> • Smart Delay: it waits a few minutes first, so you can still cancel or edit.
> • Send later: tomorrow morning, Monday, or any time you pick.
> • Safe Send: recipients get a private link instead of the text, so you can withdraw it for 24 hours.
> • Undo, right after sending.
>
> YOUR OUTBOX IN THE TOOLBAR
> See what's about to leave, send it now, cancel it, or withdraw a Safe Send, from Chrome's toolbar.
>
> PRIVATE BY DESIGN
> Clinton AI only looks at the email you're writing, never your inbox or the emails you open. The text sent to the check is never stored. Clinton AI can send email as you, but it cannot read your inbox.
>
> Needs a free Clinton AI account (tryclinton.com) with Gmail connected. Desktop Chrome, Edge, Brave and other Chromium browsers. Replies, forwards and Gmail attachments are checked; send those with Gmail's Send for now.
>
> Clinton AI is not affiliated with or endorsed by Google. Gmail is a trademark of Google LLC.

**Category:** Communication. **Language:** English.

**Images** (`npm run store-assets` → `brand/store/`):

- Icon: from the package (128×128).
- Small promo tile: `promo-small-440x280.png`. Marquee (optional): `marquee-1400x560.png`.
- Screenshots, 1280×800, in this order: `screenshot-1-check.png`, `screenshot-2-send.png`, `screenshot-3-undo.png`, `screenshot-4-popup-outbox.png`.
  - 1–3 are framed from **real** screenshots of your Gmail. Put them in `private/store/` as `gmail-check.png` (an email with highlights and the panel open), `gmail-send.png` (the panel's send options) and `gmail-sent.png` (the note after sending), then run the script again. Use a test email to yourself: no real people's names or addresses in them.

**Homepage:** https://tryclinton.com. **Support:** support@tryclinton.com.

## 4. Privacy practices tab

**Single purpose:**

> Clinton AI helps people avoid email mistakes in Gmail: it checks the email they are writing and lets them send it through their Clinton AI account with Smart Delay, Send later or Safe Send.

**Permission justifications:**

- **Host permission `https://tryclinton.com/*`:**
  > The extension calls the user's own Clinton AI account at tryclinton.com: who is signed in, the AI check, putting an email in the Outbox, and the Outbox actions. It uses the user's existing tryclinton.com sign-in and stores no credentials.
- **Content script on `https://mail.google.com/*`:**
  > To add the Clinton AI bar to Gmail's compose windows: it reads only the compose window the user is writing in (recipients, subject, text) to check it, highlights words with the browser's highlight API, and, when the user asks, sends that email through their Clinton AI account. It does not read the inbox or opened emails.
- No other permissions are requested.

**Remote code:** No. All code is in the package.

**Data usage:** tick **Personally identifiable information** (names and email addresses of recipients) and **Personal communications** (the text of the email being written). Nothing else. Then tick all three certifications:

- not sold to third parties, outside the approved use cases;
- not used or transferred for purposes unrelated to the single purpose;
- not used or transferred to determine creditworthiness or for lending.

**Privacy policy:** https://tryclinton.com/privacy (its "Chrome extension" section covers this).

## 5. Distribution and test instructions

- **Visibility: Unlisted** for the beta. Only people with the link can install it, and it's still reviewed. Go Public after Google verification.
- **Regions:** all.
- **Test instructions** (paste, with the reviewer account's password):
  > 1. Sign in at https://tryclinton.com/login with Continue with Google, using the account below (its Gmail is already connected).
  > 2. Open Gmail with the same account and click Compose. A "Clinton AI" pill appears after the Send button.
  > 3. Write an email to yourself that says "please find the report attached" and attach nothing; pause for two seconds. The words are highlighted and the pill says "1 to check". Click it for the finding and the send options.
  > 4. Click "Send with Clinton AI": the email waits 5 minutes in the Outbox (toolbar icon), where it can be cancelled or sent now.

## 6. After approval

- [ ] Put the store link on tryclinton.com (Home's getting started, Settings) and in the beta invite.
- [ ] Phase 3 gate met: mark it Live in [the roadmap](product/roadmap.md) and the phase plan.
- [ ] Publish to Microsoft Edge Add-ons with the same zip (free account at partner.microsoft.com).
