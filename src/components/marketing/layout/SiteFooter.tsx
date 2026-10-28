import { Logo } from "@/components/ui/Logo";
import { site } from "@/config/site";
import { anchor, footerNav } from "@/content/navigation";

export function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-brand text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-6 px-5 pt-[clamp(40px,6vw,64px)]">
        <div className="flex max-w-[320px] flex-col gap-2.5">
          <Logo light href={anchor("top")} />
          <p className="m-0 text-[15px] leading-[1.6] text-on-brand">{site.shortDescription}</p>
        </div>
        <nav aria-label="Footer" className="flex gap-10 text-[15px]">
          {footerNav.map((column, i) => (
            <ul key={i} className="m-0 flex list-none flex-col gap-2.5 p-0">
              {column.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-white no-underline hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </div>
      <p
        aria-hidden="true"
        className="anim-mark m-0 mt-[clamp(24px,4vw,40px)] text-center font-display text-[clamp(96px,24vw,340px)] leading-[0.8] font-extrabold tracking-[-0.06em] whitespace-nowrap text-white/14"
        style={{ transform: "translateY(14%)" }}
      >
        clinton
      </p>
      <div className="relative mx-auto max-w-[1200px] px-5 pt-4 pb-[22px] text-[13px] text-on-brand">
        © {new Date().getFullYear()} {site.name} · {site.domain}
      </div>
    </footer>
  );
}
