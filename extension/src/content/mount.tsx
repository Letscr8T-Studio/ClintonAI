import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { gmail } from "../gmail/selectors";
import css from "./bar.css?inline";

/** Our element's tag in Gmail's page: easy to spot in DevTools, never clashes with Gmail's. */
export const HOST_TAG = "clinton-ai-bar";

/**
 * Puts `ui` next to the compose window's Send button, inside a closed shadow root so Gmail's
 * styles and ours never mix. Returns a function that removes it again.
 */
export function mountNextToSend(compose: Element, ui: ReactNode): () => void {
  const host = document.createElement(HOST_TAG);
  const shadow = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = css;
  const container = document.createElement("div");
  shadow.append(style, container);

  // Send sits in its own small group (with Gmail's schedule arrow); go just after that group.
  const send = compose.querySelector(gmail.send);
  const group = send?.parentElement;
  if (group && group !== compose) group.after(host);
  else compose.append(host);

  const root = createRoot(container);
  root.render(ui);
  return () => {
    root.unmount();
    host.remove();
  };
}
