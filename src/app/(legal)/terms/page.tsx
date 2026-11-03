import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { termsOfService } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: termsOfService.title,
  description: "The agreement for using Clinton AI: what it does, what it can't do, and fair use.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage doc={termsOfService} />;
}
