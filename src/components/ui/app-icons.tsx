import { Svg, round } from "./icons";

// More inline icons for the signed-in app (search, theme, keyboard). Decorative, like icons.tsx.

type IconProps = { size?: number; className?: string };

export function SearchIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={1.8} />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth={1.8} {...round} />
    </Svg>
  );
}

export function SunIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.8} />
      <path
        d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
        stroke="currentColor"
        strokeWidth={1.8}
        {...round}
      />
    </Svg>
  );
}

export function MoonIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
        stroke="currentColor"
        strokeWidth={1.8}
        {...round}
      />
    </Svg>
  );
}

export function DeviceIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="4.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth={1.8} />
      <path d="M9 20h6M12 16.5V20" stroke="currentColor" strokeWidth={1.8} {...round} />
    </Svg>
  );
}

export function KeyboardIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" stroke="currentColor" strokeWidth={1.8} />
      <path
        d="M6.5 10h1M10 10h1M13.5 10h1M17 10h.5M8 14h8"
        stroke="currentColor"
        strokeWidth={1.8}
        {...round}
      />
    </Svg>
  );
}

export function PlusIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} {...round} />
    </Svg>
  );
}

export function PaperclipIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <path
        d="m20 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"
        stroke="currentColor"
        strokeWidth={1.8}
        {...round}
      />
    </Svg>
  );
}

export function ClockIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={1.8} {...round} />
    </Svg>
  );
}

export function SparkleIcon({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 3.5 13.8 9 19.5 11 13.8 13 12 18.5 10.2 13 4.5 11 10.2 9zM18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"
        stroke="currentColor"
        strokeWidth={1.6}
        {...round}
      />
    </Svg>
  );
}
