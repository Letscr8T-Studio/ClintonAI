import type { Metadata } from "next";
import { ComposeWorkspace } from "@/components/app/compose/ComposeWorkspace";
import { ConnectButton } from "@/components/app/gmail/ConnectButton";
import { composeCopy } from "@/content/app/compose";
import { gmailCopy } from "@/content/app/gmail";
import { listAccounts } from "@/server/accounts/repository";

export const metadata: Metadata = { title: "Compose" };

export default async function ComposePage() {
  const account = (await listAccounts()).find((a) => a.status === "active");

  if (!account) {
    return (
      <section className="cl-rise mx-auto max-w-xl rounded-[28px] border border-line bg-white p-8 text-center shadow-card">
        <h1 className="m-0 font-display text-2xl font-bold tracking-tight">{composeCopy.noAccountTitle}</h1>
        <p className="mt-2 mb-6 text-muted">{composeCopy.noAccountBody}</p>
        <ConnectButton label={gmailCopy.connectButton} />
      </section>
    );
  }

  return <ComposeWorkspace fromEmail={account.email} />;
}
