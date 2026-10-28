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
