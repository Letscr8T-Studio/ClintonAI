# Brand

A calm, trustworthy assistant called Clinton, on tryclinton.com, in blue, navy and warm white.

## Names

- **Clinton AI:** the product name in the logo, website, app stores and marketing. Always "Clinton AI" in public, never "Clinton" alone.
- **Clinton:** the assistant inside the product ("Clinton caught 2 mistakes before you sent this", "Ask Clinton to write a follow-up").
- **Unsend:** the take-back feature ("Unsend any email for 24 hours"). It was the old product name; never use it as the brand.
- **Domain:** tryclinton.com. Social handles to secure: @tryclinton or @clintonai on Instagram, X, TikTok, LinkedIn.

In code: `src/config/site.ts` holds names, URLs and SEO copy. Change them there, nowhere else.

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

## Voice

Calm, reassuring, plain words, a little human warmth. Lead with relief ("Send without fear", "Never
regret an email again"), never with fear-mongering. Short sentences. No jargon.

## Guardrails

No political imagery, no references to the Clinton family, no political jokes. A trademark search on
"Clinton AI" for software comes before launch, because a product listed under that name already
appears online.
