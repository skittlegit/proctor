import type { ReactNode } from "react";

// Only the current stage is mounted. Animation is visual and cannot hold
// navigation, prompt playback, or media cleanup open.
export function StageTransition({ stageKey, children }: {
  stageKey: string;
  children: ReactNode;
}) {
  return <div key={stageKey} className="assessment-stage stage-enter">{children}</div>;
}
