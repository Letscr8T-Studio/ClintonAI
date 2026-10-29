import type { Metadata } from "next";
import { GmailCard } from "@/components/app/gmail/GmailCard";
import { HomeHero } from "@/components/app/home/HomeHero";
import { SetupSteps } from "@/components/app/home/SetupSteps";
import { connectOutcome } from "@/content/app/gmail";
import { listAccounts } from "@/server/accounts/repository";
import { requireProfile } from "@/server/auth/user";

export const metadata: Metadata = { title: "Home" };

type Props = { searchParams: Promise<{ gmail?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const [{ profile }, accounts, { gmail }] = await Promise.all([
    requireProfile(),
    listAccounts(),
    searchParams,
  ]);
  const connected = accounts.some((a) => a.status === "active");
  const firstName = profile.display_name?.split(" ")[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <HomeHero firstName={firstName} delaySeconds={profile.default_delay_seconds} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <GmailCard accounts={accounts} outcome={connectOutcome(gmail)} />
        <SetupSteps gmailConnected={connected} />
      </div>
    </div>
  );
}
