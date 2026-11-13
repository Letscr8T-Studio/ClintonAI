import { findComposeWindows } from "./compose";

/** Called when a compose window opens; returns what to do when it closes. */
export type OnCompose = (compose: Element) => () => void;

/**
 * Watches Gmail for compose windows opening and closing. Gmail changes the page constantly, so
 * changes are batched: at most one scan per `delayMs`. Returns a function that stops watching.
 */
export function watchComposeWindows(root: Element, onOpen: OnCompose, delayMs = 250): () => void {
  const open = new Map<Element, () => void>();

  const scan = () => {
    for (const compose of findComposeWindows(root))
      if (!open.has(compose)) open.set(compose, onOpen(compose));
    for (const [compose, close] of open)
      if (!compose.isConnected || !root.contains(compose)) {
        close();
        open.delete(compose);
      }
  };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const observer = new MutationObserver(() => {
    timer ??= setTimeout(() => {
      timer = undefined;
      scan();
    }, delayMs);
  });
  observer.observe(root, { childList: true, subtree: true });
  scan();

  return () => {
    observer.disconnect();
    clearTimeout(timer);
    open.forEach((close) => close());
    open.clear();
  };
}
