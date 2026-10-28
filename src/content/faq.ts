import { sectionIds } from "./navigation";
import type { FaqItem, SectionCopy } from "./types";

// Answers must stay consistent with "Objections and answers" in docs/product/vision.md.
// Never promise deleting email from someone's inbox (trust rule 10).

export const faqSection: SectionCopy = {
  id: sectionIds.faq,
  headingId: "faq-h",
  pill: "FAQ",
  title: "Good questions.",
};

export const faqs: FaqItem[] = [
  {
    question: "Does the person I email need Clinton AI?",
    answer:
      "No. They get a normal email from your address, in whatever inbox they already use. Nothing to install, nothing to sign up for.",
  },
  {
    question: "What if they already opened it?",
    answer:
      "With Safe Send you can still take it back for 24 hours. The message and any attachments disappear, so it can’t be reread, forwarded or downloaded from that point. The subject line stays, and nobody can stop a screenshot, so Clinton never promises that.",
  },
  {
    question: "Does Clinton read my inbox?",
    answer:
      "Not at launch. Clinton only asks Google for permission to send email for you. Inbox features like reminders and summaries come later, only with your permission, after Google’s security review.",
  },
  {
    question: "Which email accounts does it work with?",
    answer:
      "Gmail and Google Workspace at launch. Outlook and Microsoft 365 are next, then Yahoo Mail and your own domain.",
  },
  {
    question: "How is this different from Undo Send?",
    answer:
      "Undo Send gives you a few seconds before the email leaves. Clinton gives you 24 hours after it’s delivered, an AI check before you send, and soon an assistant that writes and follows up for you.",
  },
  {
    question: "When can I start, and what does it cost?",
    answer:
      "Early access opens in small batches, anywhere in the world. It’s free during early access. After that there will be a free plan, with paid plans for heavier use and outreach.",
  },
];
