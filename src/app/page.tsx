import { Announcement } from "@/components/marketing/layout/Announcement";
import { SiteFooter } from "@/components/marketing/layout/SiteFooter";
import { Compare } from "@/components/marketing/sections/Compare";
import { Dashboard } from "@/components/marketing/sections/Dashboard";
import { Faq } from "@/components/marketing/sections/Faq";
import { Feeling } from "@/components/marketing/sections/Feeling";
import { Hero } from "@/components/marketing/sections/Hero";
import { HowItWorks } from "@/components/marketing/sections/HowItWorks";
import { Inboxes } from "@/components/marketing/sections/Inboxes";
import { Join } from "@/components/marketing/sections/Join";
import { Outreach } from "@/components/marketing/sections/Outreach";
import { Platform } from "@/components/marketing/sections/Platform";
import { ProductShot } from "@/components/marketing/sections/ProductShot";
import { Roadmap } from "@/components/marketing/sections/Roadmap";
import { JsonLd } from "@/components/seo/JsonLd";
import { sectionIds } from "@/content/navigation";
import { headers } from "next/headers";

// The public landing page. Sections appear in this order; their copy lives in src/content/.
export default async function Home() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <>
      <JsonLd nonce={nonce} />
      <Announcement />
      <main id={sectionIds.main} tabIndex={-1} className="outline-none">
        <Hero />
        <Inboxes />
        <Feeling />
        <Platform />
        <ProductShot />
        <HowItWorks />
        <Dashboard />
        <Outreach />
        <Compare />
        <Roadmap />
        <Faq />
        <Join />
      </main>
      <SiteFooter />
    </>
  );
}
