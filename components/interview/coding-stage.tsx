"use client";

import {
  Camera,
  Clock3,
  FileCode2,
  Gauge,
  LockKeyhole,
  Mic,
  Play,
  RotateCcw,
  Send,
} from "lucide-react";
import { memo, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatTime, type TestStatus } from "./config";
import { AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";

const CodeEditor = memo(function CodeEditor({ code, onChange }: { code: string; onChange: (value: string) => void }) {
  const lineNumbers = useMemo(() => Array.from({ length: code.split("\n").length }, (_, index) => index + 1), [code]);
  const insertsTabs = useRef(true);
  const [keyboardMessage, setKeyboardMessage] = useState("");

  return (
    <div className="relative grid min-h-[46svh] flex-1 grid-cols-[36px_minmax(0,1fr)] overflow-hidden bg-editor text-white sm:min-h-[380px] sm:grid-cols-[46px_minmax(0,1fr)] md:min-h-0">
      <div aria-hidden="true" className="select-none border-r border-white/10 bg-editor-soft py-3 pr-2 text-right font-mono text-xs leading-6 text-white/50 sm:py-4 sm:pr-3">{lineNumbers.map((line) => <div key={line}>{line}</div>)}</div>
      <textarea
        aria-label="TypeScript code editor"
        aria-describedby="editor-keyboard-help editor-keyboard-status"
        value={code}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          insertsTabs.current = true;
          setKeyboardMessage("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            insertsTabs.current = false;
            setKeyboardMessage("Tab now moves focus out of the editor.");
            return;
          }
          if (event.key !== "Tab" || !insertsTabs.current || event.shiftKey) return;
          event.preventDefault();
          const element = event.currentTarget;
          const start = element.selectionStart;
          const end = element.selectionEnd;
          onChange(`${code.slice(0, start)}  ${code.slice(end)}`);
          requestAnimationFrame(() => {
            element.selectionStart = start + 2;
            element.selectionEnd = start + 2;
          });
        }}
        wrap="off"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        className="min-h-[46svh] resize-none scroll-pb-24 overflow-auto bg-transparent p-3 font-mono text-base leading-6 whitespace-pre text-white/90 outline-none selection:bg-white/20 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 sm:min-h-[380px] sm:p-4 md:min-h-0 lg:text-sm"
      />
      <span id="editor-keyboard-status" className="sr-only" aria-live="polite">{keyboardMessage}</span>
    </div>
  );
});

