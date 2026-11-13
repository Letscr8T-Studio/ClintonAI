import { useEffect, useState } from "react";
import { readCompose, type GmailDraft } from "../gmail/compose";

/**
 * The email in one compose window, re-read shortly after anything in that window changes (typing,
 * a recipient added, the subject edited). Read in the page only: nothing leaves the browser here.
 */
export function useDraft(compose: Element, delayMs = 400): GmailDraft {
  const [draft, setDraft] = useState(() => readCompose(compose));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reread = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setDraft(readCompose(compose)), delayMs);
    };
    // Inputs don't report typed values as DOM changes, so listen for input events too.
    const observer = new MutationObserver(reread);
    observer.observe(compose, { childList: true, subtree: true, characterData: true, attributes: true });
    compose.addEventListener("input", reread);
    return () => {
      observer.disconnect();
      compose.removeEventListener("input", reread);
      clearTimeout(timer);
    };
  }, [compose, delayMs]);

  return draft;
}
