// Opens the Tally priority-access survey as a popup. Docs: https://tally.so/help/developer-resources

type TallyPopupOptions = {
  layout?: "default" | "modal";
  width?: number;
  overlay?: boolean;
  hiddenFields?: Record<string, string>;
  onSubmit?: (payload: unknown) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: TallyPopupOptions) => void;
      closePopup: (formId: string) => void;
    };
  }
}

export const TALLY_FORM_ID = process.env.NEXT_PUBLIC_TALLY_FORM_ID ?? "";
export const TALLY_SCRIPT_SRC = "https://tally.so/widgets/embed.js";

export function openSurvey(email: string, onSubmit?: () => void): void {
  if (!TALLY_FORM_ID) {
    console.warn("NEXT_PUBLIC_TALLY_FORM_ID is not set, so the survey can't open.");
    return;
  }

  if (window.Tally) {
    window.Tally.openPopup(TALLY_FORM_ID, {
      layout: "modal",
      width: 640,
      overlay: true,
      hiddenFields: { email },
      onSubmit: () => onSubmit?.(),
    });
    return;
  }

  // The script hasn't loaded (slow network, ad blocker): open the form in a new tab instead.
  const url = `https://tally.so/r/${TALLY_FORM_ID}?email=${encodeURIComponent(email)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