export default function CodingStage({
  code,
  timeRemaining,
  testStatus,
  stream,
  onCodeChange,
  onRunTests,
  onSubmit,
}: {
  code: string;
  timeRemaining: number;
  testStatus: TestStatus;
  stream: MediaStream | null;
  onCodeChange: (code: string) => void;
  onRunTests: () => void;
  onSubmit: () => void;
}) {
  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Coding / Question 3 of 4" detail="Timed code workspace" progress={66} />
      <AssessmentFrame className="md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[var(--assessment-rail)_minmax(0,1fr)]">
        <section className="flex max-h-[360px] min-h-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full md:max-h-none">
          <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line px-[var(--assessment-panel-pad)]">
            <Badge tone="neutral">Coding brief</Badge>
            <span aria-label={`${formatTime(timeRemaining)} remaining`} className="flex items-center gap-1.5 font-mono text-xs font-semibold text-ink-soft"><Clock3 className="size-3.5" /> {formatTime(timeRemaining)}</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-[var(--assessment-panel-pad)] text-sm leading-6 text-muted">
            <h1 tabIndex={-1} data-stage-heading className="stage-focus text-lg font-semibold tracking-[-0.02em] text-ink">First unique character</h1>
            <p className="mt-3">Return the index of the first character that appears exactly once. Return <code className="bg-surface-strong px-1.5 py-0.5 font-mono text-ink">-1</code> if none exists.</p>

            <details className="mt-4 border-y border-line md:hidden">
              <summary className="cursor-pointer px-1 py-3 text-xs font-semibold text-ink-soft outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset">Examples and constraints</summary>
              <div className="border-t border-line px-1 py-3 font-mono text-xs leading-6 text-ink-soft">
                <p><span className="text-muted">input</span> &nbsp;&quot;leetcode&quot;</p><p><span className="text-muted">output</span> 0</p>
                <div className="my-1.5 h-px bg-line" />
                <p><span className="text-muted">input</span> &nbsp;&quot;loveleetcode&quot;</p><p><span className="text-muted">output</span> 2</p>
                <p className="mt-2 font-sans text-xs text-muted">1–100,000 lowercase characters · aim for linear time</p>
              </div>
            </details>

            <div className="mt-4 hidden border-y border-line py-3 font-mono text-xs leading-6 text-ink-soft md:block">
              <p><span className="text-muted">input</span> &nbsp;&quot;leetcode&quot;</p><p><span className="text-muted">output</span> 0</p>
              <div className="my-1.5 h-px bg-line" />
              <p><span className="text-muted">input</span> &nbsp;&quot;loveleetcode&quot;</p><p><span className="text-muted">output</span> 2</p>
            </div>
            <div className="mt-4 hidden md:block"><p className="font-semibold text-ink-soft">Constraints</p><ul className="mt-1.5 space-y-1 text-xs"><li>1 to 100,000 characters</li><li>Lowercase English letters</li><li>Aim for linear time</li></ul></div>
            <div className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-xs leading-5"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" /> The timer is active. Submit when your solution is ready.</div>
          </div>

          <div className="shrink-0 border-t border-line p-[var(--assessment-panel-pad)]">
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 md:hidden">
              <CandidatePreview stream={stream} className="w-full rounded-lg" />
              <div className="space-y-2 text-xs text-muted">
                <span className="flex items-center gap-2"><Camera className="size-3.5" /> Camera on</span>
                <span className="flex items-center gap-2"><Mic className="size-3.5" /> Microphone on</span>
              </div>
            </div>
            <div className="hidden md:block">
              <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />
              <p className="mt-3 flex items-center gap-2 text-xs text-muted"><span className="size-1.5 rounded-full bg-muted" /> Camera and microphone remain connected</p>
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] min-w-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full md:min-h-0">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-[var(--assessment-panel-pad)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft"><FileCode2 className="size-4" /> solution.ts <span className="font-normal text-muted">· TypeScript</span></div>
            <span className="text-xs font-medium text-muted">Draft in progress</span>
          </div>

          <CodeEditor code={code} onChange={onCodeChange} />

          <div className="shrink-0 border-t border-white/10 bg-editor text-white/80" role="status" aria-live="polite" aria-atomic="true">
            <div className="flex h-9 items-center justify-between border-b border-white/10 px-[var(--assessment-panel-pad)]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70"><Gauge className="size-3.5" /> Sample output</div>
              {testStatus === "passed" && <Badge tone="success">Preview ready</Badge>}
            </div>
            <div className="min-h-16 p-3 font-mono text-xs leading-5">
              {testStatus === "idle" && <span className="text-white/60">Preview the expected sample results when ready.</span>}
              {testStatus === "running" && <span className="flex items-center gap-2"><RotateCcw className="size-3.5 animate-spin" /> Preparing expected results…</span>}
              {testStatus === "passed" && <div className="flex flex-wrap gap-x-5 gap-y-1 text-emerald-200"><span>Expected: leetcode → 0</span><span>Expected: loveleetcode → 2</span><span>Expected: aabb → -1</span></div>}
            </div>
          </div>

          <div className="h-[76px] shrink-0 md:hidden" aria-hidden="true" />
          <div className="mobile-action-bar fixed inset-x-0 bottom-0 z-30 flex shrink-0 items-center justify-between gap-3 border-t border-line bg-surface px-4 pt-2.5 md:static md:min-h-14 md:px-[var(--assessment-panel-pad)] md:py-2">
            <p id="editor-keyboard-help" className="hidden text-xs text-muted sm:block">Tab indents · Escape then Tab leaves the editor</p>
            <div className="mx-auto flex w-full max-w-md gap-2 sm:w-auto md:mx-0 md:ml-auto"><Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={onRunTests} disabled={testStatus === "running"}><Play /> Preview examples</Button><Button size="sm" className="flex-1 sm:flex-none" onClick={onSubmit}>Submit solution <Send /></Button></div>
          </div>
        </section>
      </AssessmentFrame>
    </main>
  );
}
