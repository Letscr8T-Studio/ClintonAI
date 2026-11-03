import { legalEntity as who, type LegalDoc } from "./types";

// Privacy policy. Every claim here must stay true of the code: update both together.

export const privacyPolicy: LegalDoc = {
  title: "Privacy policy",
  updated: "3 November 2026",
  intro: `${who.name} helps you write, check and send email safely from your own Gmail. This page explains what we collect, why, who helps us run the service, how long we keep things, and your rights. ${who.name} is run by ${who.operator} (${who.country}).`,
  sections: [
    {
      id: "collect",
      heading: "What we collect",
      paragraphs: ["Only what the product needs to work:"],
      list: [
        "Your account: name, email address and profile picture from Google sign-in.",
        "Gmail access: a token that lets us send email as you. We ask for send-only access (gmail.send). We cannot read your inbox.",
        "Emails you send through Clinton AI, while they wait: the text (encrypted), recipients, subject and any attachments, until the email leaves or you cancel it. Afterwards we keep only the subject, recipients, times and status, so your Outbox and Home can show them.",
        "Safe Send emails: the content, encrypted with a key of its own, for up to 24 hours. Withdrawing or the end of the 24 hours destroys the key and the file.",
        'What Clinton caught: the kinds of mistakes found (for example "wrong name"), never the text.',
        'Settings: your Smart Delay, sender name, "Likely opened" choice, and appearance (stored on your device).',
        "Waitlist: your email and, if you answer it, the survey.",
        "Basic technical data: error reports with email addresses removed, and request logs kept by our hosting provider.",
      ],
    },
    {
      id: "ai",
      heading: "The AI check and Rewrite",
      paragraphs: [
        "When you press Check & send, or ask Clinton to rewrite, the email's text is sent to our AI provider (OpenAI) to look for mistakes or rewrite it. We never store that text, and we tell the provider not to keep it for training (store: false). OpenAI may keep API requests for up to 30 days to detect abuse, then deletes them; it does not use them to train its models.",
        "The AI only advises. Nothing changes in your email unless you choose a fix.",
      ],
    },
    {
      id: "google",
      heading: "Google user data",
      paragraphs: [
        `${who.name}'s use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.`,
        "We use Gmail access only to send the emails you ask us to send, from your own address. We do not read your inbox, use your Gmail data for advertising, sell it, or let people read it, except where you ask us to for support, for security, or where the law requires. You can disconnect Gmail at any time in Settings; we then revoke the access and delete the token.",
      ],
    },
    {
      id: "tracking",
      heading: '"Likely opened" and Safe Send opens',
      paragraphs: [
        "\"Likely opened\" is off unless you turn it on. When it's on, an email you send includes a tiny invisible image; when the recipient's mail app loads it, we record that the email was probably opened, and when. We record nothing else about the recipient. It's a guess: some mail apps load images automatically, others block them.",
        "Safe Send emails count how many times each person opened their private link, without recording anything else about them. If you use these features, you are responsible for telling recipients where the law requires it.",
      ],
    },
    {
      id: "processors",
      heading: "Who helps us run Clinton AI",
      paragraphs: [
        "These providers process data for us, only to run the service, under their data protection terms:",
      ],
      list: [
        "Supabase: database, sign-in and file storage.",
        "Vercel: hosting.",
        "Google: sign-in and sending your email through Gmail.",
        "OpenAI: the AI check and Rewrite.",
        "Sentry: error reports, with email addresses removed.",
        "Tally: the waitlist survey.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep things",
      paragraphs: [
        "Email text and attachments: until the email leaves or is cancelled (attachments you didn't send: at most 24 hours). Safe Send content: at most 24 hours. Your email history (subjects, recipients, status) and account: until you delete your account. Error reports: at most 90 days. Waitlist entries: until launch, or until you ask us to remove you.",
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      paragraphs: [
        `Wherever you live, you can ask to see, correct, export or delete your data, or object to how we use it, by writing to ${who.privacyEmail}. We answer within 30 days. When we delete your account, your profile, Gmail token, email history and anything still waiting to send are removed with it. You can also complain to your data protection authority (in Nigeria, the NDPC; in the EU or UK, your national authority).`,
      ],
    },
    {
      id: "security",
      heading: "Security",
      paragraphs: [
        "Email text waiting to send is encrypted (AES-256-GCM). Gmail tokens and Safe Send keys are kept in a separate encrypted vault. Each person can only ever reach their own data. No system is perfect; if something goes wrong that affects you, we will tell you promptly.",
      ],
    },
    {
      id: "changes",
      heading: "Changes and contact",
      paragraphs: [
        `If we change this policy in a way that matters, we'll tell you in the app or by email before it applies. Questions: ${who.privacyEmail}.`,
      ],
    },
  ],
};
