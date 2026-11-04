// Exports the brand kit to brand/: the Google consent-screen logo, social profile pictures,
// transparent marks, the logo lockup and social banners. Drawn from the same mark as the site
// (src/config/logo-mark.json) in the real brand fonts, rendered by Playwright's Chromium.
// Run: npm run brand-kit. Outputs are committed so anyone can grab them.
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";

const root = new URL("../", import.meta.url);
const out = new URL("brand/", root);
await mkdir(out, { recursive: true });

const mark = JSON.parse(await readFile(new URL("src/config/logo-mark.json", root), "utf8"));
const font = async (pkg, file) =>
  (await readFile(new URL(`node_modules/@fontsource-variable/${pkg}/files/${file}`, root))).toString(
    "base64",
  );
const display = await font("bricolage-grotesque", "bricolage-grotesque-latin-wght-normal.woff2");
const sans = await font("inter", "inter-latin-wght-normal.woff2");

const BRAND = "#2E4CF6";
const DEEP = "#2236C4";
const INK = "#11131A";
const PAPER = "#FBFBF9";
const TAGLINE = "Never regret an email again.";
const URL_TEXT = "tryclinton.com";

/** The mark alone, as inline SVG, in one colour. */
const markSvg = (size, color) => {
  const { x, y, width, height, rx } = mark.pill;
  return `<svg width="${size}" height="${size}" viewBox="${mark.viewBox}" fill="none"><path d="${mark.arc}" stroke="${color}" stroke-width="${mark.strokeWidth}" stroke-linecap="round"/><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${color}"/></svg>`;
};
/** The app-icon tile: brand blue, rounded, white mark. */
const tile = (size, radius) =>
  `<div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${BRAND};display:grid;place-items:center">${markSvg(size * 0.68, "#fff")}</div>`;
const wordmark = (px, color) =>
  `<span style="font:700 ${px}px/1 'Display';letter-spacing:-0.035em;color:${color}">Clinton AI</span>`;
const lockup = (h, color) =>
  `<div style="display:flex;align-items:center;gap:${h * 0.32}px">${tile(h, h * 0.24)}${wordmark(h * 0.72, color)}</div>`;

/** A full-bleed square for profile pictures: platforms crop to a circle, so the mark sits well inside it. */
const profile = (bg, fg) =>
  `<div style="width:100%;height:100%;background:${bg};display:grid;place-items:center">${markSvg(560, fg)}</div>`;

const banner = (w, h) => `
  <div style="width:${w}px;height:${h}px;position:relative;overflow:hidden;color:#fff;
    background:radial-gradient(60% 80% at 85% 0%, rgba(106,130,255,.55), transparent 70%),
      radial-gradient(50% 90% at 0% 100%, rgba(17,19,26,.45), transparent 70%),
      linear-gradient(160deg, ${BRAND}, ${DEEP})">
    <div style="position:absolute;inset:0;background-image:linear-gradient(to right,rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.07) 1px,transparent 1px);background-size:44px 44px"></div>
    <!-- Centred: X and LinkedIn cover the bottom-left corner with the profile picture. -->
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding-bottom:${h * 0.06}px">
      <div style="font:700 ${h * 0.17}px/1 'Display';letter-spacing:-0.045em">${TAGLINE}</div>
      <div style="margin-top:${h * 0.06}px;font:500 ${h * 0.058}px/1.3 'Sans';color:#E3E8FF">The AI email copilot that checks, holds and takes back your emails.</div>
      <div style="margin-top:${h * 0.06}px;padding:${h * 0.022}px ${h * 0.05}px;border-radius:999px;background:rgba(255,255,255,.14);font:600 ${h * 0.05}px/1 'Sans'">${URL_TEXT}</div>
    </div>
  </div>`;

const assets = [
  // Google OAuth consent screen: square, exactly 120×120, PNG, under 1 MB.
  { file: "google-oauth-logo-120.png", w: 120, h: 120, html: tile(120, 26), transparent: true },
  { file: "app-icon-1024.png", w: 1024, h: 1024, html: tile(1024, 228), transparent: true },
  { file: "profile-blue-1024.png", w: 1024, h: 1024, html: profile(BRAND, "#fff") },
  { file: "profile-blue-400.png", w: 400, h: 400, html: profile(BRAND, "#fff"), scale: 400 / 1024 },
  { file: "profile-ink-1024.png", w: 1024, h: 1024, html: profile(INK, "#fff") },
  {
    file: "mark-blue-1024.png",
    w: 1024,
    h: 1024,
    html: `<div style="display:grid;place-items:center;height:100%">${markSvg(1024, BRAND)}</div>`,
    transparent: true,
  },
  {
    file: "mark-white-1024.png",
    w: 1024,
    h: 1024,
    html: `<div style="display:grid;place-items:center;height:100%">${markSvg(1024, "#fff")}</div>`,
    transparent: true,
  },
  {
    file: "logo-on-light.png",
    w: 1400,
    h: 400,
    html: `<div style="display:grid;place-items:center;height:100%">${lockup(200, INK)}</div>`,
    transparent: true,
  },
  {
    file: "logo-on-dark.png",
    w: 1400,
    h: 400,
    html: `<div style="display:grid;place-items:center;height:100%">${lockup(200, "#fff")}</div>`,
    transparent: true,
  },
  {
    file: "logo-on-paper.png",
    w: 1400,
    h: 400,
    html: `<div style="display:grid;place-items:center;height:100%;background:${PAPER}">${lockup(200, INK)}</div>`,
  },
  { file: "banner-x-1500x500.png", w: 1500, h: 500, html: banner(1500, 500) },
  { file: "banner-linkedin-1584x396.png", w: 1584, h: 396, html: banner(1584, 396) },
];

const browser = await chromium.launch();
for (const a of assets) {
  const page = await browser.newPage({ viewport: { width: a.w, height: a.h }, deviceScaleFactor: 1 });
  const inner = a.scale
    ? `<div style="width:1024px;height:1024px;transform:scale(${a.scale});transform-origin:0 0">${a.html}</div>`
    : a.html;
  await page.setContent(`<!doctype html><html><head><style>
    @font-face{font-family:'Display';src:url(data:font/woff2;base64,${display}) format('woff2');font-weight:200 800}
    @font-face{font-family:'Sans';src:url(data:font/woff2;base64,${sans}) format('woff2');font-weight:100 900}
    html,body{margin:0;width:${a.w}px;height:${a.h}px;background:transparent;-webkit-font-smoothing:antialiased}
    body>div{width:100%;height:100%}
  </style></head><body><div>${inner}</div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: new URL(a.file, out).pathname.slice(1),
    omitBackground: Boolean(a.transparent),
  });
  await page.close();
  console.log("brand/" + a.file);
}
await browser.close();
