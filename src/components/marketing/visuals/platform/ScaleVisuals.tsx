import { agentSample, teamSample } from "@/content/platform-samples";

// Illustrations for the agent guardrails, teams and reach pillars.

export function AgentVisual() {
  const key = (k: string) => <span className="text-white">&quot;{k}&quot;</span>;
  const value = (v: string) => <span className="text-amber">{v}</span>;
  return (
    <pre className="m-0 overflow-hidden rounded-[20px] bg-white/[0.06] p-3.5 font-mono text-[12px] leading-[1.7] whitespace-pre text-navy-text">
      <span className="text-brand-soft">{agentSample.method}</span> {agentSample.path}
      {"\n{ "}
      {key("status")}: {value(`"${agentSample.status}"`)},{"\n  "}
      {key("reason")}: {value(`"${agentSample.reason[0]}`)}
      {"\n  "}
      {value(`${agentSample.reason[1]}"`)} {"}"}
    </pre>
  );
}

export function TeamVisual() {
  return (
    <div className="flex flex-col gap-2 rounded-[20px] bg-brand-wash p-3.5">
      <div className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 text-[12.5px]">
        <span className="text-body">{teamSample.rule}</span>
        <span className="rounded-full bg-ink px-2 py-0.5 text-[10.5px] font-semibold text-white">
          {teamSample.ruleState}
        </span>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
        <span className="flex -space-x-1.5">
          {teamSample.avatarColors.map((color) => (
            <span
              key={color}
              className="size-6 rounded-full border-2 border-white"
              style={{ background: color }}
            />
          ))}
        </span>
        <span className="text-[12px] text-subtle">{teamSample.members} teammates</span>
      </div>
    </div>
  );
}

export function ReachVisual() {
  return (
    <div className="flex items-end justify-center gap-2.5 rounded-[20px] bg-brand-wash px-3.5 pt-4 pb-0">
      <div className="h-[74px] w-[46%] rounded-t-xl border border-b-0 border-line-strong bg-white p-2">
        <span className="block h-1.5 w-1/2 rounded-full bg-brand-mist" />
        <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-line-soft" />
        <span className="mt-3 block h-4 w-12 rounded-md bg-brand" />
      </div>
      <div className="h-[86px] w-[24%] rounded-t-[16px] border-[3px] border-b-0 border-ink bg-white p-1.5">
        <span className="mx-auto block h-1 w-5 rounded-full bg-ink" />
        <span className="mt-2 block h-1.5 w-3/4 rounded-full bg-brand-mist" />
        <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-line-soft" />
      </div>
    </div>
  );
}
