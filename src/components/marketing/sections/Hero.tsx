import { ButtonLink } from "@/components/ui/Button";
import { ClintonMark } from "@/components/ui/icons";
import { hero } from "@/content/hero";
import { sectionIds } from "@/content/navigation";
import { SiteHeader } from "../layout/SiteHeader";
import { HeroFloatingCards } from "../visuals/HeroFloatingCards";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Hero() {
  return (
    <section
      id={sectionIds.top}
      aria-labelledby={hero.headingId}
      className="relative bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,#DCE3FF_0%,#EEF1FF_38%,#FBFBF9_72%)]"
    >
      <SiteHeader />
      <div className="relative mx-auto max-w-[1200px] px-5 pt-[clamp(44px,8vw,108px)] pb-[clamp(56px,9vw,120px)]">
        <HeroFloatingCards />
        <div className="relative mx-auto flex max-w-[800px] flex-col items-center gap-[clamp(20px,2.6vw,28px)] text-center">
          <span className="anim-load inline-flex items-center gap-2 rounded-full border border-brand-mist bg-white py-1.5 pr-3.5 pl-2 text-[13px] font-medium text-brand-deep shadow-[0_6px_20px_-10px_rgba(46,76,246,0.4)]">
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand">
              <ClintonMark size={12} />
            </span>
            {hero.badge}
          </span>

          <h1
            id={hero.headingId}
            className="m-0 font-display text-[clamp(44px,7vw,88px)] leading-none font-bold tracking-[-0.045em]"
          >
            <span className="anim-word inline-block" style={delay(80)}>
              {hero.title}
            </span>
            <br />
            <span className="anim-word inline-block text-brand" style={delay(220)}>
              <span className="anim-ink">{hero.accent}</span>
            </span>
          </h1>

          <p
            className="anim-load m-0 max-w-[580px] text-[clamp(17px,1.6vw,20px)] leading-[1.6] text-muted"
            style={delay(380)}
          >
            {hero.body}
          </p>

          <div className="anim-load flex flex-wrap justify-center gap-2.5" style={delay(500)}>
            <ButtonLink href={hero.primaryCta.href} size="lg" className="px-[26px] shadow-cta">
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} size="lg" variant="secondary">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>

          <p className="anim-load m-0 text-[13px] text-subtle" style={delay(620)}>
            {hero.reassurance}
          </p>
        </div>
      </div>
    </section>
  );
}
