# Clinton AI: read this first

This file is the entry point for any engineer or AI agent working in this repo. It is loaded
automatically by Claude Code. Keep it short and current; the detail lives in `docs/`.

## What we are building

**Clinton AI** (tryclinton.com) is an AI email copilot: it helps people write, personalise, send
safely and follow up, inside the inbox they already use. One line: **never regret an email again.**

It starts as an email **safety layer** (Phase 1) and grows, phase by phase, into a full assistant
for everyday email and personalised outreach. Built for individuals, founders, freelancers and small
teams worldwide (not enterprises, yet).

- **Clinton AI** = the product. Always "Clinton AI" in public copy, never "Clinton" alone.
- **Clinton** = the assistant inside it ("Clinton caught 2 mistakes").
- **Unsend** = the name of the take-back feature (formerly the product name; do not use it as the brand).

Full vision: [docs/product/vision.md](docs/product/vision.md).

## Where we are now

| Phase | Name                                                                | Status                                                                    |
| ----- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 0     | Validation: waitlist, survey, founders console                      | **Live**, this codebase                                                   |
| 1     | v1 safety platform: Gmail connect, AI check, Smart Delay, Safe Send | **In progress**, see [phase plan](docs/phases/phase-1-safety-platform.md) |
| 2-8   | Outreach, extension, providers, inbox AI, mobile, agent API, teams  | Planned, [roadmap](docs/product/roadmap.md)                               |

Build **only** the current phase. Each phase opens when its gate is met. Never build ahead.

**Before any user connects Gmail or sign-ups open:** every item in
[docs/launch-checklist.md](docs/launch-checklist.md) must be done (shared rate limits, CSP, signed
Tally webhook, real founders-console auth, Sentry, plus the security review). It is a hard gate.

## Non-negotiable product rules

From [docs/product/trust-rules.md](docs/product/trust-rules.md). Code review rejects anything that breaks these:

1. **Withdraw, never edit.** A delivered message can be withdrawn, never silently changed.
2. **Always visible.** A withdrawn message tells the recipient it was withdrawn, by whom and when.
3. **Opt-in per email.** Safe Send is chosen per email, never applied to everything by default.
4. **Advise, never block.** The AI check flags; the user always decides ("Fix it" / "Send anyway").
5. **The sender's own identity.** Every email goes from the user's own address.
6. **Minimal data, short life.** Email text sent to the AI check is never stored. Safe Send content is encrypted and deleted when its window closes.
7. **Honest claims.** Never promise to delete email from someone's inbox. That is impossible and we never claim it.

## Engineering rules (summary of [docs/engineering/conventions.md](docs/engineering/conventions.md))

- **Max ~150 lines per file.** ESLint warns above 150. Split by responsibility, not by line count.
- **Content is data.** All marketing copy and sample data lives in `src/content/*.ts`, typed. Components render it; they never hard-code copy.
- **Layers:** `app/` (routes, thin) → `components/` (UI) → `lib/` (pure, isomorphic) | `server/` (server-only, DB, auth). Components never import from `server/`. Server files start with `import "server-only"`.
- **Reuse UI primitives** in `src/components/ui/` (Button, Chip, Section, StatusBadge, icons, Logo…) before writing new markup.
- **Design tokens only.** Colours, shadows and fonts come from `src/styles/tokens.css` (Tailwind `bg-brand`, `text-muted`, `shadow-card`…). No new raw hex in components.
- **Accessible by default:** semantic landmarks and headings, labels for every control, decorative visuals `aria-hidden`, keyboard support, `prefers-reduced-motion` respected. The axe test must stay green.
- **Validate at the edge:** every API body is parsed with a zod schema (`src/lib/validation/`). Every route answers `{ ok: true } | { ok: false, error }`.
- **Database access only through repositories** in `src/server/<domain>/repository.ts`.
- **Secrets never reach the browser.** Only `NEXT_PUBLIC_*` vars are public.

## Commands

```bash
npm run dev            # local dev server (http://localhost:3000)
npm run check          # typecheck + lint + format check + unit tests: run before every commit
npm run test:watch     # unit/component tests in watch mode
npm run test:e2e       # Playwright end-to-end (builds and starts the app)
npm run build          # production build
npm run db:start       # local Supabase in Docker (ports 547xx), applies migrations
npm run test:db        # pgTAP database tests (RLS + trust-rule triggers)
npm run db:types       # regenerate src/types/supabase.gen.ts after a migration
```

## Definition of done

A change is done when: `npm run check` and `npm run build` pass; new logic has tests next to it
(`*.test.ts(x)`); UI changes keep the axe test green; docs are updated if behaviour, env vars, data
model or the phase plan changed; and no trust rule is broken.

## Map

```
src/
  app/            Routes only (pages, layouts, API route handlers, metadata files)
  components/
    ui/           Design-system primitives, no business copy
    marketing/    Landing page: layout/, sections/, visuals/ (illustrations)
    waitlist/     Waitlist form + hook
    owner/        Founders console UI
    app/          Signed-in product UI (shell, sign-in, onboarding, home, gmail)
    seo/          Structured data
  content/        All marketing copy and sample data (typed)
  config/         Brand + site config (names, URLs, palette)
  lib/            Pure, isomorphic helpers (email, time, validation, browser, tally)
  server/         Server-only: env, Supabase client, auth, rate limit, repositories
  styles/         tokens.css, base.css, keyframes.css, animations.css
  types/          Shared types, including the Supabase Database type
  test/           Test setup, fixtures, axe helper
  proxy.ts        Guards /owner and /api/owner
supabase/migrations/   SQL migrations (source of truth for the schema)
e2e/                   Playwright tests
docs/                  Product and engineering documentation
```

## Docs index

- Product: [vision](docs/product/vision.md) · [features](docs/product/features.md) · [roadmap](docs/product/roadmap.md) · [trust rules](docs/product/trust-rules.md) · [brand](docs/product/brand.md) · [business](docs/product/business.md)
- Engineering: [architecture](docs/engineering/architecture.md) · [conventions](docs/engineering/conventions.md) · [testing](docs/engineering/testing.md) · [security & compliance](docs/engineering/security.md) · [environment & deploy](docs/engineering/environment.md)
- Phases: [phase 0](docs/phases/phase-0-validation.md) · [phase 1](docs/phases/phase-1-safety-platform.md)
- [Launch checklist](docs/launch-checklist.md) (hard gate before users) · [Decision log](docs/decisions.md)
