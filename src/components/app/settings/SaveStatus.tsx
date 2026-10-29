import { cn } from "@/lib/cn";

export type SaveState =
  { kind: "idle" } | { kind: "saving" } | { kind: "saved"; text: string } | { kind: "error"; text: string };

/** Announces saving / saved / failed politely, without moving focus. */
export function SaveStatus({ state, savingText }: { state: SaveState; savingText: string }) {
  const text = state.kind === "saving" ? savingText : state.kind === "idle" ? "" : state.text;
  return (
    <p
      role={state.kind === "error" ? "alert" : "status"}
      className={cn(
        "m-0 min-h-5 text-sm font-medium",
        state.kind === "error" ? "text-danger" : state.kind === "saved" ? "text-brand-deep" : "text-muted",
      )}
    >
      {text}
    </p>
  );
}
