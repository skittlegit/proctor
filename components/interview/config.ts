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
export type CodeLanguage = "typescript" | "javascript" | "python" | "java";

export const assessment = {
  id: "PS-2048-FE",
  role: "Frontend Engineer",
  candidate: "Alex Chen",
  durationMinutes: 35,
  codingLanguages: ["typescript", "javascript"] satisfies CodeLanguage[],
  codingChallenge: {
    title: "First unique character",
    description:
      "Return the index of the first character that appears exactly once. Return -1 if none exists.",
    examples: [
      { input: "leetcode", output: "0" },
      { input: "loveleetcode", output: "2" },
      { input: "aabb", output: "-1" },
    ],
    constraints: [
      "The input contains 1 to 100,000 characters",
      "The input contains lowercase English letters",
      "Aim for linear time and linear or better auxiliary space",
    ],
  },
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

export const codeLanguages: Record<CodeLanguage, {
  label: string;
  fileName: string;
  starterCode: string;
}> = {
  typescript: {
    label: "TypeScript",
    fileName: "solution.ts",
    starterCode: `function firstUniqueCharacter(value: string): number {
  // Return the index of the first character that appears once.
  // Return -1 when every character repeats.

  return -1;
}`,
  },
  javascript: {
    label: "JavaScript",
    fileName: "solution.js",
    starterCode: `function firstUniqueCharacter(value) {
  // Return the index of the first character that appears once.
  // Return -1 when every character repeats.

  return -1;
}`,
  },
  python: {
    label: "Python",
    fileName: "solution.py",
    starterCode: `def first_unique_character(value: str) -> int:
    # Return the index of the first character that appears once.
    # Return -1 when every character repeats.

    return -1`,
  },
  java: {
    label: "Java",
    fileName: "Solution.java",
    starterCode: `class Solution {
  public int firstUniqueCharacter(String value) {
    // Return the index of the first character that appears once.
    // Return -1 when every character repeats.

    return -1;
  }
}`,
  },
};

export const starterCode = codeLanguages.typescript.starterCode;

export const starterCodeDrafts: Record<CodeLanguage, string> = {
  typescript: codeLanguages.typescript.starterCode,
  javascript: codeLanguages.javascript.starterCode,
  python: codeLanguages.python.starterCode,
  java: codeLanguages.java.starterCode,
};

export const CODE_DRAFT_KEY = `posso:${assessment.id}:code:v1`;

export function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
