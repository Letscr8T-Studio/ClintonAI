import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { gmail } from "../gmail/selectors";
import css from "./bar.css?inline";
import { SentNote } from "./SentNote";
import type { Sent } from "./useClintonSend";

/** Our elements' tags in Gmail's page: easy to spot in DevTools, never clash with Gmail's. */
export const HOST_TAG = "clinton-ai-bar";
export const NOTE_TAG = "clinton-ai-note";

/** An element of ours with a closed shadow root, so Gmail's styles and ours never mix. */
function shadowHost(tag: string) {
  const host = document.createElement(tag);
  const shadow = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = css;
  const container = document.createElement("div");
  shadow.append(style, container);
  return { host, root: createRoot(container) };
}

/** Puts `ui` next to the compose window's Send button. Returns a function that removes it again. */
export function mountNextToSend(compose: Element, ui: ReactNode): () => void {
  const { host, root } = shadowHost(HOST_TAG);
  // Send sits in its own small group (with Gmail's schedule arrow); go just after that group.
  const group = compose.querySelector(gmail.send)?.parentElement;
  if (group && group !== compose) group.after(host);
  else compose.append(host);
  root.render(ui);
  return () => {
    root.unmount();
    host.remove();
  };
}

let note: { remove: () => void } | null = null;

/**
 * The note after Send with Clinton AI, at the bottom left of Gmail like Gmail's own notes. It
 * outlives the compose window (which closes on send); a newer note replaces it.
 */
export function showSentNote(
  sent: Sent,
  takeBack: (id: string) => Promise<boolean>,
  open: (url: string) => void,
) {
  note?.remove();
  const { host, root } = shadowHost(NOTE_TAG);
  host.style.cssText = "position:fixed;left:24px;bottom:24px;z-index:2147483000;margin:0";
  document.body.append(host);
  const remove = () => {
    root.unmount();
    host.remove();
    if (note?.remove === remove) note = null;
  };
  note = { remove };
  root.render(<SentNote sent={sent} takeBack={takeBack} open={open} onDismiss={remove} />);
}
