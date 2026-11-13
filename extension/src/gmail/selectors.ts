// Every Gmail selector in one place. Gmail's page is undocumented and changes without notice:
// when the extension stops finding or reading compose windows, fix it here and refresh the
// fixtures (the dev build's "Copy structure" button captures an anonymised one from real Gmail).
// Prefer attributes Gmail has kept for years over its generated class names.

export const RECIPIENT_KINDS = ["to", "cc", "bcc"] as const;
export type RecipientKind = (typeof RECIPIENT_KINDS)[number];

export const gmail = {
  /** The message editor of a compose window or an inline reply (g_editable is Gmail's own marker). */
  body: 'div[contenteditable="true"][g_editable="true"], div[contenteditable="true"][role="textbox"][aria-multiline="true"]',
  /** Send: its tooltip names the Enter shortcut in English; Gmail's long-lived `aoO` class covers other languages. */
  send: '[role="button"][data-tooltip*="Enter"], [role="button"].aoO',
  subject: 'input[name="subjectbox"]',
  /** Gmail's bin icon in the compose toolbar ("Discard draft (Ctrl-Shift-D)" in English; class oh). */
  discard: '[role="button"][data-tooltip^="Discard draft"], [role="button"].oh',
  /** Hidden fields Gmail keeps in step with the recipients ("Ada <ada@x.com>, bola@y.com"). */
  recipientInput: (kind: RecipientKind) => `input[name="${kind}"]`,
  /** The row holding one kind of recipient, when the hidden fields are absent. */
  recipientRow: (kind: RecipientKind) => `[name="${kind}"]:not(input)`,
  /** A recipient "chip": the address sits in one of these attributes. */
  recipientChip: '[data-hovercard-id*="@"], [email*="@"]',
  /** Earlier messages quoted under a reply or forward: never part of what the user wrote. */
  quoted: ".gmail_quote, .gmail_quote_container, blockquote",
  signature: ".gmail_signature, [data-smartmail='gmail_signature']",
  /** Files attached in Gmail itself (not readable by the extension; see the phase plan). */
  attachment: 'input[name="attach"], [download_url], [role="link"][aria-label][data-tooltip*="."]',
} as const;
