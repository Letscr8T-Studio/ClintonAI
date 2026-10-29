// Sample data for the onboarding illustrations. Decorative: rendered aria-hidden.

export const checkSample = {
  to: "team@brightlane.io",
  subject: "Offer letter for Dami",
  greeting: "Hi ",
  wrongName: "Tunde",
  middle: ", congratulations! ",
  risky: "Please find the offer attached",
  end: ". Welcome aboard.",
  caught: "Clinton caught 2 things",
  findings: [
    "You wrote “Tunde”, but this is going to Dami.",
    "You mention an attachment, but nothing is attached.",
  ],
  fix: "Fix it",
  ignore: "Send anyway",
};

export const delaySample = {
  label: "Leaving in",
  from: 299,
  progress: 0.83,
  subject: "Q3 investor update",
  to: "amaka@northfund.co",
  actions: ["Edit", "Cancel"],
  primary: "Send now",
};

export const safeSendSample = {
  recipientLabel: "What Tunde sees",
  withdrawnTitle: "This message was withdrawn",
  withdrawnBy: "by Ada Obi at 14:32",
  senderLabel: "Safe Send",
  remaining: "18h 42m left",
  progress: 0.78,
  subject: "Pricing deck v2",
  recipients: [
    { email: "amaka@client.co", status: "Opened", action: "Withdraw" },
    { email: "tunde@client.co", status: "Withdrawn" },
  ],
};
