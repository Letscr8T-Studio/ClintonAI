import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

const variants = {
  primary:
    "bg-brand px-7 text-white shadow-cta hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70",
  ghost: "px-5 text-muted hover:bg-surface hover:text-ink",
};

/** Large tour navigation button (Next, Back, Finish). */
export function NavButton({ variant = "primary", type = "button", className, ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-14 cursor-pointer items-center justify-center gap-2.5 rounded-2xl text-base font-semibold transition-[translate,background-color,color] duration-300 motion-reduce:transition-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
