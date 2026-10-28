import { Button } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { waitlistCopy as copy } from "@/content/join";

/** Shown after joining: confirmation plus the optional priority-access survey. */
export function JoinedCard({
  surveyDone,
  onStartSurvey,
}: {
  surveyDone: boolean;
  onStartSurvey: () => void;
}) {
  return (
    <div
      role="status"
      className="flex max-w-[520px] flex-wrap items-center justify-between gap-3 rounded-[20px] border border-brand-mist bg-white px-5 py-[18px]"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
          <Check />
        </span>
        <p className="m-0 text-base font-medium">{surveyDone ? copy.surveyed : copy.joined}</p>
      </div>
      {!surveyDone && (
        <Button onClick={onStartSurvey} className="min-h-[46px]">
          {copy.surveyCta}
        </Button>
      )}
    </div>
  );
}
