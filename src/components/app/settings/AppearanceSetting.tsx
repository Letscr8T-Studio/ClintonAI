"use client";

import { useState, useTransition, type ComponentType } from "react";
import { useTheme } from "@/components/app/shell/useTheme";
import { DeviceIcon, MoonIcon, SunIcon } from "@/components/ui/app-icons";
import { palette } from "@/config/brand";
import { settingsCopy } from "@/content/app/settings";
import { cn } from "@/lib/cn";
import { THEMES, type Theme } from "@/lib/validation/theme";
import { SaveStatus, type SaveState } from "./SaveStatus";

const copy = settingsCopy.appearance;
const icons: Record<Theme, ComponentType<{ size?: number }>> = {
  system: DeviceIcon,
  light: SunIcon,
  dark: MoonIcon,
};

/** A small picture of the app in each theme, so the choice is seen, not just read. */
function Preview({ theme }: { theme: Theme }) {
  // Fixed colours: the page's tokens follow the current theme, the preview must not.
  const half = (scheme: "light" | "dark") => {
    const line = { background: scheme === "dark" ? palette.darkLine : palette.line };
    return (
      <span
        style={{ background: scheme === "dark" ? palette.darkPaper : palette.warmWhite }}
        className="flex flex-1 flex-col gap-1.5 p-2.5"
      >
        <span className="h-1.5 w-8 rounded-full bg-brand" />
        <span style={line} className="h-1.5 w-full rounded-full" />
        <span style={line} className="h-1.5 w-2/3 rounded-full" />
      </span>
    );
  };
  return (
    <span aria-hidden="true" className="flex h-16 overflow-hidden rounded-xl border border-line">
      {theme === "dark" ? half("dark") : half("light")}
      {theme === "system" ? half("dark") : null}
    </span>
  );
}

/** Device / Light / Dark: switches straight away and saves for this device. */
export function AppearanceSetting({ initialTheme }: { initialTheme: Theme }) {
  const { theme, apply } = useTheme(initialTheme);
  const [status, setStatus] = useState<SaveState>({ kind: "idle" });
  const [, startTransition] = useTransition();

  const choose = (next: Theme) =>
    startTransition(async () => {
      const result = await apply(next);
      setStatus(result.ok ? { kind: "saved", text: copy.saved } : { kind: "error", text: result.error });
    });

  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="sr-only">{copy.legend}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {THEMES.map((t) => {
          const Icon = icons[t];
          const option = copy.options[t];
          return (
            <label
              key={t}
              className={cn(
                "flex cursor-pointer flex-col gap-3 rounded-2xl border bg-surface p-3 transition-colors",
                "has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-brand",
                theme === t ? "border-brand shadow-cta" : "border-line hover:border-brand-mist",
              )}
            >
              <input
                type="radio"
                name="theme"
                value={t}
                checked={theme === t}
                onChange={() => choose(t)}
                className="sr-only"
              />
              <Preview theme={t} />
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon size={16} />
                {option.label}
                <span className="ml-auto text-xs font-normal text-muted">{option.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
      <SaveStatus state={status} savingText="" />
    </fieldset>
  );
}
