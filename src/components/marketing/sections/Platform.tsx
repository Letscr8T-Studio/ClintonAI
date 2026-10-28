import { Section, SectionHeading } from "@/components/ui/Section";
import { pillars, platformSection } from "@/content/platform";
import { PlatformCard } from "./PlatformCard";

export function Platform() {
  const { id, headingId, ...heading } = platformSection;
  return (
    <Section id={id} labelledBy={headingId}>
      <SectionHeading id={headingId} {...heading} />
      <ul className="anim-stagger m-0 grid list-none gap-4 p-0 min-[900px]:grid-cols-6">
        {pillars.map((pillar) => (
          <PlatformCard key={pillar.num} pillar={pillar} />
        ))}
      </ul>
    </Section>
  );
}
