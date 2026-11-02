"use client";

import { useCallback, useEffect, useState } from "react";
import { saveTheme } from "@/app/(app)/settings/actions";
import type { Theme } from "@/lib/validation/theme";

/** Tells every theme control on the page (Settings, the command menu) that the theme changed. */
const THEME_CHANGED = "clinton:theme";

/**
 * Switches the app's appearance at once (the root's data-theme drives color-scheme), then saves
 * it for this device. If saving fails the switch still holds until the next page load.
 */
export function useTheme(initial: Theme) {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    const sync = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener(THEME_CHANGED, sync);
    return () => window.removeEventListener(THEME_CHANGED, sync);
  }, []);

  const apply = useCallback(async (next: Theme) => {
    const root = document.querySelector<HTMLElement>("[data-theme]");
    if (root) root.dataset.theme = next;
    window.dispatchEvent(new CustomEvent(THEME_CHANGED, { detail: next }));
    return saveTheme(next);
  }, []);

  return { theme, apply };
}
