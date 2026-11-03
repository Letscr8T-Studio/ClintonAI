import type { Metadata } from "next";
import { GmailCard } from "@/components/app/gmail/GmailCard";
import { AppearanceSetting } from "@/components/app/settings/AppearanceSetting";
import { DelaySetting } from "@/components/app/settings/DelaySetting";
import { NameSetting } from "@/components/app/settings/NameSetting";
import { OpenTrackingSetting } from "@/components/app/settings/OpenTrackingSetting";
import { PrivacySummary } from "@/components/app/settings/PrivacySummary";
import { SettingsSection } from "@/components/app/settings/SettingsSection";
import { settingsCopy as copy } from "@/content/app/settings";
import { listAccounts } from "@/server/accounts/repository";
import { requireProfile } from "@/server/auth/user";
import { getTheme } from "@/server/theme";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [{ user, profile }, accounts, theme] = await Promise.all([
    requireProfile(),
    listAccounts(),
    getTheme(),
  ]);
  const sender = accounts.find((a) => a.status === "active")?.email ?? user.email;

  return (
    <div className="flex flex-col gap-10">
      <header className="cl-rise">
        <h1 className="m-0 font-display text-[clamp(32px,4vw,44px)] font-bold tracking-[-0.04em]">
          {copy.title}
        </h1>
        <p className="mt-2 mb-0 max-w-[560px] text-muted">{copy.body}</p>
      </header>

      <SettingsSection id={copy.delay.id} title={copy.delay.title} body={copy.delay.body} delay={60}>
        <DelaySetting initialSeconds={profile.default_delay_seconds} />
      </SettingsSection>

      <SettingsSection id={copy.name.id} title={copy.name.title} body={copy.name.body} delay={120}>
        <NameSetting initialName={profile.display_name ?? ""} email={sender} />
      </SettingsSection>

      <SettingsSection
        id={copy.tracking.id}
        title={copy.tracking.title}
        body={copy.tracking.body}
        delay={140}
      >
        <OpenTrackingSetting initialOn={profile.open_tracking} />
      </SettingsSection>

      <SettingsSection
        id={copy.appearance.id}
        title={copy.appearance.title}
        body={copy.appearance.body}
        delay={150}
      >
        <AppearanceSetting initialTheme={theme} />
      </SettingsSection>

      <SettingsSection id={copy.gmail.id} title={copy.gmail.title} delay={180}>
        <GmailCard accounts={accounts} outcome={null} />
      </SettingsSection>

      <SettingsSection id={copy.privacy.id} title={copy.privacy.title} delay={240}>
        <PrivacySummary />
      </SettingsSection>
    </div>
  );
}
