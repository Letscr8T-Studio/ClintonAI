import type { Metadata } from "next";
import { headers } from "next/headers";
import { RecipientView } from "@/components/safe-send/RecipientView";
import { viewCopy } from "@/content/app/safe-send";
import { clientIp } from "@/server/http";
import { createRateLimiter } from "@/server/rate-limit";
import { viewByToken } from "@/server/safe-send/service";

// Public, no login: whoever holds the link reads it, until it's withdrawn or expires.
// Never indexed, never cached, and no referrer leaks the link to other sites.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: viewCopy.title,
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Slows anyone trying to guess links: 60 opens per visitor per minute. */
const limiter = createRateLimiter({ name: "safe-send-page", max: 60, windowMs: 60_000 });

type Props = { params: Promise<{ token: string }> };

export default async function SafeSendMessagePage({ params }: Props) {
  const ip = clientIp(await headers());
  if (await limiter.take(ip)) return <RecipientView view={{ kind: "not_found" }} />;

  const { token } = await params;
  return <RecipientView view={await viewByToken(token)} />;
}
