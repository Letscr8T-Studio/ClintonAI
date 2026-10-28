import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-5 text-center">
      <Logo href="/" />
      <h1 className="m-0 font-display text-4xl font-bold tracking-[-0.03em]">
        This page doesn&apos;t exist.
      </h1>
      <p className="m-0 text-muted">The link may be old, or the address has a typo.</p>
      <ButtonLink href="/">Back to the home page</ButtonLink>
    </main>
  );
}
