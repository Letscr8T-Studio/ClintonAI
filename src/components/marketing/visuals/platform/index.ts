import type { ComponentType } from "react";
import type { PlatformVisual } from "@/content/platform";
import { SafetyVisual } from "./SafetyVisual";
import { AgentVisual, ReachVisual, TeamVisual } from "./ScaleVisuals";
import { AssistantVisual, InboxVisual, OutreachVisual } from "./WorkflowVisuals";

/** Maps a pillar's `visual` key (content/platform.ts) to its illustration. */
export const platformVisuals: Record<PlatformVisual, ComponentType> = {
  safety: SafetyVisual,
  assistant: AssistantVisual,
  outreach: OutreachVisual,
  inbox: InboxVisual,
  agent: AgentVisual,
  team: TeamVisual,
  reach: ReachVisual,
};
