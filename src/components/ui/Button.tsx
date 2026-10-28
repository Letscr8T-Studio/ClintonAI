import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "pill" | "soft";

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; shape?: ButtonShape };

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 font-sans font-semibold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "border-0 bg-brand text-white hover:bg-brand-deep",
  secondary: "border border-line-strong bg-white text-ink hover:border-brand-mist hover:bg-brand-wash",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-[18px] text-[15px]",
  lg: "min-h-[52px] px-6 text-base",
};

const shapes: Record<ButtonShape, string> = { pill: "rounded-full", soft: "rounded-xl" };

/** Class string for anything that should look like a button (links, form buttons). */
export function buttonStyles({ variant = "primary", size = "md", shape = "pill" }: StyleProps = {}): string {
  return cn(base, variants[variant], sizes[size], shapes[shape]);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export function Button({ variant, size, shape, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ variant, size, shape }), className)} {...props} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps & { href: string };

/** In-page or external link styled as a button. Use next/link's <Link> for app routes. */
export function ButtonLink({ variant, size, shape, className, ...props }: ButtonLinkProps) {
  return <a className={cn(buttonStyles({ variant, size, shape }), className)} {...props} />;
}
