import { ImageResponse } from "next/og";
import { palette } from "@/config/brand";
import { site } from "@/config/site";

// Social share card (also used by X/Twitter). Generated at build time.
export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: `radial-gradient(circle at 78% 30%, ${palette.brandLight} 0%, ${palette.brand} 42%, ${palette.brandDeep} 100%)`,
        color: palette.white,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 800 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: palette.white,
            color: palette.brand,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          C
        </div>
        {site.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>{site.tagline}</div>
        <div style={{ fontSize: 32, color: palette.brandTint, maxWidth: 900 }}>
          AI check before you send. Take any email back for 24 hours, even after it&apos;s opened.
        </div>
      </div>
      <div style={{ fontSize: 26, color: palette.brandTint }}>{site.domain}</div>
    </div>,
    size,
  );
}
