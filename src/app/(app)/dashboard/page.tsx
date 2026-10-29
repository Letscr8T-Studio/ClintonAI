import type { Metadata } from "next";
import { homeCopy as copy } from "@/content/app/auth";
import { formatDelay } from "@/lib/validation/profile";
import { requireProfile } from "@/server/auth/user";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { profile } = await requireProfile();
  const firstName = profile.display_name?.split(" ")[0] ?? null;

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">{copy.greeting(firstName)}</h1>
      <p className="mt-2 text-body">{copy.body}</p>

      <section
        aria-labelledby="settings-h"
        className="mt-8 max-w-md rounded-2xl border border-line bg-white p-6"
      >
        <h2 id="settings-h" className="font-display text-lg font-bold">
          {copy.settingsTitle}
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted">{copy.delayLabel}</dt>
          <dd className="m-0 font-medium text-ink">{formatDelay(profile.default_delay_seconds)}</dd>
          <dt className="text-muted">{copy.trackingLabel}</dt>
          <dd className="m-0 font-medium text-ink">
            {profile.open_tracking ? copy.trackingOn : copy.trackingOff}
          </dd>
        </dl>
      </section>
    </>
  );
}
