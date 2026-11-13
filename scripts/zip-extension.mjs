// Zips extension/dist for the Chrome Web Store: npm run ext:zip (builds the store version first).
// Refuses development builds and anything not pointing at https://tryclinton.com, so the wrong
// build can't be uploaded by accident. Output: extension/clinton-ai-<version>.zip (git-ignored).
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "extension/dist");
const manifest = JSON.parse(await readFile(path.join(dist, "manifest.json"), "utf8"));

const problems = [];
if (manifest.name.includes("(dev)")) problems.push("this is a development build (npm run ext:dev)");
if (JSON.stringify(manifest.host_permissions) !== JSON.stringify(["https://tryclinton.com/*"]))
  problems.push(`host permissions are ${JSON.stringify(manifest.host_permissions)}`);
const content = await readFile(path.join(dist, "content.js"), "utf8");
if (/localhost|What Clinton AI reads/.test(content)) problems.push("content.js has local or debug code");
if (problems.length) {
  console.error(`Not zipping: ${problems.join("; ")}. Run npm run ext:zip, which builds the store version.`);
  process.exit(1);
}

async function files(dir, prefix = "") {
  const out = {};
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix + entry.name;
    if (entry.isDirectory()) Object.assign(out, await files(path.join(dir, entry.name), `${rel}/`));
    else out[rel] = new Uint8Array(await readFile(path.join(dir, entry.name)));
  }
  return out;
}

const target = path.join(root, `extension/clinton-ai-${manifest.version}.zip`);
const all = await files(dist);
await writeFile(target, zipSync(all, { level: 9 }));
console.log(
  `extension/clinton-ai-${manifest.version}.zip: ${Object.keys(all).length} files, version ${manifest.version}`,
);
console.log("Upload it at https://chrome.google.com/webstore/devconsole (see docs/chrome-web-store.md).");
