import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { ClintonMark } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { site } from "@/config/site";

// Social share card (also used by X/Twitter). Generated at build time.
export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The image renderer can't read the site's variable woff2 fonts, so it loads static Bricolage files.
const FONT_DIR = path.join(process.cwd(), "node_modules/@fontsource/bricolage-grotesque/files");
const font = (weight: 500 | 800) =>
  readFile(path.join(FONT_DIR, `bricolage-grotesque-latin-${weight}-normal.woff`));

export default async function OpengraphImage() {
  const [medium, extraBold] = await Promise.all([font(500), font(800)]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        fontFamily: "Bricolage",
        background: `radial-gradient(circle at 78% 30%, ${palette.brandLight} 0%, ${palette.brand} 42%, ${palette.brandDeep} 100%)`,
        color: palette.white,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 42,
          fontWeight: 800,
          letterSpacing: -1.5,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: palette.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ClintonMark size={44} color={palette.brand} />
        </div>
        {site.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -4, lineHeight: 0.98 }}>
          {site.tagline}
        </div>
        <div
          style={{ fontSize: 34, fontWeight: 500, color: palette.brandTint, maxWidth: 920, lineHeight: 1.3 }}
        >
          AI check before you send. Take any email back for 24 hours, even after it&apos;s opened.
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 500, color: palette.brandTint }}>{site.domain}</div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: medium, weight: 500, style: "normal" },
        { name: "Bricolage", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
