"use client";

import {
  Camera,
  Check,
  Clock3,
  Eye,
  FileCode2,
  Gauge,
  Languages,
  LockKeyhole,
  Mic,
  Play,
  RotateCcw,
  Send,
} from "lucide-react";
import { memo, useMemo, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { formatTime, type TestStatus } from "./config";
import { AssessmentFrame, CandidatePreview, LockedDeviceStatus, RoomHeader } from "./shared";

const CodeEditor = memo(function CodeEditor({ code, onChange }: { code: string; onChange: (value: string) => void }) {
  const lineNumbers = useMemo(() => Array.from({ length: code.split("\n").length }, (_, index) => index + 1), [code]);
  const insertsTabs = useRef(true);

  return (
    <div className="grid min-h-[46svh] flex-1 grid-cols-[36px_minmax(0,1fr)] overflow-hidden bg-editor text-white sm:min-h-[380px] sm:grid-cols-[46px_minmax(0,1fr)] md:min-h-0">
      <div aria-hidden="true" className="select-none border-r border-white/5 bg-editor-soft py-3 pr-2 text-right font-mono text-xs leading-6 text-white/35 sm:py-4 sm:pr-3">{lineNumbers.map((line) => <div key={line}>{line}</div>)}</div>
      <textarea
        aria-label="TypeScript code editor"
        aria-describedby="editor-keyboard-help"
        value={code}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => { insertsTabs.current = true; }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            insertsTabs.current = false;
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
        className="min-h-[46svh] resize-none scroll-pb-24 overflow-auto bg-transparent p-3 font-mono text-base leading-6 whitespace-pre text-white/85 outline-none selection:bg-brand/60 sm:min-h-[380px] sm:p-4 md:min-h-0 lg:text-sm"
      />
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
      <RoomHeader label="Coding / Question 3 of 4" detail="Your draft saves automatically" progress={66} />
      <AssessmentFrame className="md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[var(--assessment-rail)_minmax(0,1fr)]">
        <Card className="flex max-h-[360px] min-h-0 flex-col overflow-hidden shadow-none md:h-full md:max-h-none">
          <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line px-[var(--assessment-panel-pad)]">
            <Badge>Question 3 of 4</Badge>
            <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-ink-soft"><Clock3 className="size-3.5" /> {formatTime(timeRemaining)}</span>
          </div>

          <CardContent className="min-h-0 flex-1 overflow-y-auto p-[var(--assessment-panel-pad)] text-sm leading-6 text-muted">
            <h1 tabIndex={-1} data-stage-heading className="stage-focus text-lg font-semibold tracking-[-0.02em] text-ink">First unique character</h1>
            <p className="mt-3">Return the index of the first character that appears exactly once. Return <code className="rounded bg-surface-soft px-1.5 py-0.5 font-mono text-brand">-1</code> if none exists.</p>
            <details className="mt-4 rounded-xl bg-surface-soft md:hidden">
              <summary className="cursor-pointer px-3 py-2.5 text-xs font-semibold text-ink-soft">Examples and constraints</summary>
              <div className="border-t border-line p-3 font-mono text-xs leading-6 text-ink-soft">
                <p><span className="text-muted">input</span> &nbsp;&quot;leetcode&quot;</p><p><span className="text-muted">output</span> 0</p>
                <div className="my-1.5 h-px bg-line" />
                <p><span className="text-muted">input</span> &nbsp;&quot;loveleetcode&quot;</p><p><span className="text-muted">output</span> 2</p>
                <p className="mt-2 font-sans text-[11px] text-muted">1-100,000 lowercase characters / aim for linear time</p>
              </div>
            </details>
            <div className="mt-4 hidden rounded-xl bg-surface-soft p-3 font-mono text-xs leading-6 text-ink-soft md:block">
              <p><span className="text-muted">input</span> &nbsp;&quot;leetcode&quot;</p><p><span className="text-muted">output</span> 0</p>
              <div className="my-1.5 h-px bg-line" />
              <p><span className="text-muted">input</span> &nbsp;&quot;loveleetcode&quot;</p><p><span className="text-muted">output</span> 2</p>
            </div>
            <div className="mt-4 hidden md:block"><p className="font-semibold text-ink-soft">Constraints</p><ul className="mt-1.5 space-y-1 text-xs"><li>1 to 100,000 characters</li><li>Lowercase English letters</li><li>Aim for linear time</li></ul></div>
            <div className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-xs leading-5"><LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-brand" /> The timer is active. Submit when your solution is ready.</div>
          </CardContent>

          <div className="shrink-0 border-t border-line p-[var(--assessment-panel-pad)]">
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 md:hidden">
              <CandidatePreview stream={stream} className="w-full rounded-xl" />
              <div className="space-y-2 text-[11px] font-semibold text-ink-soft">
                <span className="flex items-center gap-2"><Camera className="size-3.5 text-brand" /> Camera locked on</span>
                <span className="flex items-center gap-2"><Mic className="size-3.5 text-brand" /> Microphone locked on</span>
              </div>
            </div>
            <div className="hidden md:block">
              <CandidatePreview stream={stream} className="w-full" />
              <div className="mt-2"><LockedDeviceStatus compact className="grid-cols-1 xl:grid-cols-2" /></div>
            </div>
          </div>
        </Card>

        <section className="flex min-h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] min-w-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface shadow-card md:h-full md:min-h-0">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-[var(--assessment-panel-pad)]">
            <div className="flex items-center gap-2"><div className="flex h-8 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-soft"><FileCode2 className="size-3.5 text-brand" /> solution.ts</div><span className="hidden items-center gap-1 text-xs text-muted sm:flex"><Languages className="size-3.5" /> TypeScript</span></div>
            <div className="flex items-center gap-4 text-[11px] font-medium text-muted"><span className="hidden items-center gap-1.5 xl:flex"><Eye className="size-3.5 text-brand" /> Monitoring active</span><span className="flex items-center gap-1 text-brand"><Check className="size-3.5" /> Saved</span></div>
          </div>

          <CodeEditor code={code} onChange={onCodeChange} />

          <div className="shrink-0 border-t border-white/5 bg-editor text-white/75">
            <div className="flex h-9 items-center justify-between border-b border-white/5 px-[var(--assessment-panel-pad)]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50"><Gauge className="size-3.5" /> Test output</div>
              {testStatus === "passed" && <Badge className="bg-brand/50 text-emerald-100">3 / 3 passed</Badge>}
            </div>
            <div className="min-h-16 p-3 font-mono text-xs leading-5">
              {testStatus === "idle" && <span className="text-white/40">Run the sample tests when ready.</span>}
              {testStatus === "running" && <span className="flex items-center gap-2"><RotateCcw className="size-3.5 animate-spin" /> Running tests...</span>}
              {testStatus === "passed" && <div className="flex flex-wrap gap-x-5 gap-y-1 text-emerald-200"><span>Pass: leetcode -&gt; 0</span><span>Pass: loveleetcode -&gt; 2</span><span>Pass: aabb -&gt; -1</span></div>}
            </div>
          </div>

          <div className="h-[76px] shrink-0 md:hidden" aria-hidden="true" />
          <div className="mobile-action-bar fixed inset-x-0 bottom-0 z-30 flex shrink-0 items-center justify-between gap-3 border-t border-line bg-surface px-4 pt-2.5 shadow-[0_-12px_32px_rgba(25,52,44,0.08)] md:static md:px-[var(--assessment-panel-pad)] md:shadow-none">
            <p id="editor-keyboard-help" className="hidden text-[11px] text-muted sm:block">Tab indents / Escape then Tab leaves the editor / Autosaved</p>
            <div className="mx-auto flex w-full max-w-md gap-2 sm:w-auto md:mx-0"><Button variant="outline" size="sm" className="h-11 flex-1 lg:h-9 lg:flex-none" onClick={onRunTests} disabled={testStatus === "running"}><Play /> Run tests</Button><Button size="sm" className="h-11 flex-1 lg:h-9 lg:flex-none" onClick={onSubmit}>Submit solution <Send /></Button></div>
          </div>
        </section>
      </AssessmentFrame>
    </main>
  );
}
