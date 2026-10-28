import { timeAgo } from "@/lib/time";
import type { Signup } from "@/types/waitlist";
import { Avatar, SurveyChip } from "./Indicators";

/** Compact signup line: avatar, email, source and age, survey status. */
export function SignupRow({ signup, className = "" }: { signup: Signup; className?: string }) {
  return (
    <li className={`flex items-center gap-3 ${className}`}>
      <Avatar email={signup.email} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{signup.email}</p>
        <p className="truncate text-xs text-muted">
          {signup.source || "direct"} · {timeAgo(signup.created_at)}
        </p>
      </div>
      <SurveyChip done={signup.did_survey} />
    </li>
  );
}
