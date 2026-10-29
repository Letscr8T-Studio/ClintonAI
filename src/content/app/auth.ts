// Copy for sign-in.

export const loginCopy = {
  eyebrow: "Private beta",
  title: "Sign in to Clinton AI",
  body: "Use the Google account you send email from.",
  button: "Continue with Google",
  pending: "Opening Google…",
  sharesTitle: "Signing in shares",
  shares: ["Your name", "Your email address"],
  neverTitle: "Never",
  never: ["Your inbox", "Your contacts"],
  privacy: "Permission to send email is asked for separately, later. You can revoke it any time.",
  backHome: "Back to tryclinton.com",
};

/** The story told on the sign-in stage: a mistake caught before it leaves. Decorative. */
export const signInStage = {
  kicker: "Clinton AI",
  titleStart: "Never regret",
  titleAccent: "an email again.",
  email: {
    to: "amaka@northfund.co",
    subject: "Q3 investor update",
    before: "Hi Amaka, ",
    risky: "I've attached the deck",
    after: " with our Q3 numbers. Happy to walk you through it on Friday.",
  },
  finding: { label: "Clinton caught 1 thing", text: "You mention a deck, but nothing is attached." },
  fix: "Fix it",
  ignore: "Send anyway",
  held: { label: "Held in your Outbox", from: 299 },
  trust: ["Checks your email, never stores it", "Sends from your own address", "Withdraw, never edit"],
};

/** Keys arrive as `/login?error=<key>`; anything else shows the generic message. */
export const loginErrors = {
  cancelled: "Sign-in was cancelled. Try again when you're ready.",
  callback: "We couldn't finish signing you in. Please try again.",
  oauth: "We couldn't reach Google. Please try again.",
} as const;

export type LoginErrorKey = keyof typeof loginErrors;

export function loginErrorMessage(key: unknown): string | null {
  if (typeof key !== "string") return null;
  return Object.hasOwn(loginErrors, key) ? loginErrors[key as LoginErrorKey] : loginErrors.callback;
}
