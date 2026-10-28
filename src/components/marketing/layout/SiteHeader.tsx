import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { anchor, mainNav, primaryCta } from "@/content/navigation";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-[18px]">
      <Logo href={anchor("top")} />
      <nav className="hidden items-center gap-1 min-[821px]:flex" aria-label="Main">
        {mainNav.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-3.5 py-2.5 text-[15px] text-body no-underline hover:text-brand"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <ButtonLink href={primaryCta.href} className="max-[380px]:hidden">
          {primaryCta.label} <ArrowRight />
        </ButtonLink>
        <MobileNav />
      </div>
    </header>
  );
}
