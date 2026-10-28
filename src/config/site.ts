// Single source of truth for brand names, URLs and SEO copy.
// Naming rules (docs/product/brand.md): "Clinton AI" is the product, "Clinton" is the
// assistant inside it, "Unsend" is the take-back feature. Never "Clinton" alone in public copy.

export const site = {
  name: "Clinton AI",
  assistant: "Clinton",
  takeBackFeature: "Unsend",
  domain: "tryclinton.com",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryclinton.com").replace(/\/$/, ""),
  appHost: "app.tryclinton.com",
  tagline: "Never regret an email again.",
  title: "Clinton AI: never regret an email again",
  description:
    "Clinton AI is the AI email copilot that checks every email for mistakes, holds it while you think, and lets you take it back for 24 hours, even after it's opened.",
  shortDescription:
    "Your AI for email. Catch mistakes, take emails back, and soon write and follow up for you.",
  keywords: [
    "Clinton AI",
    "AI email assistant",
    "unsend email",
    "recall email",
    "undo send Gmail",
    "email mistakes",
    "Safe Send",
    "Smart Delay",
    "personalised outreach",
  ],
  themeColor: "#2E4CF6",
  backgroundColor: "#FBFBF9",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
