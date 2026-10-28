# Decision log

Short records of decisions that shape the codebase. Newest first. Add an entry whenever you make a
choice a future engineer might question. Format: date, decision, why, consequences.

## 2026-10-28: Rebrand to Clinton AI and production restructure

- **Decision:** The product is Clinton AI (tryclinton.com). "Unsend" becomes the take-back feature name. Codebase restructured into `src/` with layers `app → components → content/config/lib/types` and `app → server`.
- **Why:** The product grew from a single feature into a seven-pillar email copilot; the code needed to scale phase by phase with many contributors and AI agents.
- **Consequences:** Founders console cookie renamed (`clinton_owner`): founders sign in again once. Waitlist "already joined" flag moved to `clinton-waitlist-email`; the old `unsend-waitlist-email` key is still read. Old `favicon.ico`/`apple-icon.png` replaced with the Clinton AI mark (`icon.svg`, generated `apple-icon`).

## 2026-10-28: Content lives in `src/content/`

- **Decision:** All marketing copy and sample data are typed TS modules, not JSX literals and not a CMS.
- **Why:** One place to edit copy; type-checked; testable (anchors, duplicates, banned claims). A CMS is premature at this stage.
- **Consequences:** Components take data from content files. Revisit a CMS when non-engineers edit copy weekly.

## 2026-10-28: Testing stack

- **Decision:** Vitest + Testing Library + axe-core for unit/component/a11y; Playwright for e2e; GitHub Actions CI.
- **Why:** Fast, ESM-native, works with React 19 and Next 16; axe gives an objective accessibility gate.

## 2026-10-28: Validation with zod at every boundary

- **Decision:** API bodies and server env are parsed with zod 4.
- **Consequences:** In zod 4, keys using `z.unknown().transform()` must add `.optional()` first, or a missing key fails with a generic error (see `src/lib/validation/waitlist.ts`).

## 2026-10-28: Analytics "vs prior week" fix

- **Decision:** `prev7` now compares the last 7 days with days 7-13 ago. Previously it compared with days 14-20 ago.
- **Consequences:** The console's "Last 7 days" change badge may show different numbers than before. Covered by `analytics.test.ts`.

## 2026-10-23: Supabase + service-role-only access for the waitlist

- **Decision:** Waitlist table has RLS with no policies; only server routes (service role) access it.
- **Why:** Nobody can read the list from the browser.

## 2026-10-23: Founders console with shared password

- **Decision:** Env-configured allow-list + shared password + signed cookie.
- **Why:** Fastest safe option before the product has its own auth. Replace with Supabase Auth in Phase 1.
