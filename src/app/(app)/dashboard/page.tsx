import type { Metadata } from "next";
import { ActivityList } from "@/components/app/dashboard/ActivityList";
import { CaughtList } from "@/components/app/dashboard/CaughtList";
import { RecentEmails } from "@/components/app/dashboard/RecentEmails";
import { StatTiles } from "@/components/app/dashboard/StatTiles";
import { GmailCard } from "@/components/app/gmail/GmailCard";
import { HomeHeader } from "@/components/app/home/HomeHeader";
import { HomeHero } from "@/components/app/home/HomeHero";
import { SetupSteps } from "@/components/app/home/SetupSteps";
import { appRoutes } from "@/config/routes";
import { activityCopy, caughtCopy, DASHBOARD_DAYS } from "@/content/app/dashboard";
import { connectOutcome } from "@/content/app/gmail";
import { listAccounts } from "@/server/accounts/repository";
import { requireProfile } from "@/server/auth/user";
import { getStats, listActivity, listCaught } from "@/server/dashboard/repository";
import { hasSentEmail, listOutbox } from "@/server/emails/outbox-repository";
import { attachSafeSend } from "@/server/safe-send/service";

export const metadata: Metadata = { title: "Home" };

type Props = { searchParams: Promise<{ gmail?: string }> };

/** Home shows the latest few of each; "see all" links lead to the Outbox and History. */
const RECENT_ROWS = 8;
const CAUGHT_ROWS = 3;
const ACTIVITY_ROWS = 6;

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
        listOutbox(DASHBOARD_DAYS).then(async (e) => ({
          total: e.length,
          recent: await attachSafeSend(e.slice(0, RECENT_ROWS)),
        })),
        listCaught(CAUGHT_ROWS),
        listActivity(ACTIVITY_ROWS, { skipHeld: true }),
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
          {/* Both columns end level: the cards stretch, and their "see all" links sit at the bottom. */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <RecentEmails emails={dashboard[1].recent} total={dashboard[1].total} className="h-full" />
            <div className="flex flex-col gap-6">
              <CaughtList
                items={dashboard[2]}
                footer={
                  dashboard[2].length
                    ? { href: `${appRoutes.activity}?view=caught`, label: caughtCopy.seeAll }
                    : undefined
                }
              />
              <ActivityList
                items={dashboard[3]}
                footer={
                  dashboard[3].length ? { href: appRoutes.activity, label: activityCopy.seeAll } : undefined
                }
                className="flex-1"
              />
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
