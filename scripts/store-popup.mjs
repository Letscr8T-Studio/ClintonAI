// For store-assets.mjs: the built extension popup, rendered with sample data. A stand-in
// chrome.runtime answers its messages, so no account or server is needed.
import { readFile } from "node:fs/promises";
import path from "node:path";

const soon = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString();
const sample = {
  account: {
    kind: "ready",
    me: {
      ok: true,
      email: "preye@gmail.com",
      name: "Preye Omusuku",
      gmail: { email: "preye@gmail.com", status: "active" },
      defaultDelaySeconds: 300,
    },
  },
  outbox: {
    kind: "ok",
    emails: [
      {
        id: "a",
        subject: "Seed round: Sunday at 11",
        to: ["kemi@northstar.vc"],
        kind: "waiting",
        until: soon(4.2),
        scheduled: false,
        safeSendMessageId: null,
      },
      {
        id: "b",
        subject: "Contract v3 (signed)",
        to: ["tunde@client.co"],
        kind: "withdrawable",
        until: soon(1100),
        scheduled: false,
        safeSendMessageId: "m",
      },
    ],
  },
};
const TYPES = { ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };

/** A PNG (data URL) of the popup in `dist`, at twice the size for a sharp screenshot. */
export async function popupImage(browser, dist) {
  const page = await browser.newPage({ viewport: { width: 320, height: 600 }, deviceScaleFactor: 2 });
  await page.addInitScript((answers) => {
    window.chrome = { runtime: { sendMessage: async (m) => answers[m.type] }, tabs: { create: () => {} } };
  }, sample);
  await page.route("http://popup.local/**", async (route) => {
    const file = path.join(dist, "popup", new URL(route.request().url()).pathname);
    await route.fulfill({
      body: await readFile(file),
      contentType: TYPES[path.extname(file)] ?? "text/html",
    });
  });
  await page.goto("http://popup.local/index.html");
  await page.getByText("Contract v3 (signed)").waitFor();
  await page.evaluate(() => document.fonts.ready);
  const png = await page.locator("main").screenshot();
  await page.close();
  return `data:image/png;base64,${png.toString("base64")}`;
}
