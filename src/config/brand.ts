import mark from "./logo-mark.json";

/** Geometry of the "Held C" mark (24-unit grid). Edit logo-mark.json, then run `npm run icons`. */
export const logoMark = {
  viewBox: mark.viewBox,
  arc: mark.arc,
  strokeWidth: mark.strokeWidth,
  pill: mark.pill,
};

// Brand palette as hex values, for places CSS tokens can't reach (SVG attributes,
// the generated Open Graph image). Mirrors src/styles/tokens.css; change both together.

export const palette = {
  brand: "#2E4CF6",
  brandLight: "#6A82FF",
  brandDeep: "#2236C4",
  brandSoft: "#8EA0FF",
  brandTint: "#E8ECFF",
  navy: "#11131A",
  warmWhite: "#F7F6F2",
  cream: "#FFFEFB",
  white: "#FFFFFF",
  amberIcon: "#9A6A00",
  amberDot: "#E0A800",
} as const;

/** Google's own logo colours, required unchanged by its sign-in branding guidelines. */
export const googleColors = {
  blue: "#4285F4",
  green: "#34A853",
  yellow: "#FBBC05",
  red: "#EA4335",
} as const;
