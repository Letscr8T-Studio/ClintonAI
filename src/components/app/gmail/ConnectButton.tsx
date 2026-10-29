"use client";

import { useState } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { appRoutes } from "@/config/routes";
import { gmailCopy as copy } from "@/content/app/gmail";

/**
 * Posts to the connect route, which redirects to Google's consent screen. A plain form, so it works
 * before hydration; the pending label is a progressive enhancement.
 */
export function ConnectButton({ label }: { label: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form action={appRoutes.gmailConnect} method="post" onSubmit={() => setPending(true)}>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="group inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-brand px-7 text-base font-semibold text-white shadow-cta transition-[translate,background-color] duration-300 hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none sm:w-auto"
      >
        {pending ? copy.opening : label}
        <span className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
          <ArrowRight size={16} />
        </span>
      </button>
    </form>
  );
}
