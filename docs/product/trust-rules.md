# Trust rules and design principles

Email matters because people can rely on it, so Clinton AI must never weaken that trust. These rules
are **fixed for the product**. Any feature, copy or code that breaks one is rejected in review.

1. **Withdraw, never edit.** A delivered message can be withdrawn, never silently changed. There is no feature to swap a contract, price or attachment after delivery.
2. **Always visible.** A withdrawn message always tells the recipient it was withdrawn, by whom and when. Nothing disappears without a trace.
3. **Opt-in per email.** Safe Send is chosen for each email (by the user, or suggested by the AI check), never applied to everything by default.
4. **Not for permanent records.** Contracts, legal notices and anything that must stand as evidence should be sent normally. The app and FAQ say so.
5. **Advise, never block.** The AI check flags and suggests; the user always decides.
6. **The sender's own identity.** Every email goes from the user's own address, never a Clinton AI address, never "via" anything.
7. **Minimal data, short life.** Collect only what each feature needs. Safe Send content is encrypted and deleted when its window closes. Email text sent to the AI check is not stored.
8. **Recipients need nothing.** No app, account or sign-up to read a Safe Send email.
9. **No spam, ever.** Outreach is personal and low volume, with unsubscribe, daily limits and a ban on bought lists.
10. **Honest claims.** Marketing never promises to delete emails from inboxes or to do anything the product cannot do.

**Design standard.** Every screen should feel calm, premium and obvious: top-tier design quality, no
generic templates.

## How the rules show up in code

| Rule | Where it is enforced                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1, 2 | Phase 1: Safe Send has a `withdraw` action and no `update content` path; the recipient page always renders the withdrawal notice. |
| 3    | Phase 1: `safe_send` defaults to `false` on every email.                                                                          |
| 5    | AI check returns findings only; the send path never waits on user acknowledgement of a finding.                                   |
| 7    | AI check route forwards text to the model and stores only finding _types_ and counts. Safe Send expiry job deletes ciphertext.    |
| 10   | `src/content/content.test.ts` fails if copy promises deleting email from an inbox.                                                |
