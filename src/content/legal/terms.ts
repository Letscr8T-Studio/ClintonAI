import { legalEntity as who, type LegalDoc } from "./types";

// Terms of service. Plain words; trust rule 7: never promise what email can't do.

export const termsOfService: LegalDoc = {
  title: "Terms of service",
  updated: "3 November 2026",
  intro: `These terms are the agreement between you and ${who.operator}, which runs ${who.name}. By using ${who.name} you accept them. If you don't, please don't use the service.`,
  sections: [
    {
      id: "service",
      heading: "What Clinton AI does",
      paragraphs: [
        `${who.name} checks emails before you send them, holds them for a delay you choose, can send them later, and sends them from your own Gmail account. Safe Send lets you withdraw an email for up to 24 hours, so the recipient can no longer read it in ${who.name}.`,
      ],
    },
    {
      id: "limits",
      heading: "What it can't do",
      paragraphs: [
        "Clinton's check is advice. It can miss mistakes or flag things that are fine; you decide what to send, and you are responsible for what you send.",
        "Once a normal email has left, nobody can delete it from someone else's inbox, and we never claim to. Withdrawing a Safe Send email stops it being readable in Clinton AI; it can't undo a screenshot or a copy the recipient already made.",
        '"Likely opened" and open counts are estimates, not proof.',
      ],
    },
    {
      id: "account",
      heading: "Your account",
      paragraphs: [
        "You need a Google account and must be at least 16 (or the age of digital consent where you live). Keep your Google account secure: anyone who can sign in to it can use Clinton AI as you.",
      ],
    },
    {
      id: "use",
      heading: "Acceptable use",
      paragraphs: ["Don't use Clinton AI to:"],
      list: [
        "send spam, bulk unsolicited email, phishing or malware;",
        "harass, threaten or impersonate anyone;",
        "break the law, including privacy and anti-spam laws, or Google's terms;",
        "attack, overload or reverse-engineer the service, or get around its limits.",
      ],
    },
    {
      id: "content",
      heading: "Your content",
      paragraphs: [
        "Your emails stay yours. You give us permission to process them only to provide the service (check, hold, send, show your history), as described in the privacy policy.",
      ],
    },
    {
      id: "beta",
      heading: "Beta and availability",
      paragraphs: [
        `${who.name} is in beta. Features may change, and the service may sometimes be unavailable. We may suspend accounts that break these terms; you can stop using ${who.name} and delete your account at any time.`,
      ],
    },
    {
      id: "liability",
      heading: "Liability",
      paragraphs: [
        `${who.name} is provided as it is. To the extent the law allows, we are not liable for indirect losses, or for emails sent, not sent, delayed or withdrawn, and our total liability is limited to what you paid us in the last 12 months (nothing, during the free beta). Nothing here limits rights you have by law as a consumer.`,
      ],
    },
    {
      id: "changes",
      heading: "Changes, law and contact",
      paragraphs: [
        `We'll tell you before changes that matter take effect. These terms are governed by the laws of ${who.country}. Questions: ${who.supportEmail}.`,
      ],
    },
  ],
};
