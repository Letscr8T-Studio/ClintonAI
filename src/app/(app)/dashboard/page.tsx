import type { Metadata } from "next";
import { ActivityList } from "@/components/app/dashboard/ActivityList";
import { CaughtList } from "@/components/app/dashboard/CaughtList";
import { RecentEmails } from "@/components/app/dashboard/RecentEmails";
import { StatTiles } from "@/components/app/dashboard/StatTiles";
import { GmailCard } from "@/components/app/gmail/GmailCard";
import { HomeHeader } from "@/components/app/home/HomeHeader";
import { HomeHero } from "@/components/app/home/HomeHero";
import { SetupSteps } from "@/components/app/home/SetupSteps";
import { DASHBOARD_DAYS } from "@/content/app/dashboard";
import { connectOutcome } from "@/content/app/gmail";
import { listAccounts } from "@/server/accounts/repository";
import { requireProfile } from "@/server/auth/user";
import { getStats, listActivity, listCaught } from "@/server/dashboard/repository";
import { hasSentEmail, listOutbox } from "@/server/emails/repository";
import { attachSafeSend } from "@/server/safe-send/service";

export const metadata: Metadata = { title: "Home" };

type Props = { searchParams: Promise<{ gmail?: string }> };

const RECENT_ROWS = 8;

/**
 * Home: the brand banner and getting started until the first send; then a compact header and the
 * dashboard (numbers, emails, catches, history).
 */
export default async function HomePage({ searchParams }: Props) {
  const [{ profile }, accounts, hasSent, triedSafeSend, { gmail }] = await Promise.all([
    requireProfile(),
    listAccounts(),
    hasSentEmail(),
    hasSentEmail({ safeSendOnly: true }),
    searchParams,
  ]);
  const gmailConnected = accounts.some((a) => a.status === "active");
  const firstName = profile.display_name?.split(" ")[0] ?? null;
  const setupDone = gmailConnected && hasSent && triedSafeSend;

  const dashboard = hasSent
    ? await Promise.all([
        getStats(),
        listOutbox(DASHBOARD_DAYS).then((e) => attachSafeSend(e.slice(0, RECENT_ROWS))),
        listCaught(),
        listActivity(),
      ])
    : null;

  return (
    <div className="flex flex-col gap-6">
      {hasSent ? (
        <HomeHeader firstName={firstName} delaySeconds={profile.default_delay_seconds} />
      ) : (
        <HomeHero
          firstName={firstName}
          delaySeconds={profile.default_delay_seconds}
          connected={gmailConnected}
        />
      )}
      {dashboard ? (
        <>
          <StatTiles stats={dashboard[0]} />
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <RecentEmails emails={dashboard[1]} />
            <div className="flex flex-col gap-6">
              <CaughtList items={dashboard[2]} />
              <ActivityList items={dashboard[3]} />
            </div>
          </div>
        </>
      ) : null}
      {setupDone ? null : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <GmailCard accounts={accounts} outcome={connectOutcome(gmail)} />
          <SetupSteps gmailConnected={gmailConnected} hasSent={hasSent} triedSafeSend={triedSafeSend} />
        </div>
      )}
    </div>
  );
}
