import type { Metadata } from "next";
import { OutboxView } from "@/components/app/outbox/OutboxView";
import { listOutbox } from "@/server/emails/repository";
import { attachSafeSend } from "@/server/safe-send/service";

export const metadata: Metadata = { title: "Outbox" };

type Props = { searchParams: Promise<{ queued?: string }> };

export default async function OutboxPage({ searchParams }: Props) {
  const [emails, { queued }] = await Promise.all([listOutbox().then(attachSafeSend), searchParams]);
  return <OutboxView emails={emails} justQueued={queued === "1"} />;
}
