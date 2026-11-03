import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/config/site";
import type { LegalDoc } from "@/content/legal/types";
import { legalLinks } from "@/content/navigation";

/** A legal document: title, date, a contents list, then numbered sections. Plain and readable. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex max-w-[760px] items-center justify-between px-5 pt-8">
        <Logo href="/" />
        <nav aria-label="Legal" className="flex gap-4 text-sm">
          {legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted no-underline hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-[760px] px-5 pt-12 pb-20">
        <h1 className="m-0 font-display text-[clamp(36px,5vw,52px)] leading-tight font-bold tracking-[-0.04em]">
          {doc.title}
        </h1>
        <p className="mt-2 mb-0 text-sm text-muted">Last updated {doc.updated}</p>
        <p className="mt-6 mb-0 text-lg leading-relaxed text-body">{doc.intro}</p>

        <nav aria-label="Contents" className="mt-8 rounded-2xl border border-line bg-surface p-5">
          <ol className="m-0 grid list-decimal gap-1.5 pl-5 text-sm marker:text-muted sm:grid-cols-2">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-brand-ink no-underline hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {doc.sections.map((s, i) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-10 scroll-mt-6">
            <h2 id={`${s.id}-h`} className="m-0 font-display text-2xl font-bold tracking-tight">
              <span className="mr-2 text-muted">{i + 1}.</span>
              {s.heading}
            </h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="mt-3 mb-0 leading-relaxed text-body">
                {p}
              </p>
            ))}
            {s.list ? (
              <ul className="mt-3 mb-0 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-body marker:text-subtle">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </main>
      <footer className="border-t border-line px-5 py-6 text-center text-[13px] text-muted">
        © {new Date().getFullYear()} {site.name} · {site.domain}
      </footer>
    </div>
  );
}
