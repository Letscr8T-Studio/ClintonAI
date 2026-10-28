"use client";

import { useActionState, useId } from "react";
import { login, type LoginState } from "@/app/owner/login/actions";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const field =
  "w-full rounded-xl border border-line-strong bg-white px-4 py-3 text-base text-ink outline-none focus:border-brand";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const errorId = useId();

  return (
    <form action={action} className="space-y-4" aria-describedby={state.error ? errorId : undefined}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-body">Email</span>
        <input name="email" type="email" required autoComplete="username" className={field} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-body">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      {state.error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={cn(buttonStyles({ shape: "soft", size: "lg" }), "w-full")}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
