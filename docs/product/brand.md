# Brand

A calm, trustworthy assistant called Clinton, on tryclinton.com, in blue, navy and warm white.

## Names

- **Clinton AI:** the product name in the logo, website, app stores and marketing. Always "Clinton AI" in public, never "Clinton" alone.
- **Clinton:** the assistant inside the product ("Clinton caught 2 mistakes before you sent this", "Ask Clinton to write a follow-up").
- **Unsend:** the take-back feature ("Unsend any email for 24 hours"). It was the old product name; never use it as the brand.
- **Domain:** tryclinton.com. Social handles to secure: @tryclinton or @clintonai on Instagram, X, TikTok, LinkedIn.

In code: `src/config/site.ts` holds names, URLs and SEO copy. Change them there, nowhere else.

## Logo

- **Mark: the "Held C".** A heavy, round-capped C holding a solid pill in its mouth: the email that waits a moment before it goes (Smart Delay), with the C as Clinton. It is deliberately not an AI sparkle (the category's most overused symbol) and not an arrow (reads as a browser reload button at tab size).
- **Lockup:** the mark in a rounded brand-blue tile, then **"Clinton AI"** in Bricolage Grotesque ExtraBold, one typeface, no pill or badge. On blue backgrounds: white tile, blue mark, white wordmark.
- **Single source:** the geometry lives in `src/config/logo-mark.json`. The React `<ClintonMark>`/`<Logo>`, the iOS icon and the social card read it; `npm run icons` regenerates `src/app/icon.svg` and `src/app/favicon.ico` (16/32/48 px, tighter tile at 16 px). Never hand-edit those two files.
- **Clinton's symbol is the Held C, never an AI sparkle.** Wherever Clinton acts (the Check & send button, the
  Clinton panel, "Clinton caught…" cards, marketing visuals), use `<ClintonMark>`. The generic four-point sparkle
  was removed from the icon kit on purpose; don't add it back.
- **Don't:** recolour the mark outside the palette, add effects or gradients to it, separate the pill from the C, or set the wordmark in another font.
- **Motion idea (later):** the pill slides out of the C when an email sends.

## Palette

| Token      | Value                | Use                           | Tailwind                 |
| ---------- | -------------------- | ----------------------------- | ------------------------ |
| Brand blue | `#2E4CF6`            | Primary buttons, accents      | `bg-brand`, `text-brand` |
| Light blue | `#6A82FF`            | Gradients, highlights on dark | `brand-light`            |
| Deep blue  | `#2236C4`            | Hover states, gradients       | `brand-deep`             |
| Navy       | `#11131A`            | Text, dark panels             | `ink`                    |
| Warm white | `#F7F6F2`, `#FFFEFB` | Backgrounds, cards            | `paper`, `cream`         |
| Blue tint  | `#E8ECFF`            | Tags, soft panels             | `brand-tint`             |

The full token set (greys, amber warnings, danger, shadows) is in `src/styles/tokens.css`. Hex copies
for SVG and generated images are in `src/config/brand.ts`; keep the two in sync.

## Type

Bricolage Grotesque for headings (`font-display`), Inter for body (`font-sans`), JetBrains Mono for
labels and timers (`font-mono`). All self-hosted via `@fontsource-variable`; no Google Fonts requests.

## Product surfaces (sign-in, onboarding, app)

The product should feel as crafted as the landing page, never like a generic form.

- **Stages.** Illustrations sit on one of three panels (`src/styles/app.css`, `VisualStage`): `stage-brand` (deep blue with a faint grid and a light bloom), `bg-ink` (navy, for timers and focus), `bg-brand-wash` (light). Pages use `stage-paper` (warm paper with a brand glow).
- **Show, don't list.** Every feature is explained by a live mock of the product doing it: the highlighter sweeping a risky phrase, the amber finding popping in, the Smart Delay ring counting down, the recipient page reading "withdrawn". Sample data lives in `src/content/app/`.
- **Type scale.** Big Bricolage headlines (up to 72px, tight tracking) with the second line in brand blue; mono uppercase for eyebrows, step numbers and timers.
- **Motion.** `cl-rise`, `cl-pop`, `cl-slide`, `cl-mark`, `cl-ring` choreograph a page on load (staggered with `animationDelay`). All motion stops for `prefers-reduced-motion`; the final frame always reads on its own.
- **Controls.** Primary actions are large (56-64px), rounded-2xl, with a lift on hover. Choices are tiles, not bare radio buttons, but always native inputs underneath.

## Voice

Calm, reassuring, plain words, a little human warmth. Lead with relief ("Send without fear", "Never
regret an email again"), never with fear-mongering. Short sentences. No jargon.

## Guardrails

No political imagery, no references to the Clinton family, no political jokes. A trademark search on
"Clinton AI" for software comes before launch, because a product listed under that name already
appears online.
