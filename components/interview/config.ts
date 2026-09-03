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
export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "go"
  | "rust"
  | "kotlin"
  | "swift"
  | "php"
  | "ruby"
  | "sql";

export const codeLanguageOrder = [
  "typescript",
  "javascript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "kotlin",
  "swift",
  "php",
  "ruby",
  "sql",
] as const satisfies readonly CodeLanguage[];

export const assessment = {
  id: "PS-2048-FE",
  role: "Frontend Engineer",
  candidate: "Alex Chen",
  durationMinutes: 35,
  codingLanguages: codeLanguageOrder,
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
  syntaxName: string;
  starterCode: string;
}> = {
  typescript: {
    label: "TypeScript",
    fileName: "solution.ts",
    syntaxName: "TypeScript",
    starterCode: `function firstUniqueCharacter(value: string): number {
  // Return the index of the first character that appears once.
  // Return -1 when every character repeats.

  return -1;
}`,
  },
  javascript: {
    label: "JavaScript",
    fileName: "solution.js",
    syntaxName: "JavaScript",
    starterCode: `function firstUniqueCharacter(value) {
  // Return the index of the first character that appears once.
  // Return -1 when every character repeats.

  return -1;
}`,
  },
  python: {
    label: "Python",
    fileName: "solution.py",
    syntaxName: "Python",
    starterCode: `def first_unique_character(value: str) -> int:
    # Return the index of the first character that appears once.
    # Return -1 when every character repeats.

    return -1`,
  },
  java: {
    label: "Java",
    fileName: "Solution.java",
    syntaxName: "Java",
    starterCode: `class Solution {
  public int firstUniqueCharacter(String value) {
    // Return the index of the first character that appears once.
    // Return -1 when every character repeats.

    return -1;
  }
}`,
  },
  c: {
    label: "C",
    fileName: "solution.c",
    syntaxName: "C",
    starterCode: `int first_unique_character(const char *value) {
  // Return the index of the first character that appears once.
  // Return -1 when every character repeats.

  return -1;
}`,
  },
  cpp: {
    label: "C++",
    fileName: "solution.cpp",
    syntaxName: "C++",
    starterCode: `#include <string>

int firstUniqueCharacter(const std::string& value) {
  // Return the index of the first character that appears once.
  // Return -1 when every character repeats.

  return -1;
}`,
  },
  csharp: {
    label: "C#",
    fileName: "Solution.cs",
    syntaxName: "C#",
    starterCode: `public class Solution {
  public int FirstUniqueCharacter(string value) {
    // Return the index of the first character that appears once.
    // Return -1 when every character repeats.

    return -1;
  }
}`,
  },
  go: {
    label: "Go",
    fileName: "solution.go",
    syntaxName: "Go",
    starterCode: `package solution

func firstUniqueCharacter(value string) int {
	// Return the index of the first character that appears once.
	// Return -1 when every character repeats.

	return -1
}`,
  },
  rust: {
    label: "Rust",
    fileName: "solution.rs",
    syntaxName: "Rust",
    starterCode: `fn first_unique_character(value: &str) -> i32 {
    // Return the index of the first character that appears once.
    // Return -1 when every character repeats.

    -1
}`,
  },
  kotlin: {
    label: "Kotlin",
    fileName: "Solution.kt",
    syntaxName: "Kotlin",
    starterCode: `fun firstUniqueCharacter(value: String): Int {
    // Return the index of the first character that appears once.
    // Return -1 when every character repeats.

    return -1
}`,
  },
  swift: {
    label: "Swift",
    fileName: "Solution.swift",
    syntaxName: "Swift",
    starterCode: `func firstUniqueCharacter(_ value: String) -> Int {
    // Return the index of the first character that appears once.
    // Return -1 when every character repeats.

    return -1
}`,
  },
  php: {
    label: "PHP",
    fileName: "solution.php",
    syntaxName: "PHP",
    starterCode: `<?php

function firstUniqueCharacter(string $value): int {
    // Return the index of the first character that appears once.
    // Return -1 when every character repeats.

    return -1;
}`,
  },
  ruby: {
    label: "Ruby",
    fileName: "solution.rb",
    syntaxName: "Ruby",
    starterCode: `def first_unique_character(value)
  # Return the index of the first character that appears once.
  # Return -1 when every character repeats.

  -1
end`,
  },
  sql: {
    label: "SQL",
    fileName: "solution.sql",
    syntaxName: "SQL",
    starterCode: `-- Return one row containing the first unique character index.
-- Return -1 when every character repeats.

SELECT -1 AS first_unique_index;`,
  },
};

export const starterCode = codeLanguages.typescript.starterCode;

export const starterCodeDrafts = Object.fromEntries(
  codeLanguageOrder.map((language) => [language, codeLanguages[language].starterCode]),
) as Record<CodeLanguage, string>;

export const CODE_DRAFT_KEY = `posso:${assessment.id}:code:v1`;

export function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
