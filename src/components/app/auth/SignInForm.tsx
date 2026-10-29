"use client";

import { useFormStatus } from "react-dom";
import { signInWithGoogle } from "@/app/login/actions";
import { buttonStyles } from "@/components/ui/Button";
import { GoogleMark } from "@/components/ui/GoogleMark";
import { loginCopy } from "@/content/app/auth";
import { cn } from "@/lib/cn";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(buttonStyles({ variant: "secondary", shape: "soft", size: "lg" }), "w-full")}
    >
      <GoogleMark />
      {pending ? loginCopy.pending : loginCopy.button}
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
