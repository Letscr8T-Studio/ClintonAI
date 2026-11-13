# Google verification pack

Everything needed to get the OAuth consent screen verified, so more than 100 people can connect Gmail
and nobody sees "Google hasn't verified this app". Phase 1, milestone 10.

**What we ask for:** `openid`, `userinfo.email`, `userinfo.profile` (sign-in) and
`https://www.googleapis.com/auth/gmail.send` (Connect Gmail). `gmail.send` is a **sensitive** scope,
not a restricted one: verification needs a review by Google (usually 1 to 6 weeks), **not** the paid
CASA security assessment. Never add a restricted scope (`gmail.readonly`, `gmail.modify`…) without a
new decision: that brings CASA.

## 1. Prove we own the domain

- [ ] search.google.com/search-console → Add property → **Domain** → `tryclinton.com`.
- [ ] Google shows a `TXT` record (`google-site-verification=…`). Add it in Hostinger → DNS records (Type TXT, Name `@`). Leave it there for good.
- [ ] Click Verify (minutes to a few hours). Use the **same Google account** that owns the Cloud project.

## 2. Check the consent screen (Google Auth Platform)

- [ ] **Branding:** app name `Clinton AI`; support email; logo `brand/google-oauth-logo-120.png` (120×120); home page `https://tryclinton.com`; privacy `https://tryclinton.com/privacy`; terms `https://tryclinton.com/terms`; developer contact email.
- [ ] **Authorised domains:** `tryclinton.com`. See the Supabase note below about `supabase.co`.
- [ ] **Data access:** exactly the four scopes above, nothing else.
- [ ] **Audience:** External. Click **Publish app** (Testing → In production). This is what starts verification; until it's approved, users see the unverified warning, so keep using test users for the beta.

**Supabase note.** Sign-in returns through `mvpplxsjkmsnririkwnq.supabase.co`, so the consent screen
can say "to continue to mvpplxsjkmsnririkwnq.supabase.co", and Google may ask us to prove ownership
of that domain, which we can't. If the Verification Center or the reviewer flags it, the fix is a
Supabase **custom domain** (`auth.tryclinton.com`, a paid add-on on the Pro plan), then update the
redirect URI in Google and in Supabase. Decide when Supabase moves to Pro.

## 3. Scope justification (paste into the form)

> Clinton AI is an email safety assistant. Users write an email in Clinton AI; it checks the draft for
> mistakes, holds it for a short delay the user chooses (Smart Delay) or until a time they pick, and
> then sends it from the user's own Gmail address. We use `gmail.send` only to send the messages the
> user wrote and chose to send in Clinton AI, at the moment they asked for. We do not read, list,
> search, modify or delete any email in the user's mailbox, and we request no scope that allows it.
> The sending permission is requested in a separate "Connect Gmail" step, after sign-in, with an
> explanation of why it is needed. Users can disconnect at any time in Settings, which revokes the
> token. The refresh token is stored encrypted (Supabase Vault). Email text is held encrypted only
> until it is sent, then deleted. Our use of information received from Google APIs adheres to the
> Google API Services User Data Policy, including the Limited Use requirements.

Why a narrower scope won't do: `gmail.send` is already the narrowest scope that can send email as
the user. `gmail.compose` would also allow reading drafts.

## 4. Demo video (unlisted YouTube, 2 to 3 minutes, English)

Record the screen in one take on tryclinton.com, with the browser's **address bar visible** the whole
time. Turn on narration or captions. Steps:

1. Open `https://tryclinton.com`. Scroll briefly; show the Privacy link in the footer and open it.
2. Click **Sign in** → Continue with Google. On Google's screen, show the **address bar with
   `client_id=…`** (zoom in), the app name **Clinton AI**, and the requested permissions. Approve.
3. Onboarding → Home. Click **Connect Gmail**. Again show the address bar with the client ID and the
   consent screen listing **"Send email on your behalf"**. Approve. Say: "This is the only Gmail
   permission Clinton AI uses."
4. **Compose:** write a short email to a second address you own, with a mistake (e.g. "see attached"
   and no attachment). Show the AI check flag; click Fix it or Send anyway.
5. The email is held in the **Outbox** with a countdown; click **Send now**.
6. Switch to the second inbox: the email arrived **from your own Gmail address**. Show it in the
   sender's Gmail **Sent** folder too.
7. **Settings → Disconnect Gmail**: show that access is removed. Say: "Clinton AI never reads your
   inbox."

Upload as **Unlisted**, and paste the link in the verification form.

## 5. Submit and follow up

- [ ] Google Cloud → Google Auth Platform → **Verification Center** → fix anything listed, then submit with the video link and the justification.
- [ ] Watch the **developer contact email** daily. Google replies by email, often asking for a small change; answer in the same thread within a few days or the request closes.
- [ ] After approval: tick the launch checklist item; the 100-user test limit no longer applies.

## Things that commonly get an app sent back

- The home page doesn't explain what the app does, or the privacy link isn't on it (ours: the footer).
- The privacy policy doesn't say how Google user data is used, or lacks the Limited Use sentence (ours has it, word for word).
- The video doesn't show the client ID in the address bar, or doesn't show the scope being used.
- App name or logo on the consent screen doesn't match the website.
- Scopes in the form differ from scopes the app actually requests.
