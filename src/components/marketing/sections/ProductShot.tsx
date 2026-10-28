import { Section } from "@/components/ui/Section";
import { productShot } from "@/content/product-shot";
import { OutboxDeck } from "../visuals/OutboxDeck";
import { PhoneMock } from "../visuals/PhoneMock";

export function ProductShot() {
  return (
    <Section labelledBy={productShot.headingId} space="tight">
      <div className="anim-panel relative grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-[clamp(36px,5vw,64px)] overflow-hidden rounded-[clamp(28px,4vw,40px)] bg-[radial-gradient(circle_at_78%_30%,#6A82FF_0%,#2E4CF6_42%,#2236C4_100%)] px-[clamp(20px,5vw,64px)] py-[clamp(28px,6vw,72px)] text-white">
        <div className="flex flex-col gap-[clamp(22px,3vw,32px)]">
          <div className="flex flex-col gap-3.5">
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Safety features">
              {productShot.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/35 bg-white/14 px-3 py-[5px] font-mono text-xs"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <h2
              id={productShot.headingId}
              className="m-0 font-display text-[clamp(40px,5.6vw,76px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
            >
              {productShot.title}
            </h2>
            <p className="m-0 max-w-[440px] text-[17px] leading-[1.6] text-on-brand">{productShot.body}</p>
          </div>
          <OutboxDeck />
        </div>
        <div className="flex justify-center">
          <PhoneMock />
        </div>
      </div>
    </Section>
  );
}
