import type { Metadata } from "next";
import { OutboxView } from "@/components/app/outbox/OutboxView";
import { listOutbox } from "@/server/emails/outbox-repository";
import { attachSafeSend } from "@/server/safe-send/service";

export const metadata: Metadata = { title: "Outbox" };

export default async function OutboxPage() {
  const emails = await listOutbox().then(attachSafeSend);
  return <OutboxView emails={emails} />;
}
