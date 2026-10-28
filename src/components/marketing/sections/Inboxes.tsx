import { Chip } from "@/components/ui/Chip";
import { inboxes } from "@/content/inboxes";
import { cn } from "@/lib/cn";

export function Inboxes() {
  return (
    <section
      aria-label={inboxes.label}
      className="mx-auto max-w-[1040px] px-5 pb-[clamp(64px,9vw,104px)] text-center"
    >
      <p className="mt-0 mb-[22px] text-sm text-subtle">{inboxes.intro}</p>
      <ul className="anim-stagger m-0 grid list-none grid-cols-2 gap-2 p-0 min-[700px]:flex min-[700px]:flex-wrap min-[700px]:justify-center min-[700px]:gap-2.5">
        {inboxes.providers.map((provider) => {
          const live = provider.status === "live";
          return (
            <li
              key={provider.name}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left text-[14px] font-semibold min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-2.5 min-[700px]:px-[18px] min-[700px]:py-3 min-[700px]:text-[15px]",
                live ? "border-brand-mist bg-white text-ink" : "border-line bg-white/60 text-subtle",
              )}
            >
              {provider.name}
              <Chip tone={live ? "brand" : "neutral"} size="xs" className={cn(!live && "text-muted")}>
                {inboxes.statusLabels[provider.status]}
              </Chip>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
