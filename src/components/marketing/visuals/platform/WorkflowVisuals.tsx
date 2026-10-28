import { Chip, type ChipTone } from "@/components/ui/Chip";
import { Sparkle } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { assistantSample, inboxSample, outreachLeads, type LeadState } from "@/content/platform-samples";

// Illustrations for the writing, outreach and inbox pillars.

const panel = "m-0 flex list-none flex-col gap-2 rounded-[20px] bg-brand-wash p-3.5";
const row = "flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-[13px]";

export function AssistantVisual() {
  return (
    <div className={panel}>
      <span className="self-end rounded-2xl rounded-br-md bg-brand px-3 py-2 text-[12.5px] text-white">
        {assistantSample.prompt}
      </span>
      <div className="flex flex-col gap-1.5 rounded-2xl rounded-bl-md bg-white p-3 text-[12.5px] leading-[1.5] text-body">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-deep">
          <Sparkle size={11} color={palette.brand} /> Clinton drafted
        </span>
        {assistantSample.draft}
      </div>
    </div>
  );
}

const leadTones: Record<LeadState, ChipTone> = { Replied: "brand", Sent: "tint", Ready: "neutral" };

export function OutreachVisual() {
  return (
    <ul className={panel}>
      {outreachLeads.map((lead) => (
        <li key={lead.name} className={`${row} justify-between gap-3`}>
          <span className="min-w-0">
            <span className="block font-semibold text-ink">{lead.name}</span>
            <span className="block truncate text-[12px] text-subtle">{lead.line}</span>
          </span>
          <Chip tone={leadTones[lead.state]} size="xs" className="shrink-0">
            {lead.state}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

export function InboxVisual() {
  return (
    <ul className={panel}>
      {inboxSample.items.map((item) => (
        <li key={item.text} className={row}>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ${
              item.tone === "ink" ? "bg-ink text-white" : "bg-brand-tint text-brand-deep"
            }`}
          >
            {item.tag}
          </span>
          <span className="truncate text-body">{item.text}</span>
        </li>
      ))}
      <li className={`${row} justify-between border border-amber-line bg-amber-bg text-amber-ink`}>
        <span className="truncate">{inboxSample.nudge.text}</span>
        <span className="shrink-0 font-semibold">{inboxSample.nudge.action}</span>
      </li>
    </ul>
  );
}
