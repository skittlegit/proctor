export type Stage =
  | "welcome"
  | "setup"
  | "countdown"
  | "conversation"
  | "coding"
  | "explanation"
  | "complete";

export type AnswerMode = "asking" | "answering" | "saved";
export type TestStatus = "idle" | "running" | "passed";
export type MediaStatus = "idle" | "requesting" | "ready" | "unavailable";

export const assessment = {
  id: "PS-2048-FE",
  role: "Frontend Engineer",
  candidate: "Alex Chen",
  durationMinutes: 35,
  codingSeconds: 12 * 60,
  questions: [
    {
      label: "Introduction",
      prompt:
        "Tell me a little about yourself and what drew you to frontend engineering.",
      note: "Focus on the experience that is most relevant to this role.",
    },
    {
      label: "Experience",
      prompt:
        "Tell me about a project where you improved a user experience. What was your role, and what changed?",
      note: "Describe your decisions, your contribution, and the outcome.",
    },
  ],
} as const;

export const starterCode = `function firstUniqueCharacter(value: string): number {
  // Return the index of the first character that appears once.
  // Return -1 when every character repeats.

  return -1;
}`;

export const CODE_DRAFT_KEY = `posso:${assessment.id}:code:v1`;

export function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
