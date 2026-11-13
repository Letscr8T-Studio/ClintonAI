// Builds the Chrome extension into extension/dist, ready for chrome://extensions → Load unpacked
// (or zipped for the Chrome Web Store).
//   npm run ext:build   → talks to https://tryclinton.com (store build)
//   npm run ext:dev     → talks to http://localhost:3000 (npm run dev), unminified, named "(dev)"
// CLINTON_URL=… overrides the site, e.g. a Vercel preview.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import react from "@vitejs/plugin-react";
import sharp from "sharp";
import { build } from "vite";
import { extensionManifestCopy as copy } from "../src/content/extension.ts";

const dev = process.argv.includes("--dev");
const site = (process.env.CLINTON_URL ?? (dev ? "http://localhost:3000" : "https://tryclinton.com")).replace(
  /\/+$/,
  "",
);
const root = fileURLToPath(new URL("../", import.meta.url));
const src = path.join(root, "extension/src");
const out = path.join(root, "extension/dist");
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));

await rm(out, { recursive: true, force: true });

const shared = {
  configFile: false,
  logLevel: "warn",
  publicDir: false, // the website's public/ folder isn't part of the extension
  resolve: { alias: { "@": path.join(root, "src") } },
  define: {
    __CLINTON_URL__: JSON.stringify(site),
    "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production"),
  },
};
const output = (dir) => ({
  outDir: dir,
  emptyOutDir: false,
  minify: !dev,
  sourcemap: dev ? "inline" : false,
});

// The popup page. Extension pages allow only their own scripts, which is all Vite emits.
await build({
  ...shared,
  root: path.join(src, "popup"),
  base: "./",
  plugins: [react()],
  build: output(path.join(out, "popup")),
});

// The service worker: one ES module.
await build({
  ...shared,
  build: {
    ...output(out),
    lib: { entry: path.join(src, "background.ts"), formats: ["es"], fileName: () => "background.js" },
  },
});

// Toolbar and store icons from the brand kit's app icon.
await mkdir(path.join(out, "icons"));
const sizes = [16, 32, 48, 128];
for (const size of sizes)
  await sharp(path.join(root, "brand/app-icon-1024.png"))
    .resize(size, size)
    .png()
    .toFile(path.join(out, `icons/${size}.png`));
const icons = Object.fromEntries(sizes.map((s) => [s, `icons/${s}.png`]));

const manifest = {
  manifest_version: 3,
  name: dev ? `${copy.name} (dev)` : copy.name,
  version: pkg.version,
  description: copy.description,
  icons,
  action: { default_title: copy.name, default_popup: "popup/index.html", default_icon: icons },
  background: { service_worker: "background.js", type: "module" },
  // Only the site, so the session cookie goes with our calls. mail.google.com arrives with the
  // compose integration (milestone 3). Ask for nothing more than we use: the store reviews it.
  host_permissions: [`${site}/*`],
  minimum_chrome_version: "120",
};
await writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`Built extension/dist for ${site}${dev ? " (dev)" : ""}.`);
console.log("Load it at chrome://extensions → Developer mode → Load unpacked → extension/dist");
