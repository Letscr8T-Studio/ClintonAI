// Builds src/app/icon.svg and src/app/favicon.ico from src/config/logo-mark.json.
// Run after changing the mark: `npm run icons`. Outputs are committed.
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const mark = JSON.parse(await readFile(new URL("src/config/logo-mark.json", root), "utf8"));
const BRAND = "#2E4CF6";

/** Brand tile with the white mark. `inset` is the share of the tile the mark fills. */
function tileSvg({ size, radius, inset }) {
  const markSize = +(size * inset).toFixed(2);
  const offset = +((size - markSize) / 2).toFixed(2);
  const { x, y, width, height, rx } = mark.pill;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND}"/><svg x="${offset}" y="${offset}" width="${markSize}" height="${markSize}" viewBox="${mark.viewBox}" fill="none"><path d="${mark.arc}" stroke="#fff" stroke-width="${mark.strokeWidth}" stroke-linecap="round"/><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="#fff"/></svg></svg>`;
}

/** Packs PNG images into one .ico file (PNG-in-ICO, supported by every current browser). */
function toIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

await writeFile(new URL("src/app/icon.svg", root), `${tileSvg({ size: 64, radius: 15, inset: 0.68 })}\n`);

// Small sizes get a tighter tile and a bigger mark so the C and the pill stay distinct at 16px.
const sizes = [
  { size: 16, radius: 3.5, inset: 0.8 },
  { size: 32, radius: 7, inset: 0.74 },
  { size: 48, radius: 11, inset: 0.7 },
];
const images = await Promise.all(
  sizes.map(async (s) => ({
    size: s.size,
    png: await sharp(Buffer.from(tileSvg(s)))
      .png()
      .toBuffer(),
  })),
);
await writeFile(new URL("src/app/favicon.ico", root), toIco(images));

console.log("Wrote src/app/icon.svg and src/app/favicon.ico (16, 32, 48)");
