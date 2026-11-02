import { Countdown } from "@/components/ui/Countdown";
import { Check, Warning } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { palette } from "@/config/brand";
import { signInStage as s } from "@/content/app/auth";

const at = (ms: number) => ({ animationDelay: `${ms}ms` });

/** Brand stage beside the sign-in form: Clinton catches a mistake, then holds the email. */
export function SignInStage() {
  return (
    <header className="stage-brand relative flex flex-col overflow-hidden px-[clamp(20px,4vw,56px)] pt-6 pb-14 text-white lg:min-h-dvh lg:py-12 [@media(max-height:480px)]:pb-12">
      <div aria-hidden="true" className="stage-grid absolute inset-0" />
      <Logo light href="/" className="relative" />

      <p className="relative mt-7 mb-0 font-display text-[clamp(32px,4.4vw,64px)] leading-[0.98] font-bold tracking-[-0.045em] lg:mt-16 [@media(max-height:480px)]:hidden">
        <span className="anim-word inline-block" style={at(100)}>
          {s.titleStart}
        </span>
        <br />
        <span className="anim-word inline-block text-brand-tint" style={at(240)}>
          {s.titleAccent}
        </span>
      </p>

      <div aria-hidden="true" className="relative mt-6 hidden flex-1 items-center lg:flex">
        <div className="cl-idle relative mx-auto flex w-full max-w-[460px] flex-col">
          <article
            className="cl-rise rounded-[22px] bg-cream p-5 pb-8 text-ink shadow-deck"
            style={{ ...at(450), rotate: "-2deg" }}
          >
            <div className="flex items-center justify-between border-b border-line pb-3 text-[13px]">
              <span className="text-muted">
                To <span className="font-medium text-ink">{s.email.to}</span>
              </span>
              <span className="size-2 rounded-full bg-amber-dot" />
            </div>
            <p className="mt-3 mb-2 font-display text-lg font-bold tracking-tight">{s.email.subject}</p>
            <p className="m-0 text-[14px] leading-[1.6] text-body">
              {s.email.before}
              <span className="cl-mark px-0.5" style={at(1300)}>
                {s.email.risky}
              </span>
              {s.email.after}
            </p>
          </article>

          <div
            className="cl-pop relative -mt-5 mr-[-4%] w-[min(88%,340px)] self-end rounded-[18px] border border-amber-line bg-amber-bg p-4 shadow-[0_26px_60px_rgba(10,20,90,0.35)]"
            style={{ ...at(2000), rotate: "2deg" }}
          >
            <div className="flex items-center gap-2.5">
              <Warning size={20} />
              <span className="font-mono text-[11px] font-medium tracking-wider text-amber-ink uppercase">
                {s.finding.label}
              </span>
            </div>
            <p className="mt-2 mb-3 text-sm leading-snug text-amber-ink">{s.finding.text}</p>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-night px-3 py-1.5 font-semibold text-white">{s.fix}</span>
              <span className="rounded-full border border-amber-line px-3 py-1.5 text-amber-ink">
                {s.ignore}
              </span>
            </div>
          </div>

          <div
            className="cl-slide relative -mt-4 ml-[2%] flex items-center gap-3 self-start rounded-full bg-night py-2 pr-4 pl-2 shadow-deck"
            style={at(2900)}
          >
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand">
              <Check size={14} />
            </span>
            <span className="text-[13px] text-navy-text">{s.held.label}</span>
            <span className="font-mono text-[15px] font-medium text-white">
              <Countdown from={s.held.from} />
            </span>
          </div>
        </div>
      </div>

      <ul className="relative m-0 mt-12 hidden list-none flex-col gap-2.5 p-0 text-[15px] text-on-brand lg:flex">
        {s.trust.map((line, i) => (
          <li key={line} className="cl-rise flex items-center gap-3" style={at(600 + i * 120)}>
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/15">
              <Check size={10} color={palette.white} />
            </span>
            {line}
          </li>
        ))}
      </ul>
    </header>
  );
}
