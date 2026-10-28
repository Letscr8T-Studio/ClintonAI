import { ImageResponse } from "next/og";
import { palette } from "@/config/brand";

// iOS home-screen icon, drawn from the same mark as icon.svg.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: palette.brand,
      }}
    >
      <svg width="112" height="112" viewBox="0 0 18 18" fill="none">
        <path
          d="M13.6 5.2A6 6 0 1 0 13.6 12.8"
          stroke={palette.white}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M14.2 7.1 15 9l1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8Z" fill={palette.white} />
      </svg>
    </div>,
    size,
  );
}
