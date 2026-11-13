// Chrome Web Store images, into brand/store/: the small promo tile (440×280), the marquee
// (1400×560) and 1280×800 screenshots. The popup is rendered from the built extension with sample
// data. Gmail screenshots must be real: put them in private/store/ (gmail-check.png,
// gmail-send.png, gmail-sent.png) and they are framed with a caption; missing ones are skipped.
// Run: npm run store-assets
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { popupImage } from "./store-popup.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "brand/store");
const dist = path.join(root, "extension/dist");
await mkdir(out, { recursive: true });

const mark = JSON.parse(await readFile(path.join(root, "src/config/logo-mark.json"), "utf8"));
const font = async (pkg, file) =>
  (await readFile(path.join(root, `node_modules/@fontsource-variable/${pkg}/files/${file}`))).toString(
    "base64",
  );
const display = await font("bricolage-grotesque", "bricolage-grotesque-latin-wght-normal.woff2");
const sans = await font("inter", "inter-latin-wght-normal.woff2");
const BRAND = "#2E4CF6";
const DEEP = "#2236C4";

const markSvg = (size, color = "#fff") =>
  `<svg width="${size}" height="${size}" viewBox="${mark.viewBox}" fill="none"><path d="${mark.arc}" stroke="${color}" stroke-width="${mark.strokeWidth}" stroke-linecap="round"/><rect x="${mark.pill.x}" y="${mark.pill.y}" width="${mark.pill.width}" height="${mark.pill.height}" rx="${mark.pill.rx}" fill="${color}"/></svg>`;
const lockup = (h) =>
  `<div style="display:flex;align-items:center;gap:${h * 0.3}px"><div style="width:${h}px;height:${h}px;border-radius:${h * 0.24}px;background:#fff;display:grid;place-items:center">${markSvg(h * 0.68, BRAND)}</div><span style="font:700 ${h * 0.7}px/1 Display;letter-spacing:-0.035em">Clinton AI</span></div>`;
const backdrop = `background:radial-gradient(60% 80% at 85% 0%,rgba(106,130,255,.55),transparent 70%),linear-gradient(160deg,${BRAND},${DEEP});color:#fff`;

/** A brand slide: caption on the left, an image (data URL) on the right. */
const slide = (title, body, image, imageWidth) => `
  <div style="width:1280px;height:800px;${backdrop};display:flex;align-items:center;gap:64px;padding:0 72px;box-sizing:border-box">
    <div style="flex:0 0 380px">${lockup(44)}
      <h1 style="margin:40px 0 0;font:700 52px/1.05 Display;letter-spacing:-0.04em">${title}</h1>
      <p style="margin:20px 0 0;font:400 20px/1.5 Sans;color:#E3E8FF">${body}</p></div>
    <img src="${image}" style="display:block;width:auto;height:auto;max-width:${imageWidth}px;max-height:680px;border-radius:18px;box-shadow:0 30px 80px rgba(10,16,60,.45)">
  </div>`;

const browser = await chromium.launch();

async function shoot(file, w, h, html) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face{font-family:Display;src:url(data:font/woff2;base64,${display}) format('woff2');font-weight:200 800}
    @font-face{font-family:Sans;src:url(data:font/woff2;base64,${sans}) format('woff2');font-weight:100 900}
    html,body{margin:0}</style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, file) });
  await page.close();
  console.log(`brand/store/${file}`);
}

const tagline = "Never regret an email again.";
await shoot(
  "promo-small-440x280.png",
  440,
  280,
  `<div style="width:440px;height:280px;${backdrop};display:flex;flex-direction:column;justify-content:center;padding:0 36px;box-sizing:border-box">${lockup(40)}<div style="margin-top:22px;font:700 30px/1.1 Display;letter-spacing:-0.035em">The AI check,<br>inside Gmail.</div></div>`,
);
await shoot(
  "marquee-1400x560.png",
  1400,
  560,
  `<div style="width:1400px;height:560px;${backdrop};display:flex;flex-direction:column;justify-content:center;padding:0 110px;box-sizing:border-box">${lockup(56)}<div style="margin-top:34px;font:700 72px/1.05 Display;letter-spacing:-0.045em">${tagline}</div><div style="margin-top:22px;font:400 24px/1.5 Sans;color:#E3E8FF">Catch mistakes as you write in Gmail. Send with a delay, later, or so you can take it back.</div></div>`,
);
await shoot(
  "screenshot-4-popup-outbox.png",
  1280,
  800,
  slide(
    "Your Outbox, one click away.",
    "See what's about to leave. Send it now, cancel it, or withdraw a Safe Send, right from Chrome's toolbar.",
    await popupImage(browser, dist),
    380,
  ),
);

const real = [
  [
    "gmail-check.png",
    "screenshot-1-check.png",
    "Catches mistakes as you write.",
    "Wrong names, missing attachments, wrong dates, harsh tone: highlighted right in Gmail, with a one-click fix.",
  ],
  [
    "gmail-send.png",
    "screenshot-2-send.png",
    "Send it the safe way.",
    "Smart Delay, Send later and Safe Send, from your own Gmail address. Gmail's Send still works as usual.",
  ],
  [
    "gmail-sent.png",
    "screenshot-3-undo.png",
    "Changed your mind? Undo.",
    "Every email waits in your Outbox first, and Safe Send emails can be withdrawn for 24 hours.",
  ],
];
for (const [source, file, title, body] of real) {
  const from = path.join(root, "private/store", source);
  if (!(await stat(from).catch(() => null))) {
    console.log(`(skipped ${file}: add a real Gmail screenshot at private/store/${source})`);
    continue;
  }
  const image = `data:image/png;base64,${(await readFile(from)).toString("base64")}`;
  await shoot(file, 1280, 800, slide(title, body, image, 700));
}
await browser.close();
