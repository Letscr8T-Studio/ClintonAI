import { ImageResponse } from "next/og";
import { ClintonMark } from "@/components/ui/icons";
import { palette } from "@/config/brand";

// iOS home-screen icon, drawn from the same mark geometry as icon.svg (config/logo-mark.json).
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
      <ClintonMark size={116} />
    </div>,
    size,
  );
}
