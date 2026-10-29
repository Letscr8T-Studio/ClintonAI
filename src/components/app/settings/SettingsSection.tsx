import type { ReactNode } from "react";

type Props = { id: string; title: string; body?: string; children: ReactNode; delay?: number };

/** One settings block: what it is on the left, the control on the right (stacked on phones). */
export function SettingsSection({ id, title, body, children, delay = 0 }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className="cl-rise grid scroll-mt-24 gap-5 border-t border-line pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <h2 id={`${id}-h`} className="m-0 font-display text-xl font-bold tracking-tight">
          {title}
        </h2>
        {body ? <p className="mt-2 mb-0 max-w-[360px] text-sm leading-relaxed text-muted">{body}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
