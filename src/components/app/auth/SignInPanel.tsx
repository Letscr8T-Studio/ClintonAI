import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { Check, Close } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { loginCopy as copy } from "@/content/app/auth";
import { SignInForm } from "./SignInForm";

const at = (ms: number) => ({ animationDelay: `${ms}ms` });

type Props = { next: string; error: string | null };

/** The sign-in column: heading, Google button and a plain account of what is shared. */
export function SignInPanel({ next, error }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col">
      <Chip tone="tint" size="md" dot className="cl-rise self-start">
        {copy.eyebrow}
      </Chip>
      <h1
        className="cl-rise mt-5 mb-0 font-display text-[clamp(36px,4vw,48px)] leading-[1.02] font-bold tracking-[-0.04em]"
        style={at(80)}
      >
        {copy.title}
      </h1>
      <p className="cl-rise mt-3 mb-8 text-[17px] text-muted" style={at(160)}>
        {copy.body}
      </p>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-2xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm font-medium text-danger-ink"
        >
          {error}
        </p>
      ) : null}

      <div className="cl-rise" style={at(240)}>
        <SignInForm next={next} />
      </div>

      <section
        aria-label={copy.sharesTitle}
        className="cl-rise mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line"
        style={at(340)}
      >
        <div className="bg-white p-4">
          <h2 className="m-0 font-mono text-[11px] font-medium tracking-wider text-muted uppercase">
            {copy.sharesTitle}
          </h2>
          <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0 text-sm text-ink">
            {copy.shares.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-brand">
                  <Check size={9} color={palette.white} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4">
          <h2 className="m-0 font-mono text-[11px] font-medium tracking-wider text-muted uppercase">
            {copy.neverTitle}
          </h2>
          <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0 text-sm text-ink">
            {copy.never.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-line-strong text-muted">
                  <Close size={9} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="cl-rise mt-5 mb-0 text-[13px] leading-relaxed text-muted" style={at(420)}>
        {copy.privacy}
      </p>
      <Link
        href="/"
        className="cl-rise mt-10 self-start text-[13px] font-medium text-muted underline-offset-4 hover:text-brand hover:underline"
        style={at(500)}
      >
        <span aria-hidden="true">← </span>
        {copy.backHome}
      </Link>
    </div>
  );
}
