import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Founders console", template: "%s · Clinton AI founders" },
  robots: { index: false, follow: false, nocache: true },
};

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-paper text-ink">{children}</div>;
}
