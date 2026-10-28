"use client";

import { useId, useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { faqSection, faqs } from "@/content/faq";
import { cn } from "@/lib/cn";

/** Accordion: one answer open at a time, the first open by default. */
export function Faq() {
  const [open, setOpen] = useState(0);
  const baseId = useId();
  const { id, headingId, ...heading } = faqSection;

  return (
    <Section id={id} labelledBy={headingId} width="narrow">
      <SectionHeading id={headingId} {...heading} />
      <div className="anim-stagger flex flex-col gap-2.5">
        {faqs.map(({ question, answer }, i) => {
          const isOpen = open === i;
          const panelId = `${baseId}-panel-${i}`;
          const buttonId = `${baseId}-button-${i}`;
          return (
            <div key={question} className="rounded-[18px] border border-line bg-white">
              <h3 className="m-0">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex min-h-[62px] w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-5 py-4 text-left font-sans text-base font-semibold text-ink"
                >
                  <span>{question}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-[30px] shrink-0 items-center justify-center rounded-full text-lg transition-colors",
                      isOpen ? "bg-brand text-white" : "bg-brand-wash text-brand",
                    )}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                <p className="m-0 px-5 pb-5 text-[15px] leading-[1.65] text-muted">{answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
