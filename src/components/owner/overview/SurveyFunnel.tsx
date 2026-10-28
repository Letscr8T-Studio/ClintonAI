import type { Analytics } from "@/types/waitlist";
import { SectionTitle } from "../Headings";
import { ProgressBar } from "../Indicators";
import { card } from "../styles";

function Step({ label, value, pct, fill }: { label: string; value: string; pct: number; fill: string }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted tabular-nums">{value}</span>
      </div>
      <ProgressBar value={pct} fill={fill} />
    </div>
  );
}

export function SurveyFunnel({ a }: { a: Analytics }) {
  const pending = a.total - a.surveyed;
  return (
    <div className={`${card} p-5`}>
      <SectionTitle title="Survey funnel" sub="Who unlocked priority access" />
      <div className="space-y-4">
        <Step label="Joined" value={String(a.total)} pct={100} fill="bg-brand-light" />
        <Step
          label="Did the survey"
          value={`${a.surveyed} · ${a.surveyRate}%`}
          pct={a.surveyRate}
          fill="bg-brand"
        />
      </div>
      <div className="mt-6 rounded-xl bg-brand-wash p-4">
        <p className="font-display text-2xl font-bold text-brand-deep tabular-nums">{pending}</p>
        <p className="text-sm text-body">
          haven&apos;t done the survey yet. A nudge email could convert them.
        </p>
      </div>
    </div>
  );
}
