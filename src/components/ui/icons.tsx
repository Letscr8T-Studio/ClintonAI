import type { ReactNode } from "react";
import { palette } from "@/config/brand";

// Inline icons. All are decorative (aria-hidden); give the surrounding control its own label.

type IconProps = { size?: number; color?: string; className?: string };

function Svg({
  size,
  viewBox,
  className,
  children,
}: {
  size: number;
  viewBox: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

const round = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Clinton AI mark: an open "C" with a spark where the send happens. */
export function ClintonMark({ size = 18, color = palette.white, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 18 18" className={className}>
      <path d="M13.6 5.2A6 6 0 1 0 13.6 12.8" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M14.2 7.1 15 9l1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8Z" fill={color} />
    </Svg>
  );
}

export function Sparkle({ size = 14, color = palette.brandSoft, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 16 16" className={className}>
      <path
        d="M8 1.5 L9.6 6.4 L14.5 8 L9.6 9.6 L8 14.5 L6.4 9.6 L1.5 8 L6.4 6.4 Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowRight({ size = 14, color = palette.white, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 14 14" className={className}>
      <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke={color} strokeWidth={1.8} {...round} />
    </Svg>
  );
}

export function ArrowUp({ size = 14, color = palette.white, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 16 16" className={className}>
      <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke={color} strokeWidth={2} {...round} />
    </Svg>
  );
}

export function Warning({ size = 22, color = palette.amberIcon, className = "shrink-0" }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <path d="M12 3 L22 20 H2 Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <path d="M12 10v4M12 17v.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function Check({ size = 16, color = palette.white, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 16 16" className={className}>
      <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" stroke={color} strokeWidth={2.2} {...round} />
    </Svg>
  );
}

export function Menu({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 20 20" className={className}>
      <path d="M3 6h14M3 10h14M3 14h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function Close({ size = 20, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 20 20" className={className}>
      <path d="M5 5l10 10M15 5 5 15" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function Download({ size = 16, color = "currentColor", className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" stroke={color} strokeWidth={2} {...round} />
    </Svg>
  );
}
