// The command menu (Ctrl/Cmd + K), keyboard shortcuts, and the phone's Write button.

import { appRoutes } from "@/config/routes";
import type { Theme } from "@/lib/validation/theme";

export type CommandGroup = "actions" | "go" | "theme";

export type Command = {
  id: string;
  group: CommandGroup;
  label: string;
  /** Extra words people might type for it. */
  keywords?: string;
  /** Shown as key caps; the same keys work outside the menu. */
  keys?: string[];
  href?: string;
  theme?: Theme;
  shortcuts?: true;
};

export const commands: Command[] = [
  {
    id: "compose",
    group: "actions",
    label: "Write an email",
    keywords: "new compose send",
    keys: ["C"],
    href: appRoutes.compose,
  },
  {
    id: "delay",
    group: "actions",
    label: "Change Smart Delay",
    keywords: "minutes wait hold",
    href: `${appRoutes.settings}#smart-delay`,
  },
  {
    id: "shortcuts",
    group: "actions",
    label: "Keyboard shortcuts",
    keywords: "keys help",
    keys: ["?"],
    shortcuts: true,
  },
  {
    id: "home",
    group: "go",
    label: "Home",
    keywords: "dashboard stats",
    keys: ["G", "H"],
    href: appRoutes.home,
  },
  {
    id: "outbox",
    group: "go",
    label: "Outbox",
    keywords: "waiting sent cancel withdraw",
    keys: ["G", "O"],
    href: appRoutes.outbox,
  },
  {
    id: "settings",
    group: "go",
    label: "Settings",
    keywords: "account gmail name",
    keys: ["G", "S"],
    href: appRoutes.settings,
  },
  {
    id: "theme-system",
    group: "theme",
    label: "Match this device",
    keywords: "theme system auto",
    theme: "system",
  },
  { id: "theme-light", group: "theme", label: "Light theme", keywords: "appearance day", theme: "light" },
  { id: "theme-dark", group: "theme", label: "Dark theme", keywords: "appearance night", theme: "dark" },
];

export const commandsCopy = {
  open: "Search or jump to…",
  label: "Command menu",
  placeholder: "Type a command or a page…",
  inputLabel: "Search commands",
  empty: "Nothing matches that.",
  current: "Current",
  groups: { actions: "Actions", go: "Go to", theme: "Appearance" } satisfies Record<CommandGroup, string>,
  hintKeys: ["Ctrl", "K"],
  then: "then",
  shortcutsTitle: "Keyboard shortcuts",
  shortcutsBody: "Shortcuts work anywhere except while you're typing in a field.",
  /** Shortcuts that aren't commands. */
  extraShortcuts: [
    { keys: ["Ctrl", "K"], label: "Open the command menu" },
    { keys: ["/"], label: "Open the command menu" },
    { keys: ["Ctrl", "Enter"], label: "Check & send, in Compose" },
    { keys: ["Esc"], label: "Close a menu or Clinton's note" },
  ],
  close: "Close",
  write: "Write",
  writeLabel: "Write an email",
};
