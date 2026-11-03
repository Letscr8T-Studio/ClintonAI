import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacyPolicy } from "@/content/legal/privacy";

export const metadata: Metadata = {
  title: privacyPolicy.title,
  description: "What Clinton AI collects, why, who helps run it, how long it's kept, and your rights.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage doc={privacyPolicy} />;
}
