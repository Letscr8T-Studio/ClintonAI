import type { Metadata } from "next";
import { ComposeLoader } from "@/components/app/compose/ComposeLoader";
import { ConnectButton } from "@/components/app/gmail/ConnectButton";
import { composeCopy } from "@/content/app/compose";
import { gmailCopy } from "@/content/app/gmail";
import { listAccounts } from "@/server/accounts/repository";
import { requireProfile } from "@/server/auth/user";

export const metadata: Metadata = { title: "Compose" };

export default async function ComposePage() {
  const [{ profile }, accounts] = await Promise.all([requireProfile(), listAccounts()]);
  const account = accounts.find((a) => a.status === "active");

  if (!account) {
    return (
      <section className="cl-rise mx-auto max-w-xl rounded-[28px] border border-line bg-white p-8 text-center shadow-card">
        <h1 className="m-0 font-display text-2xl font-bold tracking-tight">{composeCopy.noAccountTitle}</h1>
        <p className="mt-2 mb-6 text-muted">{composeCopy.noAccountBody}</p>
        <ConnectButton label={gmailCopy.connectButton} />
      </section>
    );
  }

  return <ComposeLoader fromEmail={account.email} defaultDelaySeconds={profile.default_delay_seconds} />;
}
