"use client";

import {
  Camera,
  ChevronDown,
  FileCode2,
  Gauge,
  Mic,
  Play,
  RotateCcw,
  Save,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import CodeEditor from "./code-editor";
import { assessment, codeLanguages, formatTime, type CodeLanguage, type TestStatus } from "./config";
import { AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";

export default function CodingStage({
  code,
  language,
  sessionElapsed,
  testStatus,
  stream,
  onCodeChange,
  onLanguageChange,
  onRunTests,
  onSubmit,
}: {
  code: string;
  language: CodeLanguage;
  sessionElapsed: number;
  testStatus: TestStatus;
  stream: MediaStream | null;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: CodeLanguage) => void;
  onRunTests: () => void;
  onSubmit: () => void;
}) {
  const languageConfig = codeLanguages[language];
  const challenge = assessment.codingChallenge;

  return (
    <main id="assessment-main" className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Coding exercise" detail={`${formatTime(sessionElapsed)} elapsed`} />
      <AssessmentFrame className="md:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_var(--assessment-rail)]">
        <aside className="flex max-h-[18rem] min-h-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:order-2 md:grid md:h-full md:max-h-none md:grid-rows-[auto_minmax(0,1fr)] md:gap-4 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent">
          <div className="shrink-0 border-b border-line bg-surface-soft px-[var(--assessment-panel-pad)] py-2 md:border-0 md:bg-transparent md:p-0">
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 md:hidden">
              <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />
              <div className="space-y-2 text-xs text-muted">
                <span className="flex items-center gap-2"><Camera className="size-3.5" /> Camera on</span>
                <span className="flex items-center gap-2"><Mic className="size-3.5" /> Microphone on</span>
              </div>
            </div>
            <div className="hidden md:block">
              <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />
            </div>
          </div>

          <section className="order-2 flex min-h-0 flex-1 flex-col overflow-hidden md:rounded-[var(--assessment-radius)] md:border md:border-line md:bg-surface">
            <div className="flex h-12 shrink-0 items-center border-b border-line px-[var(--assessment-panel-pad)]">
              <Badge tone="neutral">Coding brief</Badge>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-[var(--assessment-panel-pad)] text-sm leading-6 text-muted">
              <h1 className="text-lg font-semibold tracking-[-0.02em] text-ink">{challenge.title}</h1>
              <p className="mt-3 break-words text-xs leading-5">{challenge.description}</p>

              <p className="mt-4 font-semibold text-ink-soft">Examples</p>
              <div className="mt-1.5 divide-y divide-line font-mono text-xs leading-5 text-ink-soft">
                {challenge.examples.map((example) => (
                  <p key={example.input} className="py-2">
                    <span className="text-muted">input</span> &nbsp;&quot;{example.input}&quot;<br />
                    <span className="text-muted">output</span> {example.output}
                  </p>
                ))}
              </div>

              <p className="mt-4 font-semibold text-ink-soft">Constraints</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs">
                {challenge.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}
              </ul>

              <div className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-xs leading-5"><Save className="mt-0.5 size-3.5 shrink-0" /> Your draft saves automatically in this browser.</div>
            </div>
          </section>

        </aside>

        <section className="flex min-h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] min-w-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:order-1 md:h-full md:min-h-0">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-[var(--assessment-panel-pad)]">
            <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-ink-soft">
              <FileCode2 className="size-4 shrink-0" />
              <span className="truncate">{challenge.title}</span>
              <span className="hidden shrink-0 font-mono font-normal text-muted lg:inline">/ {languageConfig.fileName}</span>
            </div>
            <div className="relative ml-3 shrink-0">
              <select
                aria-label="Programming language"
                name="programming_language"
                autoComplete="off"
                value={language}
                onChange={(event) => onLanguageChange(event.target.value as CodeLanguage)}
                className="h-8 appearance-none rounded-lg border border-line bg-surface-soft pl-3 pr-8 text-xs font-semibold text-ink-soft outline-none transition-colors hover:border-ink-soft focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/15"
              >
                {assessment.codingLanguages.map((option) => (
                  <option key={option} value={option}>{codeLanguages[option].label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2 size-3.5 text-muted" aria-hidden="true" />
            </div>
          </div>

          <CodeEditor key={language} code={code} language={language} onChange={onCodeChange} />

          <div className="shrink-0 border-t border-code-line bg-code-gutter text-ink-soft" role="status" aria-live="polite" aria-atomic="true">
            <div className="flex h-9 items-center justify-between border-b border-code-line px-[var(--assessment-panel-pad)]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft"><Gauge className="size-3.5" /> Sample output</div>
              {testStatus === "passed" && <Badge tone="success">Preview ready</Badge>}
            </div>
            <div className="min-h-16 p-3 font-mono text-xs leading-5">
              {testStatus === "idle" && <span className="text-muted">Preview the expected sample results when ready.</span>}
              {testStatus === "running" && <span className="flex items-center gap-2"><RotateCcw className="size-3.5 animate-spin" /> Preparing expected results…</span>}
              {testStatus === "passed" && <div className="flex flex-wrap gap-x-5 gap-y-1 text-success"><span>Expected: leetcode → 0</span><span>Expected: loveleetcode → 2</span><span>Expected: aabb → -1</span></div>}
            </div>
          </div>

          <div className="h-[76px] shrink-0 md:hidden" aria-hidden="true" />
          <div className="mobile-action-bar fixed inset-x-0 bottom-0 z-30 flex shrink-0 items-center justify-between gap-4 border-t border-line bg-surface px-4 pt-2.5 md:static md:min-h-16 md:px-[var(--assessment-panel-pad)] md:py-2.5">
            <p id="editor-keyboard-help" className="sr-only">Tab indents. Press Escape, then Tab, to leave the editor.</p>
            <div className="hidden min-w-0 md:block">
              <p className="text-xs font-semibold text-ink-soft">Ready for the walkthrough?</p>
              <p className="mt-0.5 text-[11px] text-muted">Submitting locks editing and opens your explanation.</p>
            </div>
            <div className="mx-auto flex w-full max-w-md gap-2 sm:w-auto md:mx-0 md:ml-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={onRunTests} disabled={testStatus === "running"}><Play /> Preview Examples</Button>
              <Button size="sm" className="flex-1 sm:min-w-28" onClick={onSubmit}>Submit</Button>
            </div>
          </div>
        </section>
      </AssessmentFrame>
    </main>
  );
}
