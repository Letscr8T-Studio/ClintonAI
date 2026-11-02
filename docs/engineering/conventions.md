# Code conventions

The goal: any engineer or AI agent can open any file and understand it in one read.

## Size and shape

- **One responsibility per file; aim for ≤150 lines.** ESLint `max-lines` warns above 150 (blank lines and comments excluded). Going over needs a reason in review.
- Split a large component by meaning: section → card → visual. Split a large module by concern: repository (I/O) vs pure logic.
- Named exports everywhere. Default exports only where Next.js requires them (`page`, `layout`, `error`, `loading`, metadata files).
- File names: React components `PascalCase.tsx`; everything else `kebab-case.ts`. Tests sit next to the code: `thing.test.ts(x)`.

## Separation of concerns

| Put this…                            | …here                                                                |
| ------------------------------------ | -------------------------------------------------------------------- |
| Copy, labels, sample data, nav items | `src/content/<area>.ts` (typed, `satisfies` where useful)            |
| Brand names, URLs, SEO text          | `src/config/site.ts`                                                 |
| Colours, shadows, fonts              | `src/styles/tokens.css` (`light-dark()` pairs; `theme.css` for dark) |
| Reusable UI                          | `src/components/ui/`                                                 |
| Feature UI                           | `src/components/<feature>/`                                          |
| Client state + side effects          | a `useX` hook beside the component                                   |
| Pure logic                           | `src/lib/` (isomorphic) or a pure file in `src/server/<domain>/`     |
| Database access                      | `src/server/<domain>/repository.ts` only                             |
| Request schemas                      | `src/lib/validation/<domain>.ts` (zod)                               |
| Env access                           | `src/server/env.ts` (validated), never raw `process.env` in features |

## DRY

- Use `cn()` for conditional classes, `buttonStyles()` / `<Button>` / `<ButtonLink>` for anything clickable, `<Chip>` for labels, `<Section>` + `<SectionHeading>` for page sections, `<StatusBadge>` for live/soon.
- Map data to components through registries (`platformVisuals`, `stepVisuals`) instead of `switch` blocks in JSX.
- Section anchors come from `sectionIds` in `content/navigation.ts`; never type `"#faq"` by hand.

## React and Next.js

- Server Components by default. Add `"use client"` only for state, effects or browser APIs, and keep client components small.
- No `setState` inside `useEffect` to mirror external data; use `useSyncExternalStore` (see `useWaitlist`).
- Route handlers: `parseJson(request, schema)` → domain call → `ok()` / `fail(message, status)`. Log with a `[area]` prefix; never return internal error text to clients.
- Console pages throw on data errors and let `error.tsx` render; don't repeat try/catch UI per page.
- Use `next/link` for app routes, plain `<a>` for in-page anchors and file downloads.

## Accessibility (WCAG 2.2 AA)

- One `h1` per page; headings in order; every `<section>` labelled (`labelledBy` or `label`).
- Every input has a label (visible or `sr-only`). Errors use `role="alert"` and `aria-describedby`.
- Interactive disclosure: `button` + `aria-expanded` + `aria-controls`; Escape closes and returns focus.
- Decorative illustrations are `aria-hidden`; illustrations that carry meaning are `role="img"` with an `aria-label`.
- Symbols (✓ ✕ → ↑) get a text alternative or `aria-hidden`.
- Motion respects `prefers-reduced-motion` (handled centrally in `styles/animations.css`).
- Touch targets ≥ 44px. Keyboard focus is always visible (`:focus-visible` outline in `base.css`).

## TypeScript

Strict mode. `import type` for types (lint-enforced). No `any`; use `unknown` and narrow. Prefer
`satisfies` over annotations on content objects so literal types survive.

## Formatting and linting

Prettier (with the Tailwind plugin, which sorts classes) and ESLint (`eslint-config-next`: React, hooks,
jsx-a11y, Next rules). `npm run check` must pass before every commit.

## Git

Small commits with conventional prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
Branch from `main`; open a PR; CI must be green.
