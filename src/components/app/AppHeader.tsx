import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { appRoutes } from "@/config/routes";
import { appShellCopy as copy } from "@/content/app/auth";
import { buttonStyles } from "@/components/ui/Button";

type Props = { name: string | null; email: string | null };

/** Signed-in header: logo, main nav, who is signed in, and sign out. */
export function AppHeader({ name, email }: Props) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo href={appRoutes.home} />
          <nav aria-label={copy.navLabel}>
            <ul className="m-0 flex list-none gap-4 p-0">
              {copy.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-body no-underline hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-right text-sm leading-tight sm:block">
            {name ? <span className="block font-medium text-ink">{name}</span> : null}
            {email ? <span className="block text-muted">{email}</span> : null}
          </p>
          <form action={appRoutes.signOut} method="post">
            <button
              type="submit"
              className={buttonStyles({ variant: "secondary", size: "sm", shape: "soft" })}
            >
              {copy.signOut}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
