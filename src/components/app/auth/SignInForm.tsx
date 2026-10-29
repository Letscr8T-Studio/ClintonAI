"use client";

import { useFormStatus } from "react-dom";
import { signInWithGoogle } from "@/app/login/actions";
import { GoogleMark } from "@/components/ui/GoogleMark";
import { ArrowRight } from "@/components/ui/icons";
import { loginCopy } from "@/content/app/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="group flex min-h-[64px] w-full cursor-pointer items-center gap-4 rounded-2xl border border-line-strong bg-white py-2 pr-2 pl-5 text-left text-base font-semibold text-ink shadow-field transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-mist hover:shadow-float disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <GoogleMark size={22} />
      <span className="flex-1">{pending ? loginCopy.pending : loginCopy.button}</span>
      <span
        aria-hidden="true"
        className="inline-flex size-12 items-center justify-center rounded-xl bg-brand transition-colors duration-300 group-hover:bg-brand-deep"
      >
        <span className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
          <ArrowRight size={16} />
        </span>
      </span>
    </button>
  );
}

/** "Continue with Google". `next` is where to land after sign-in (validated on the server). */
export function SignInForm({ next }: { next?: string }) {
  return (
    <form action={signInWithGoogle}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <SubmitButton />
    </form>
  );
}
